import { db } from "@/index";
import { transactionsTable, subscriptionsTable, categoriesTable, accountsTable } from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { normalise, fuzzyMatch } from "@/lib/matching-utils";
import { logger } from "@/lib/logger";
import { revalidateDomains } from "@/lib/revalidate";

// Categories that represent variable spending / income — never promote to subscriptions
const BLOCKED_CATEGORY_NAMES = new Set([
  "groceries",
  "dining out",
  "shopping",
  "transport",
  "health",
  "salary",
  "freelance",
  "investments",
]);

export type PromotionResult = {
  created: number;
  linked: number;
};

type RecurringTxn = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer" | "sale" | "refund" | null;
  date: string | null;
  account_id: string | null;
  category_id: string | null;
  recurring_pattern: string | null;
  currency: string;
};

const PATTERN_TO_BILLING_CYCLE: Record<string, "weekly" | "monthly" | "quarterly" | "yearly"> = {
  daily: "weekly",
  weekly: "weekly",
  biweekly: "monthly",
  monthly: "monthly",
  yearly: "yearly",
};

const CYCLE_ADVANCE: Record<string, (d: Date) => void> = {
  weekly: (d) => d.setDate(d.getDate() + 7),
  monthly: (d) => d.setMonth(d.getMonth() + 1),
  quarterly: (d) => d.setMonth(d.getMonth() + 3),
  yearly: (d) => d.setFullYear(d.getFullYear() + 1),
};

/**
 * Promotes recurring expense transactions into full subscription records.
 * Groups recurring transactions by normalised description, creates a subscription
 * for each group, and links the transactions to the new subscription.
 */
export async function promoteRecurringToSubscriptions(
  userId: string,
  transactionIds?: string[],
): Promise<PromotionResult> {
  try {
    const userKey = await getUserKey(userId);

    // Fetch recurring expenses not yet linked to a subscription
    const conditions = [
      eq(transactionsTable.user_id, userId),
      eq(transactionsTable.is_recurring, true),
      isNull(transactionsTable.subscription_id),
    ];

    if (transactionIds && transactionIds.length > 0) {
      conditions.push(inArray(transactionsTable.id, transactionIds));
    }

    const rows = await db
      .select({
        id: transactionsTable.id,
        description: transactionsTable.description,
        amount: transactionsTable.amount,
        type: transactionsTable.type,
        date: transactionsTable.date,
        account_id: transactionsTable.account_id,
        category_id: transactionsTable.category_id,
        recurring_pattern: transactionsTable.recurring_pattern,
        currency: accountsTable.currency,
      })
      .from(transactionsTable)
      .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
      .where(and(...conditions));

    const expenses = rows
      .filter((r) => r.type === "expense")
      .map((r) => ({
        ...r,
        description: r.description ? decryptForUser(r.description, userKey) : "",
      }));

    if (expenses.length === 0) return { created: 0, linked: 0 };

    // Build category ID → name lookup for blocklist checks
    const allCats = await db
      .select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoriesTable)
      .where(eq(categoriesTable.user_id, userId));
    const catNameById = new Map(allCats.map((c) => [c.id, c.name]));

    // Fetch existing subscriptions to avoid duplicates
    const existingSubs = await db
      .select({
        name: subscriptionsTable.name,
        amount: subscriptionsTable.amount,
      })
      .from(subscriptionsTable)
      .where(
        and(
          eq(subscriptionsTable.user_id, userId),
          eq(subscriptionsTable.is_active, true),
        ),
      );

    // Group by normalised description
    const groups = new Map<string, RecurringTxn[]>();
    for (const txn of expenses) {
      const key = normalise(txn.description);
      if (!key) continue;
      const group = groups.get(key) ?? [];
      group.push(txn);
      groups.set(key, group);
    }

    let created = 0;
    let linked = 0;

    for (const [, group] of groups) {
      if (group.length < 3) continue;

      // Use the latest transaction as the representative
      const sorted = [...group].sort((a, b) =>
        (a.date ?? "").localeCompare(b.date ?? ""),
      );
      const latest = sorted[sorted.length - 1];

      // Check amounts are consistent (within ±5% of median — real subscriptions are near-exact)
      const amounts = group.map((t) => t.amount).sort((a, b) => a - b);
      const median = amounts[Math.floor(amounts.length / 2)];
      const consistent = amounts.every(
        (a) => Math.abs(a - median) / Math.max(median, 0.01) <= 0.05,
      );
      if (!consistent) continue;

      // Skip categories that are never subscription-like
      const catName = latest.category_id
        ? catNameById.get(latest.category_id)
        : null;
      if (catName && BLOCKED_CATEGORY_NAMES.has(catName.toLowerCase())) continue;

      // Check no existing subscription already matches
      const alreadyExists = existingSubs.some(
        (s) =>
          fuzzyMatch(latest.description, s.name) &&
          Math.abs(s.amount - median) / Math.max(median, 0.01) <= 0.2,
      );
      if (alreadyExists) continue;

      const pattern = latest.recurring_pattern ?? "monthly";
      const billingCycle = PATTERN_TO_BILLING_CYCLE[pattern] ?? "monthly";

      // Only promote monthly or yearly — weekly/biweekly payments are rarely subscriptions
      if (billingCycle !== "monthly" && billingCycle !== "yearly") continue;

      // Compute next billing date
      const nextDate = new Date(
        (latest.date ?? new Date().toISOString().split("T")[0]) + "T00:00:00",
      );
      const advance = CYCLE_ADVANCE[billingCycle];
      if (advance) advance(nextDate);

      const accountId = latest.account_id;
      if (!accountId) continue;

      // Create the subscription
      const [newSub] = await db
        .insert(subscriptionsTable)
        .values({
          user_id: userId,
          name: latest.description,
          amount: Math.round(median * 100) / 100,
          currency: latest.currency,
          billing_cycle: billingCycle,
          next_billing_date: nextDate.toISOString().split("T")[0],
          category_id: latest.category_id,
          account_id: accountId,
        })
        .returning({ id: subscriptionsTable.id });

      if (!newSub) continue;

      // Link all matching transactions to the new subscription
      const ids = group.map((t) => t.id);
      await db
        .update(transactionsTable)
        .set({ subscription_id: newSub.id })
        .where(inArray(transactionsTable.id, ids));

      created++;
      linked += ids.length;

      logger.info(
        "subscription-promoter",
        `Auto-created subscription "${latest.description}" (${billingCycle}, £${median}) from ${ids.length} recurring txns`,
      );
    }

    if (created > 0) {
      revalidateDomains("subscriptions", "transactions");
    }

    return { created, linked };
  } catch (err) {
    logger.error("subscription-promoter", "Promotion failed", err);
    return { created: 0, linked: 0 };
  }
}
