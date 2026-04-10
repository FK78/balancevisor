import { db } from "@/index";
import { transactionsTable } from "@/db/schema";
import { and, eq, gte, desc } from "drizzle-orm";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { getMonthRange } from "@/lib/date";
import {
  inferRecurringPattern,
  MIN_RECURRING_OCCURRENCES,
  isAmountConsistent,
} from "@/lib/recurring-utils";
import { normalise } from "@/lib/matching-utils";

export type RecurringCandidate = {
  description: string;
  amount: number;
  type: "income" | "expense";
  occurrences: number;
  /** Average days between occurrences */
  avgDaysBetween: number;
  /** Likely pattern based on interval */
  suggestedPattern: "weekly" | "biweekly" | "monthly" | "yearly";
  /** Most recent occurrence date */
  lastDate: string;
  /** ID of the most recent matching transaction */
  latestTransactionId: string;
};

/**
 * Scans recent non-recurring transactions to find repeated merchants/descriptions
 * at similar amounts that look like they should be marked as recurring.
 * Uses fuzzy matching on descriptions and ±15% amount tolerance.
 */
export async function detectRecurringCandidates(userId: string): Promise<RecurringCandidate[]> {
  // Look back 4 months for patterns
  const fourMonthsAgo = getMonthRange(4);

  const rows = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      date: transactionsTable.date,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.is_recurring, false),
        gte(transactionsTable.date, fourMonthsAgo.start),
      ),
    )
    .orderBy(desc(transactionsTable.date));

  if (rows.length === 0) return [];

  const userKey = await getUserKey(userId);

  // Decrypt descriptions and normalize
  const txns = rows
    .filter((r) => r.description && r.date && (r.type === "income" || r.type === "expense"))
    .map((r) => ({
      id: r.id,
      description: decryptForUser(r.description!, userKey),
      amount: r.amount,
      type: r.type as "income" | "expense",
      date: r.date!,
    }));

  // Group by normalized description key
  const groups = new Map<
    string,
    { description: string; type: "income" | "expense"; entries: { id: string; amount: number; date: string }[] }
  >();

  for (const txn of txns) {
    const key = normalise(txn.description) + "|" + txn.type;
    const existing = groups.get(key);
    if (existing) {
      existing.entries.push({ id: txn.id, amount: txn.amount, date: txn.date });
    } else {
      groups.set(key, {
        description: txn.description,
        type: txn.type,
        entries: [{ id: txn.id, amount: txn.amount, date: txn.date }],
      });
    }
  }

  const candidates: RecurringCandidate[] = [];

  for (const [, group] of groups) {
    if (group.entries.length < MIN_RECURRING_OCCURRENCES) continue;

    // Check amount consistency (all within ±15% of median)
    const amounts = group.entries.map((e) => e.amount).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    if (!isAmountConsistent(amounts)) continue;

    // Compute intervals between occurrences
    const dates = group.entries
      .map((e) => e.date)
      .sort()
      .map((d) => new Date(d + "T00:00:00").getTime());

    const intervals: number[] = [];
    for (let i = 1; i < dates.length; i++) {
      intervals.push(Math.round((dates[i] - dates[i - 1]) / (1000 * 60 * 60 * 24)));
    }

    const avgDays = intervals.reduce((s, d) => s + d, 0) / intervals.length;

    // Determine pattern from average interval
    const pattern = inferRecurringPattern(avgDays);
    if (!pattern) continue;

    const sortedByDate = [...group.entries].sort((a, b) => a.date.localeCompare(b.date));
    candidates.push({
      description: group.description,
      amount: Math.round(median * 100) / 100,
      type: group.type,
      occurrences: group.entries.length,
      avgDaysBetween: Math.round(avgDays),
      suggestedPattern: pattern as RecurringCandidate["suggestedPattern"],
      lastDate: sortedByDate[sortedByDate.length - 1].date,
      latestTransactionId: sortedByDate[sortedByDate.length - 1].id,
    });
  }

  // Sort by occurrence count desc, then amount desc
  candidates.sort((a, b) => b.occurrences - a.occurrences || b.amount - a.amount);
  return candidates.slice(0, 8);
}

// normalizeDescription and inferPattern are now shared via @/lib/recurring-utils
