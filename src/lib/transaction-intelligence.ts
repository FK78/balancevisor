import { db } from "@/index";
import {
  transactionsTable,
  subscriptionsTable,
  debtsTable,
  debtPaymentsTable,
  transactionReviewFlagsTable,
} from "@/db/schema";
import { eq, and, isNull, inArray } from "drizzle-orm";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { logger } from "@/lib/logger";
import { revalidateDomains } from "@/lib/revalidate";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

type RawTransaction = {
  id: string;
  description: string;
  amount: number;
  type: "income" | "expense" | "transfer" | "sale" | null;
  date: string | null;
  account_id: string | null;
  category_id: string | null;
  subscription_id: string | null;
  linked_debt_id: string | null;
};

// ---------------------------------------------------------------------------
// Pure matching utilities (extracted for testability)
// ---------------------------------------------------------------------------

export { normalise, fuzzyMatch, amountsMatch } from "@/lib/matching-utils";
import { normalise, fuzzyMatch, amountsMatch } from "@/lib/matching-utils";

// ---------------------------------------------------------------------------
// Fetch unlinked transactions for a user (recently imported)
// ---------------------------------------------------------------------------

async function fetchUnlinkedTransactions(
  userId: string,
  transactionIds?: string[],
): Promise<RawTransaction[]> {
  const userKey = await getUserKey(userId);

  const conditions = [
    eq(transactionsTable.user_id, userId),
    isNull(transactionsTable.subscription_id),
    isNull(transactionsTable.linked_debt_id),
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
      subscription_id: transactionsTable.subscription_id,
      linked_debt_id: transactionsTable.linked_debt_id,
    })
    .from(transactionsTable)
    .where(and(...conditions));

  return rows.map((r) => ({
    ...r,
    description: r.description ? decryptForUser(r.description, userKey) : "",
  }));
}

// ---------------------------------------------------------------------------
// 1. Match transactions to subscriptions
// ---------------------------------------------------------------------------

export async function matchTransactionsToSubscriptions(
  userId: string,
  transactionIds?: string[],
): Promise<{ linked: number; flagged: number }> {
  const subs = await db
    .select({
      id: subscriptionsTable.id,
      name: subscriptionsTable.name,
      amount: subscriptionsTable.amount,
      billing_cycle: subscriptionsTable.billing_cycle,
      next_billing_date: subscriptionsTable.next_billing_date,
      account_id: subscriptionsTable.account_id,
    })
    .from(subscriptionsTable)
    .where(
      and(
        eq(subscriptionsTable.user_id, userId),
        eq(subscriptionsTable.is_active, true),
      ),
    );

  if (subs.length === 0) return { linked: 0, flagged: 0 };

  const txns = await fetchUnlinkedTransactions(userId, transactionIds);
  const expenses = txns.filter((t) => t.type === "expense");

  let linked = 0;
  let flagged = 0;

  for (const txn of expenses) {
    for (const sub of subs) {
      if (!fuzzyMatch(txn.description, sub.name)) continue;

      if (amountsMatch(txn.amount, sub.amount)) {
        // Exact match → auto-link and advance billing
        await db
          .update(transactionsTable)
          .set({ subscription_id: sub.id })
          .where(eq(transactionsTable.id, txn.id));

        await advanceSubscriptionBillingDate(sub.id);
        linked++;
      } else {
        // Name matches but amount differs → flag for review
        await db.insert(transactionReviewFlagsTable).values({
          user_id: userId,
          transaction_id: txn.id,
          flag_type: "subscription_amount_mismatch",
          suggested_subscription_id: sub.id,
          expected_amount: sub.amount,
          actual_amount: txn.amount,
        });
        flagged++;
      }
      break; // Only match first subscription per transaction
    }
  }

  if (linked > 0 || flagged > 0) {
    revalidateDomains("subscriptions", "transactions");
  }

  return { linked, flagged };
}

// ---------------------------------------------------------------------------
// 2. Match transactions to debts
// ---------------------------------------------------------------------------

export async function matchTransactionsToDebts(
  userId: string,
  transactionIds?: string[],
): Promise<{ linked: number; flagged: number }> {
  const debts = await db
    .select({
      id: debtsTable.id,
      name: debtsTable.name,
      lender: debtsTable.lender,
      minimum_payment: debtsTable.minimum_payment,
      remaining_amount: debtsTable.remaining_amount,
    })
    .from(debtsTable)
    .where(eq(debtsTable.user_id, userId));

  const activeDebts = debts.filter((d) => d.remaining_amount > 0);
  if (activeDebts.length === 0) return { linked: 0, flagged: 0 };

  const txns = await fetchUnlinkedTransactions(userId, transactionIds);
  const expenses = txns.filter(
    (t) => t.type === "expense" && !t.linked_debt_id,
  );

  let linked = 0;
  let flagged = 0;

  for (const txn of expenses) {
    for (const debt of activeDebts) {
      const matchesName = fuzzyMatch(txn.description, debt.name);
      const matchesLender =
        debt.lender ? fuzzyMatch(txn.description, debt.lender) : false;

      if (!matchesName && !matchesLender) continue;

      const isConfident =
        debt.minimum_payment > 0 &&
        amountsMatch(txn.amount, debt.minimum_payment);

      if (isConfident && txn.account_id) {
        // Auto-record debt payment
        await db.transaction(async (tx) => {
          await tx
            .update(transactionsTable)
            .set({ linked_debt_id: debt.id })
            .where(eq(transactionsTable.id, txn.id));

          await tx.insert(debtPaymentsTable).values({
            debt_id: debt.id,
            account_id: txn.account_id!,
            amount: txn.amount,
            date: txn.date ?? new Date().toISOString().split("T")[0],
            note: "Auto-detected from imported transaction",
          });

          const newRemaining = Math.max(
            debt.remaining_amount - txn.amount,
            0,
          );
          await tx
            .update(debtsTable)
            .set({ remaining_amount: newRemaining })
            .where(eq(debtsTable.id, debt.id));
        });
        linked++;
      } else {
        // Uncertain → flag
        await db.insert(transactionReviewFlagsTable).values({
          user_id: userId,
          transaction_id: txn.id,
          flag_type: "possible_debt_payment",
          suggested_debt_id: debt.id,
          expected_amount: debt.minimum_payment,
          actual_amount: txn.amount,
        });
        flagged++;
      }
      break; // Only match first debt per transaction
    }
  }

  if (linked > 0 || flagged > 0) {
    revalidateDomains("debts", "transactions");
  }

  return { linked, flagged };
}

// ---------------------------------------------------------------------------
// 3. Detect recurring patterns in imported transactions
// ---------------------------------------------------------------------------

export async function detectRecurringPatterns(
  userId: string,
  transactionIds?: string[],
): Promise<number> {
  const txns = await fetchUnlinkedTransactions(userId, transactionIds);

  // Group by normalised description
  const groups = new Map<string, RawTransaction[]>();
  for (const txn of txns) {
    const key = normalise(txn.description);
    if (!key) continue;
    const group = groups.get(key) ?? [];
    group.push(txn);
    groups.set(key, group);
  }

  let detected = 0;

  for (const [, group] of groups) {
    if (group.length < 2) continue;

    // Sort by date
    const dated = group
      .filter((t) => t.date)
      .sort((a, b) => a.date!.localeCompare(b.date!));
    if (dated.length < 2) continue;

    // Calculate average interval in days
    const intervals: number[] = [];
    for (let i = 1; i < dated.length; i++) {
      const d1 = new Date(dated[i - 1].date!);
      const d2 = new Date(dated[i].date!);
      intervals.push(
        Math.round((d2.getTime() - d1.getTime()) / (1000 * 60 * 60 * 24)),
      );
    }

    const avg = intervals.reduce((s, v) => s + v, 0) / intervals.length;
    const pattern = inferPattern(avg);
    if (!pattern) continue;

    // Compute next recurring date from the latest transaction
    const latest = dated[dated.length - 1];
    const nextDate = computeNextDate(latest.date!, pattern);

    const ids = group.map((t) => t.id);
    await db
      .update(transactionsTable)
      .set({
        is_recurring: true,
        recurring_pattern: pattern,
        next_recurring_date: nextDate,
      })
      .where(inArray(transactionsTable.id, ids));

    detected += ids.length;
  }

  if (detected > 0) {
    revalidateDomains("transactions", "recurring");
  }

  return detected;
}

function inferPattern(
  avgDays: number,
): "daily" | "weekly" | "biweekly" | "monthly" | "yearly" | null {
  if (avgDays <= 2) return "daily";
  if (avgDays >= 5 && avgDays <= 10) return "weekly";
  if (avgDays >= 12 && avgDays <= 18) return "biweekly";
  if (avgDays >= 25 && avgDays <= 35) return "monthly";
  if (avgDays >= 340 && avgDays <= 395) return "yearly";
  return null;
}

function computeNextDate(lastDate: string, pattern: string): string {
  const d = new Date(lastDate + "T00:00:00");
  switch (pattern) {
    case "daily":
      d.setDate(d.getDate() + 1);
      break;
    case "weekly":
      d.setDate(d.getDate() + 7);
      break;
    case "biweekly":
      d.setDate(d.getDate() + 14);
      break;
    case "monthly":
      d.setMonth(d.getMonth() + 1);
      break;
    case "yearly":
      d.setFullYear(d.getFullYear() + 1);
      break;
  }
  return d.toISOString().split("T")[0];
}

// ---------------------------------------------------------------------------
// 4. Advance subscription billing date
// ---------------------------------------------------------------------------

const CYCLE_ADVANCE: Record<string, (d: Date) => void> = {
  weekly: (d) => d.setDate(d.getDate() + 7),
  monthly: (d) => d.setMonth(d.getMonth() + 1),
  quarterly: (d) => d.setMonth(d.getMonth() + 3),
  yearly: (d) => d.setFullYear(d.getFullYear() + 1),
};

async function advanceSubscriptionBillingDate(
  subscriptionId: string,
): Promise<void> {
  const [sub] = await db
    .select({
      next_billing_date: subscriptionsTable.next_billing_date,
      billing_cycle: subscriptionsTable.billing_cycle,
    })
    .from(subscriptionsTable)
    .where(eq(subscriptionsTable.id, subscriptionId));

  if (!sub) return;

  const d = new Date(sub.next_billing_date + "T00:00:00");
  const advance = CYCLE_ADVANCE[sub.billing_cycle];
  if (advance) advance(d);

  await db
    .update(subscriptionsTable)
    .set({ next_billing_date: d.toISOString().split("T")[0] })
    .where(eq(subscriptionsTable.id, subscriptionId));
}

// ---------------------------------------------------------------------------
// 5. Full enrichment pipeline
// ---------------------------------------------------------------------------

export async function enrichTransactions(
  userId: string,
  transactionIds?: string[],
): Promise<{
  subscriptions: { linked: number; flagged: number };
  debts: { linked: number; flagged: number };
  recurringDetected: number;
  aiCategorised: number;
}> {
  try {
    const [subResult, debtResult, recurringDetected] = await Promise.all([
      matchTransactionsToSubscriptions(userId, transactionIds),
      matchTransactionsToDebts(userId, transactionIds),
      detectRecurringPatterns(userId, transactionIds),
    ]);

    // Batch AI categorisation for remaining uncategorised transactions
    const { batchAiCategorise } = await import("@/lib/auto-categorise");
    const aiCategorised = await batchAiCategorise(userId, transactionIds);

    return {
      subscriptions: subResult,
      debts: debtResult,
      recurringDetected,
      aiCategorised,
    };
  } catch (err) {
    logger.error("transaction-intelligence", "Enrichment pipeline failed", err);
    return {
      subscriptions: { linked: 0, flagged: 0 },
      debts: { linked: 0, flagged: 0 },
      recurringDetected: 0,
      aiCategorised: 0,
    };
  }
}
