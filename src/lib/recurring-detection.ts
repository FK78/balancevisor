import { db } from "@/index";
import { transactionsTable, accountsTable } from "@/db/schema";
import { and, eq, gte, desc } from "drizzle-orm";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { getMonthRange } from "@/lib/date";

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
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      date: transactionsTable.date,
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(accountsTable.user_id, userId),
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
      description: decryptForUser(r.description!, userKey),
      amount: r.amount,
      type: r.type as "income" | "expense",
      date: r.date!,
    }));

  // Group by normalized description key
  const groups = new Map<
    string,
    { description: string; type: "income" | "expense"; entries: { amount: number; date: string }[] }
  >();

  for (const txn of txns) {
    const key = normalizeDescription(txn.description) + "|" + txn.type;
    const existing = groups.get(key);
    if (existing) {
      existing.entries.push({ amount: txn.amount, date: txn.date });
    } else {
      groups.set(key, {
        description: txn.description,
        type: txn.type,
        entries: [{ amount: txn.amount, date: txn.date }],
      });
    }
  }

  const candidates: RecurringCandidate[] = [];

  for (const [, group] of groups) {
    // Need at least 2 occurrences to detect a pattern
    if (group.entries.length < 2) continue;

    // Check amount consistency (all within ±15% of median)
    const amounts = group.entries.map((e) => e.amount).sort((a, b) => a - b);
    const median = amounts[Math.floor(amounts.length / 2)];
    const consistent = amounts.every(
      (a) => Math.abs(a - median) / median <= 0.15,
    );
    if (!consistent) continue;

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
    const pattern = inferPattern(avgDays);
    if (!pattern) continue;

    candidates.push({
      description: group.description,
      amount: Math.round(median * 100) / 100,
      type: group.type,
      occurrences: group.entries.length,
      avgDaysBetween: Math.round(avgDays),
      suggestedPattern: pattern,
      lastDate: group.entries.map((e) => e.date).sort().pop()!,
    });
  }

  // Sort by occurrence count desc, then amount desc
  candidates.sort((a, b) => b.occurrences - a.occurrences || b.amount - a.amount);
  return candidates.slice(0, 8);
}

function normalizeDescription(desc: string): string {
  return desc
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

function inferPattern(avgDays: number): RecurringCandidate["suggestedPattern"] | null {
  if (avgDays >= 5 && avgDays <= 9) return "weekly";
  if (avgDays >= 12 && avgDays <= 18) return "biweekly";
  if (avgDays >= 25 && avgDays <= 35) return "monthly";
  if (avgDays >= 340 && avgDays <= 395) return "yearly";
  return null;
}
