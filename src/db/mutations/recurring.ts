'use server';

import { db } from '@/index';
import { transactionsTable } from '@/db/schema';
import { revalidateDomains } from '@/lib/revalidate';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { z } from 'zod';
import { parseFormData, zRequiredString, zEnum, zDate } from '@/lib/form-schema';
import { toDateString } from '@/lib/date';
import {
  computeNextRecurringDate,
  VALID_RECURRING_PATTERNS,
  type RecurringPattern,
} from '@/lib/recurring-utils';

const recurringSchema = z.object({
  id: zRequiredString(),
  recurring_pattern: zEnum(['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const, 'monthly'),
  next_recurring_date: zDate(),
});

// RecurringPattern, VALID_RECURRING_PATTERNS, computeNextRecurringDate imported from @/lib/recurring-utils

/**
 * Confirm a detected recurring candidate — marks the transaction as recurring,
 * sets its pattern, and computes the next occurrence date.
 */
export async function confirmRecurringCandidate(
  transactionId: string,
  pattern: string,
) {
  const userId = await getCurrentUserId();

  if (!VALID_RECURRING_PATTERNS.includes(pattern as RecurringPattern)) {
    throw new Error('Invalid recurring pattern');
  }
  const validPattern = pattern as RecurringPattern;

  const [txn] = await db
    .select({
      date: transactionsTable.date,
      is_recurring: transactionsTable.is_recurring,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.user_id, userId),
      )
    );

  if (!txn) throw new Error('Transaction not found');
  if (txn.is_recurring) throw new Error('Transaction is already recurring');

  const baseDate = txn.date ?? toDateString(new Date());
  const nextDate = computeNextRecurringDate(baseDate, validPattern);

  await db
    .update(transactionsTable)
    .set({
      is_recurring: true,
      recurring_pattern: validPattern as typeof transactionsTable.$inferInsert['recurring_pattern'],
      next_recurring_date: nextDate,
    })
    .where(eq(transactionsTable.id, transactionId));

  revalidateDomains('recurring', 'transactions');
}

/**
 * Dismiss a detected recurring candidate — marks the transaction so it
 * won't appear in future suggestions. Sets is_recurring=true with no
 * pattern, which excludes it from both detection (requires is_recurring=false)
 * and the recurring list (requires recurring_pattern IS NOT NULL).
 */
export async function dismissRecurringCandidate(transactionId: string) {
  const userId = await getCurrentUserId();

  const [txn] = await db
    .select({ is_recurring: transactionsTable.is_recurring })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.user_id, userId),
      )
    );

  if (!txn) throw new Error('Transaction not found');

  await db
    .update(transactionsTable)
    .set({
      is_recurring: true,
      recurring_pattern: null,
      next_recurring_date: null,
    })
    .where(eq(transactionsTable.id, transactionId));

  revalidateDomains('recurring', 'transactions');
}

/**
 * Stop a recurring transaction — sets is_recurring to false and clears
 * recurring_pattern / next_recurring_date. The transaction itself remains
 * as a historical record.
 */
export async function cancelRecurring(transactionId: string) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const [txn] = await db
    .select({ account_id: transactionsTable.account_id })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.user_id, userId),
      )
    );

  if (!txn) throw new Error('Transaction not found');

  await db
    .update(transactionsTable)
    .set({
      is_recurring: false,
      recurring_pattern: null,
      next_recurring_date: null,
    })
    .where(eq(transactionsTable.id, transactionId));

  revalidateDomains('recurring', 'transactions');
}

/**
 * Update the recurring pattern and/or next date for a recurring transaction.
 */
export async function updateRecurringPattern(formData: FormData) {
  const userId = await getCurrentUserId();
  const { id: transactionId, recurring_pattern: pattern, next_recurring_date: nextDate } = parseFormData(recurringSchema, formData);

  // Verify ownership
  const [txn] = await db
    .select({ account_id: transactionsTable.account_id })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.id, transactionId),
        eq(transactionsTable.user_id, userId),
      )
    );

  if (!txn) throw new Error('Transaction not found');

  await db
    .update(transactionsTable)
    .set({
      recurring_pattern: pattern as typeof transactionsTable.$inferInsert['recurring_pattern'],
      next_recurring_date: nextDate || null,
    })
    .where(eq(transactionsTable.id, transactionId));

  revalidateDomains('recurring', 'transactions');
}
