import { db } from "@/index";
import { transactionsTable, subscriptionsTable, categoriesTable } from "@/db/schema";
import { eq, and, desc, sql, lt } from "drizzle-orm";
import { toMonthlyAmount } from "@/db/queries/subscriptions";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BillIncrease = {
  readonly subscriptionId: string;
  readonly name: string;
  readonly previousAmount: number;
  readonly currentAmount: number;
  readonly increaseAmount: number;
  readonly increasePercent: number;
  readonly billingCycle: string;
  readonly monthlyImpact: number;
};

export type UnusedSubscription = {
  readonly subscriptionId: string;
  readonly name: string;
  readonly amount: number;
  readonly billingCycle: string;
  readonly monthlyAmount: number;
  readonly daysSinceLastTransaction: number;
};

export type SubscriptionOverlap = {
  readonly category: string;
  readonly categoryColor: string;
  readonly subscriptions: readonly { name: string; monthlyAmount: number }[];
  readonly totalMonthly: number;
};

export type SubscriptionHealthReport = {
  readonly billIncreases: readonly BillIncrease[];
  readonly unusedSubscriptions: readonly UnusedSubscription[];
  readonly overlaps: readonly SubscriptionOverlap[];
  readonly potentialMonthlySavings: number;
};

// ---------------------------------------------------------------------------
// Bill increase detection
// ---------------------------------------------------------------------------

/**
 * Detects subscriptions whose current amount differs from the most recent
 * matching transaction amount by more than a threshold (default 2%).
 *
 * Compares the subscription's stored amount against the last two matching
 * expense transactions (by subscription_id link). If the latest transaction
 * amount is higher than the previous one, that's a bill increase.
 */
export async function detectBillIncreases(userId: string): Promise<BillIncrease[]> {
  const subs = await db
    .select({
      id: subscriptionsTable.id,
      name: subscriptionsTable.name,
      amount: subscriptionsTable.amount,
      billing_cycle: subscriptionsTable.billing_cycle,
    })
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.user_id, userId),
        eq(subscriptionsTable.is_active, true),
      ),
    );

  if (subs.length === 0) return [];

  const increases: BillIncrease[] = [];

  for (const sub of subs) {
    const recentTxns = await db
      .select({ amount: transactionsTable.amount, date: transactionsTable.date })
      .from(transactionsTable)
      .where(
        and(
          eq(transactionsTable.user_id, userId),
          eq(transactionsTable.subscription_id, sub.id),
          eq(transactionsTable.type, "expense"),
        ),
      )
      .orderBy(desc(transactionsTable.date))
      .limit(2);

    if (recentTxns.length < 2) continue;

    const [latest, previous] = recentTxns;
    const latestAmount = Math.abs(latest.amount);
    const previousAmount = Math.abs(previous.amount);

    if (previousAmount <= 0) continue;

    const pctChange = ((latestAmount - previousAmount) / previousAmount) * 100;

    if (pctChange > 2) {
      const increaseAmount = latestAmount - previousAmount;
      increases.push({
        subscriptionId: sub.id,
        name: sub.name,
        previousAmount,
        currentAmount: latestAmount,
        increaseAmount: Math.round(increaseAmount * 100) / 100,
        increasePercent: Math.round(pctChange * 10) / 10,
        billingCycle: sub.billing_cycle,
        monthlyImpact: Math.round(toMonthlyAmount(increaseAmount, sub.billing_cycle) * 100) / 100,
      });
    }
  }

  increases.sort((a, b) => b.monthlyImpact - a.monthlyImpact);
  return increases;
}

// ---------------------------------------------------------------------------
// Unused subscription detection
// ---------------------------------------------------------------------------

/**
 * Identifies active subscriptions that have no matching transactions
 * in the last N days (default 60).
 */
export async function detectUnusedSubscriptions(
  userId: string,
  thresholdDays = 60,
): Promise<UnusedSubscription[]> {
  const cutoffDate = new Date();
  cutoffDate.setDate(cutoffDate.getDate() - thresholdDays);
  const cutoff = cutoffDate.toISOString().split("T")[0];

  const rows = await db
    .select({
      id: subscriptionsTable.id,
      name: subscriptionsTable.name,
      amount: subscriptionsTable.amount,
      billing_cycle: subscriptionsTable.billing_cycle,
      lastTxnDate: sql<string | null>`max(${transactionsTable.date})`,
    })
    .from(subscriptionsTable)
    .leftJoin(
      transactionsTable,
      and(
        eq(transactionsTable.subscription_id, subscriptionsTable.id),
        eq(transactionsTable.user_id, userId),
      ),
    )
    .where(
      and(
        eq(subscriptionsTable.user_id, userId),
        eq(subscriptionsTable.is_active, true),
      ),
    )
    .groupBy(subscriptionsTable.id, subscriptionsTable.name, subscriptionsTable.amount, subscriptionsTable.billing_cycle);

  const unused: UnusedSubscription[] = [];
  const now = Date.now();

  for (const row of rows) {
    if (!row.lastTxnDate) {
      // No transactions at all — flag it
      unused.push({
        subscriptionId: row.id,
        name: row.name,
        amount: row.amount,
        billingCycle: row.billing_cycle,
        monthlyAmount: Math.round(toMonthlyAmount(row.amount, row.billing_cycle) * 100) / 100,
        daysSinceLastTransaction: -1,
      });
      continue;
    }

    if (row.lastTxnDate < cutoff) {
      const daysSince = Math.floor((now - new Date(row.lastTxnDate).getTime()) / (1000 * 60 * 60 * 24));
      unused.push({
        subscriptionId: row.id,
        name: row.name,
        amount: row.amount,
        billingCycle: row.billing_cycle,
        monthlyAmount: Math.round(toMonthlyAmount(row.amount, row.billing_cycle) * 100) / 100,
        daysSinceLastTransaction: daysSince,
      });
    }
  }

  unused.sort((a, b) => b.monthlyAmount - a.monthlyAmount);
  return unused;
}

// ---------------------------------------------------------------------------
// Subscription overlap detection
// ---------------------------------------------------------------------------

/**
 * Finds categories with ≥2 active subscriptions (potential overlap/redundancy).
 */
export async function detectSubscriptionOverlaps(userId: string): Promise<SubscriptionOverlap[]> {
  const subs = await db
    .select({
      name: subscriptionsTable.name,
      amount: subscriptionsTable.amount,
      billing_cycle: subscriptionsTable.billing_cycle,
      categoryName: categoriesTable.name,
      categoryColor: categoriesTable.color,
    })
    .from(subscriptionsTable)
    .leftJoin(categoriesTable, eq(subscriptionsTable.category_id, categoriesTable.id))
    .where(
      and(
        eq(subscriptionsTable.user_id, userId),
        eq(subscriptionsTable.is_active, true),
      ),
    );

  const byCategory = new Map<string, { color: string; items: { name: string; monthlyAmount: number }[] }>();

  for (const sub of subs) {
    const cat = sub.categoryName ?? "Uncategorised";
    const color = sub.categoryColor ?? "#6b7280";
    const existing = byCategory.get(cat) ?? { color, items: [] };
    existing.items.push({
      name: sub.name,
      monthlyAmount: Math.round(toMonthlyAmount(sub.amount, sub.billing_cycle) * 100) / 100,
    });
    byCategory.set(cat, existing);
  }

  const overlaps: SubscriptionOverlap[] = [];

  for (const [category, { color, items }] of byCategory) {
    if (items.length >= 2) {
      overlaps.push({
        category,
        categoryColor: color,
        subscriptions: items,
        totalMonthly: Math.round(items.reduce((s, i) => s + i.monthlyAmount, 0) * 100) / 100,
      });
    }
  }

  overlaps.sort((a, b) => b.totalMonthly - a.totalMonthly);
  return overlaps;
}

// ---------------------------------------------------------------------------
// Full subscription health report
// ---------------------------------------------------------------------------

export async function getSubscriptionHealthReport(userId: string): Promise<SubscriptionHealthReport> {
  const [billIncreases, unusedSubscriptions, overlaps] = await Promise.all([
    detectBillIncreases(userId),
    detectUnusedSubscriptions(userId),
    detectSubscriptionOverlaps(userId),
  ]);

  const potentialMonthlySavings =
    unusedSubscriptions.reduce((s, u) => s + u.monthlyAmount, 0) +
    billIncreases.reduce((s, b) => s + b.monthlyImpact, 0);

  return {
    billIncreases,
    unusedSubscriptions,
    overlaps,
    potentialMonthlySavings: Math.round(potentialMonthlySavings * 100) / 100,
  };
}
