import { db } from "@/index";
import {
  transactionsTable,
  subscriptionsTable,
  debtsTable,
  debtPaymentsTable,
  transactionReviewFlagsTable,
} from "@/db/schema";
import { eq, and, isNull, inArray, gte } from "drizzle-orm";
import {
  inferRecurringPattern,
  computeNextRecurringDate,
  isAmountConsistent,
  MIN_RECURRING_OCCURRENCES,
  type RecurringPattern,
} from "@/lib/recurring-utils";
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
  type: "income" | "expense" | "transfer" | "sale" | "refund" | null;
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
import { normalise, fuzzyMatch, amountsMatch, amountsCloseEnough } from "@/lib/matching-utils";

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
  } else {
    // Scope to last 90 days when doing a full scan
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - 90);
    conditions.push(gte(transactionsTable.date, cutoff.toISOString().split("T")[0]));
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

      if (amountsCloseEnough(txn.amount, sub.amount)) {
        // Name + amount within 30% → auto-link and advance billing
        await db
          .update(transactionsTable)
          .set({ subscription_id: sub.id })
          .where(eq(transactionsTable.id, txn.id));

        await advanceSubscriptionBillingDate(sub.id);
        linked++;
      } else {
        // Name matches but amount differs >30% → flag for review (with dedup)
        const [existing] = await db
          .select({ id: transactionReviewFlagsTable.id })
          .from(transactionReviewFlagsTable)
          .where(
            and(
              eq(transactionReviewFlagsTable.transaction_id, txn.id),
              eq(transactionReviewFlagsTable.flag_type, "subscription_amount_mismatch"),
              eq(transactionReviewFlagsTable.is_resolved, false),
            ),
          )
          .limit(1);
        if (!existing) {
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

      if (txn.account_id) {
        // Auto-link as debt payment on name match
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
        // No account_id → flag for review (with dedup)
        const [existing] = await db
          .select({ id: transactionReviewFlagsTable.id })
          .from(transactionReviewFlagsTable)
          .where(
            and(
              eq(transactionReviewFlagsTable.transaction_id, txn.id),
              eq(transactionReviewFlagsTable.flag_type, "possible_debt_payment"),
              eq(transactionReviewFlagsTable.is_resolved, false),
            ),
          )
          .limit(1);
        if (!existing) {
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
    if (group.length < MIN_RECURRING_OCCURRENCES) continue;

    // Sort by date
    const dated = group
      .filter((t) => t.date)
      .sort((a, b) => a.date!.localeCompare(b.date!));
    if (dated.length < MIN_RECURRING_OCCURRENCES) continue;

    // Amount consistency — skip groups with wildly varying amounts
    if (!isAmountConsistent(dated.map((t) => t.amount))) continue;

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
    const pattern = inferRecurringPattern(avg);
    if (!pattern) continue;

    // Only mark the LATEST transaction as the recurring "source".
    // Previous code marked ALL historical transactions, which caused
    // duplicate generation and wildly inflated summary numbers.
    const latest = dated[dated.length - 1];
    const nextDate = computeNextRecurringDate(latest.date!, pattern);

    await db
      .update(transactionsTable)
      .set({
        is_recurring: true,
        recurring_pattern: pattern as typeof transactionsTable.$inferInsert["recurring_pattern"],
        next_recurring_date: nextDate,
      })
      .where(eq(transactionsTable.id, latest.id));

    // Mark older transactions in this group as "acknowledged" so they don't
    // appear as false-positive candidates in detectRecurringCandidates().
    // Setting is_recurring=true with pattern=null excludes them from:
    //  - candidate detection (requires is_recurring=false)
    //  - recurring list (requires recurring_pattern IS NOT NULL)
    //  - generation engine (requires recurring_pattern IS NOT NULL)
    const otherIds = group.filter((t) => t.id !== latest.id).map((t) => t.id);
    if (otherIds.length > 0) {
      await db
        .update(transactionsTable)
        .set({ is_recurring: true, recurring_pattern: null, next_recurring_date: null })
        .where(inArray(transactionsTable.id, otherIds));
    }

    detected += 1;
  }

  if (detected > 0) {
    revalidateDomains("transactions", "recurring");
  }

  return detected;
}

// inferPattern and computeNextDate are now shared via @/lib/recurring-utils

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

export type EnrichmentResult = {
  subscriptions: { linked: number; flagged: number };
  debts: { linked: number; flagged: number };
  recurringDetected: number;
  ruleCategorised: number;
  aiCategorised: number;
  categoriesCreated: number;
  subscriptionsCreated: number;
  budgetsCreated: number;
};

export async function enrichTransactions(
  userId: string,
  transactionIds?: string[],
): Promise<EnrichmentResult> {
  try {
    const [subResult, debtResult, recurringDetected] = await Promise.all([
      matchTransactionsToSubscriptions(userId, transactionIds),
      matchTransactionsToDebts(userId, transactionIds),
      detectRecurringPatterns(userId, transactionIds),
    ]);

    // Promote recurring expenses to subscriptions
    const { promoteRecurringToSubscriptions } = await import("@/lib/subscription-promoter");
    const promoResult = await promoteRecurringToSubscriptions(userId, transactionIds);

    // Rule-based + merchant-mapping categorisation first (fast, no API calls)
    const { applyDeterministicCategorisation } = await import("@/lib/deterministic-categorise");
    const deterministicResult = await applyDeterministicCategorisation(userId, transactionIds);

    // Batch AI categorisation for remaining uncategorised transactions
    const { batchAiCategorise } = await import("@/lib/auto-categorise");
    const aiResult = await batchAiCategorise(userId, transactionIds);

    return {
      subscriptions: subResult,
      debts: debtResult,
      recurringDetected,
      ruleCategorised: deterministicResult.categorised,
      aiCategorised: aiResult.categorised,
      categoriesCreated: aiResult.categoriesCreated,
      subscriptionsCreated: promoResult.created,
      budgetsCreated: 0,
    };
  } catch (err) {
    logger.error("transaction-intelligence", "Enrichment pipeline failed", err);
    return {
      subscriptions: { linked: 0, flagged: 0 },
      debts: { linked: 0, flagged: 0 },
      recurringDetected: 0,
      ruleCategorised: 0,
      aiCategorised: 0,
      categoriesCreated: 0,
      subscriptionsCreated: 0,
      budgetsCreated: 0,
    };
  }
}
