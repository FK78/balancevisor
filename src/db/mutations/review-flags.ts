'use server';

import { getUserDb } from '@/db/rls-context';
import {
  transactionReviewFlagsTable,
  transactionsTable,
  subscriptionsTable,
  debtsTable,
  debtPaymentsTable,
} from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';

/**
 * Accept a review flag — links the transaction to the suggested
 * subscription or debt and marks the flag as resolved.
 */
export async function acceptReviewFlag(flagId: string) {
  const userId = await getCurrentUserId();

  const userDb = await getUserDb(userId);
  const [flag] = await userDb
    .select()
    .from(transactionReviewFlagsTable)
    .where(
      and(
        eq(transactionReviewFlagsTable.id, flagId),
        eq(transactionReviewFlagsTable.user_id, userId),
      ),
    );

  if (!flag) throw new Error('Review flag not found');

  await userDb.transaction(async (tx) => {
    // Mark flag resolved
    await tx
      .update(transactionReviewFlagsTable)
      .set({ is_resolved: true })
      .where(eq(transactionReviewFlagsTable.id, flagId));

    if (
      flag.flag_type === 'subscription_amount_mismatch' ||
      flag.flag_type === 'possible_subscription'
    ) {
      if (flag.suggested_subscription_id) {
        // Link transaction to subscription
        await tx
          .update(transactionsTable)
          .set({ subscription_id: flag.suggested_subscription_id })
          .where(eq(transactionsTable.id, flag.transaction_id));

        // Advance billing date
        const [sub] = await tx
          .select({
            next_billing_date: subscriptionsTable.next_billing_date,
            billing_cycle: subscriptionsTable.billing_cycle,
          })
          .from(subscriptionsTable)
          .where(eq(subscriptionsTable.id, flag.suggested_subscription_id));

        if (sub) {
          const d = new Date(sub.next_billing_date + 'T00:00:00');
          switch (sub.billing_cycle) {
            case 'weekly':
              d.setDate(d.getDate() + 7);
              break;
            case 'monthly':
              d.setMonth(d.getMonth() + 1);
              break;
            case 'quarterly':
              d.setMonth(d.getMonth() + 3);
              break;
            case 'yearly':
              d.setFullYear(d.getFullYear() + 1);
              break;
          }
          await tx
            .update(subscriptionsTable)
            .set({ next_billing_date: d.toISOString().split('T')[0] })
            .where(eq(subscriptionsTable.id, flag.suggested_subscription_id));
        }
      }
    }

    if (flag.flag_type === 'possible_debt_payment' && flag.suggested_debt_id) {
      // Link transaction to debt
      await tx
        .update(transactionsTable)
        .set({ linked_debt_id: flag.suggested_debt_id })
        .where(eq(transactionsTable.id, flag.transaction_id));

      // Fetch transaction for date and account
      const [txn] = await tx
        .select({
          amount: transactionsTable.amount,
          date: transactionsTable.date,
          account_id: transactionsTable.account_id,
        })
        .from(transactionsTable)
        .where(eq(transactionsTable.id, flag.transaction_id));

      if (txn && txn.account_id) {
        // Record debt payment
        await tx.insert(debtPaymentsTable).values({
          debt_id: flag.suggested_debt_id,
          account_id: txn.account_id,
          amount: txn.amount,
          date: txn.date ?? new Date().toISOString().split('T')[0],
          note: 'Accepted from review flag',
          user_id: userId,
        });

        // Reduce remaining amount
        const [debt] = await tx
          .select({ remaining_amount: debtsTable.remaining_amount })
          .from(debtsTable)
          .where(eq(debtsTable.id, flag.suggested_debt_id));

        if (debt) {
          const newRemaining = Math.max(debt.remaining_amount - txn.amount, 0);
          await tx
            .update(debtsTable)
            .set({ remaining_amount: newRemaining })
            .where(eq(debtsTable.id, flag.suggested_debt_id));
        }
      }
    }
  });

  revalidateDomains('transactions', 'subscriptions', 'debts');
}

/**
 * Dismiss a review flag without taking action.
 */
export async function dismissReviewFlag(flagId: string) {
  const userId = await getCurrentUserId();

  const userDb = await getUserDb(userId);
  await userDb
    .update(transactionReviewFlagsTable)
    .set({ is_resolved: true })
    .where(
      and(
        eq(transactionReviewFlagsTable.id, flagId),
        eq(transactionReviewFlagsTable.user_id, userId),
      ),
    );

  revalidateDomains('transactions');
}
