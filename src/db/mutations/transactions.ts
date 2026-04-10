'use server';

import { db } from '@/index';
import { accountsTable, transactionsTable, transactionSplitsTable } from '@/db/schema';
import { revalidateDomains } from '@/lib/revalidate';
import { toDateString } from '@/lib/date';
import { eq, and, sql } from 'drizzle-orm';
import { getCurrentUserId, getCurrentUserEmail } from '@/lib/auth';
import { hasEditAccess } from '@/db/queries/sharing';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { encryptForUser, decryptForUser, getUserKey } from '@/lib/encryption';
import { matchCategorisationRule } from '@/lib/auto-categorise';
import { matchTransactionsToSubscriptions, matchTransactionsToDebts } from '@/lib/transaction-intelligence';
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zEnum, zRequiredDate, zUUID, zString, zCheckbox } from '@/lib/form-schema';
import { findMatchingExpense } from '@/lib/refund-matcher';
import { normaliseMerchant } from '@/lib/merchant-normalise';
import { logger } from '@/lib/logger';

const txnSchema = z.object({
  type: zEnum(['income', 'expense', 'sale', 'refund'] as const, 'expense'),
  amount: zNumber({ min: 0.01 }),
  account_id: zRequiredString(),
  is_recurring: zCheckbox(),
  recurring_pattern: z.string().optional().default(''),
  date: zRequiredDate(),
  description: zString().transform((v) => v ?? ''),
  category_id: zUUID(),
  refund_for_transaction_id: zUUID(),
});

const transferSchema = z.object({
  amount: zNumber({ min: 0.01 }),
  from_account_id: zRequiredString(),
  to_account_id: zRequiredString(),
  description: zString().transform((v) => v ?? 'Transfer'),
  date: zRequiredDate(),
});

type Transaction = Omit<typeof transactionsTable.$inferInsert, 'user_id'>;
type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

function computeNextRecurringDate(dateStr: string, pattern: string | null): string | null {
  if (!pattern) return null;
  const d = new Date(dateStr + 'T00:00:00');
  switch (pattern as RecurringPattern) {
    case 'daily': d.setDate(d.getDate() + 1); break;
    case 'weekly': d.setDate(d.getDate() + 7); break;
    case 'biweekly': d.setDate(d.getDate() + 14); break;
    case 'monthly': d.setMonth(d.getMonth() + 1); break;
    case 'yearly': d.setFullYear(d.getFullYear() + 1); break;
    default: return null;
  }
  return toDateString(d);
}

type DbClient = typeof db;
type TransactionDb = Parameters<Parameters<DbClient['transaction']>[0]>[0];

export async function createTransaction(
  transaction: Transaction,
  userId: string,
  tx: DbClient | TransactionDb = db,
) {
  const userKey = await getUserKey(userId);
  return await tx.insert(transactionsTable).values({
    ...transaction,
    user_id: userId,
    description: transaction.description ? encryptForUser(transaction.description, userKey) : transaction.description,
  }).returning({ id: transactionsTable.id });
}

function balanceDelta(type: 'income' | 'expense' | 'transfer' | 'sale' | 'refund', amount: number) {
  if (type === 'transfer') return 0;
  if (type === 'income' || type === 'sale' || type === 'refund') return amount;
  return -amount;
}

export async function addTransaction(formData: FormData) {
  const data = parseFormData(txnSchema, formData);
  const { type, amount } = data;
  const accountId = data.account_id;

  // Verify the user owns or has edit access to this account
  const userId = await getCurrentUserId();
  const email = await getCurrentUserEmail();
  const canEdit = await hasEditAccess(userId, email, 'account', accountId);
  if (!canEdit) throw new Error('You do not have access to this account');

  const isRecurring = data.is_recurring;
  const recurringPatterns = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const;
  const recurringPattern = isRecurring
    ? (recurringPatterns.includes(data.recurring_pattern as typeof recurringPatterns[number]) ? data.recurring_pattern : 'monthly')
    : null;
  const txnDate = data.date;
  const nextRecurringDate = isRecurring && recurringPattern && txnDate
    ? computeNextRecurringDate(txnDate, recurringPattern)
    : null;

  const description = data.description;
  let categoryId = data.category_id;
  let categorySource: string | null = categoryId ? 'manual' : null;
  const merchantName = normaliseMerchant(description);

  // Auto-categorise if no category was selected
  if (!categoryId && description) {
    const matched = await matchCategorisationRule(userId, description);
    if (matched) {
      categoryId = matched;
      categorySource = 'rule';
    }
  }

  // For refunds, attempt to auto-match to an original expense
  let refundForTransactionId = data.refund_for_transaction_id;
  if (type === 'refund' && !refundForTransactionId && description && accountId) {
    const match = await findMatchingExpense(userId, accountId, amount, description);
    if (match) refundForTransactionId = match.transactionId;
  }

  const result = await db.transaction(async (tx) => {
    const [inserted] = await createTransaction({
      type,
      amount,
      description,
      is_recurring: isRecurring,
      date: txnDate,
      account_id: accountId,
      category_id: categoryId || (formData.get('category_id') as string) || null,
      category_source: categorySource,
      merchant_name: merchantName,
      recurring_pattern: recurringPattern as typeof transactionsTable.$inferInsert['recurring_pattern'],
      next_recurring_date: nextRecurringDate,
      refund_for_transaction_id: refundForTransactionId || null,
    }, userId, tx);

    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} + ${balanceDelta(type, amount)}` })
      .where(eq(accountsTable.id, accountId));

    return inserted;
  });

  revalidateDomains('transactions', 'accounts');

  await checkBudgetAlerts(userId);

  // Run subscription + debt matching inline (fast, no AI)
  matchTransactionsToSubscriptions(userId, [result.id]).catch((err) => logger.warn('addTransaction', 'subscription matching failed', err));
  matchTransactionsToDebts(userId, [result.id]).catch((err) => logger.warn('addTransaction', 'debt matching failed', err));

  return result;
}

export async function editTransaction(formData: FormData) {
  const editSchema = txnSchema.extend({ id: zRequiredString() });
  const data = parseFormData(editSchema, formData);
  const id = data.id;
  const newType = data.type;
  const newAmount = data.amount;
  const newAccountId = data.account_id;

  // Verify access
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();
  const canEdit = await hasEditAccess(userId, userEmail, 'account', newAccountId);
  if (!canEdit) throw new Error('You do not have access to this account');

  const isRecurring = data.is_recurring;
  const recurringPatterns = ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const;
  const recurringPattern = isRecurring
    ? (recurringPatterns.includes(data.recurring_pattern as typeof recurringPatterns[number]) ? data.recurring_pattern : 'monthly')
    : null;
  const txnDate = data.date;
  const nextRecurringDate = isRecurring && recurringPattern && txnDate
    ? computeNextRecurringDate(txnDate, recurringPattern)
    : null;

  const editDescription = data.description;
  const userKey = await getUserKey(userId);

  const result = await db.transaction(async (tx) => {
    // Fetch old transaction inside the transaction to prevent stale-read race
    const [old] = await tx.select({
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      account_id: transactionsTable.account_id,
    }).from(transactionsTable).where(eq(transactionsTable.id, id));

    const editRefundId = data.refund_for_transaction_id;
    const editMerchant = normaliseMerchant(editDescription);
    const [updated] = await tx.update(transactionsTable).set({
      type: newType,
      amount: newAmount,
      description: encryptForUser(editDescription, userKey),
      is_recurring: isRecurring,
      date: txnDate,
      account_id: newAccountId,
      category_id: data.category_id,
      category_source: 'manual',
      merchant_name: editMerchant,
      recurring_pattern: recurringPattern as typeof transactionsTable.$inferInsert['recurring_pattern'],
      next_recurring_date: nextRecurringDate,
      refund_for_transaction_id: newType === 'refund' ? (editRefundId || null) : null,
    }).where(eq(transactionsTable.id, id)).returning({ id: transactionsTable.id });

    if (old) {
      // Reverse old effect
      if (old.account_id) {
        await tx.update(accountsTable)
          .set({ balance: sql`${accountsTable.balance} - ${balanceDelta(old.type, old.amount)}` })
          .where(eq(accountsTable.id, old.account_id));
      }
      // Apply new effect
      await tx.update(accountsTable)
        .set({ balance: sql`${accountsTable.balance} + ${balanceDelta(newType, newAmount)}` })
        .where(eq(accountsTable.id, newAccountId));
    }

    return updated;
  });

  revalidateDomains('transactions', 'accounts');

  await checkBudgetAlerts(userId);

  return result;
}

export async function addTransfer(formData: FormData) {
  const userId = await getCurrentUserId();
  const tData = parseFormData(transferSchema, formData);
  const amount = tData.amount;
  const fromAccountId = tData.from_account_id;
  const toAccountId = tData.to_account_id;
  const description = tData.description;
  const txnDate = tData.date;

  if (fromAccountId === toAccountId) {
    throw new Error('Source and destination accounts must be different');
  }

  // Verify ownership of both accounts
  const userEmail = await getCurrentUserEmail();
  const [canEditFrom, canEditTo] = await Promise.all([
    hasEditAccess(userId, userEmail, 'account', fromAccountId),
    hasEditAccess(userId, userEmail, 'account', toAccountId),
  ]);
  if (!canEditFrom) throw new Error('You do not have access to the source account');
  if (!canEditTo) throw new Error('You do not have access to the destination account');

  const result = await db.transaction(async (tx) => {
    const [inserted] = await createTransaction({
      type: 'transfer',
      amount,
      description,
      is_recurring: false,
      date: txnDate,
      account_id: fromAccountId,
      transfer_account_id: toAccountId,
      category_id: null,
      recurring_pattern: null,
      next_recurring_date: null,
    }, userId, tx);

    // Deduct from source account
    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} - ${amount}` })
      .where(eq(accountsTable.id, fromAccountId));

    // Add to destination account
    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} + ${amount}` })
      .where(eq(accountsTable.id, toAccountId));

    return inserted;
  });

  revalidateDomains('transactions', 'accounts');

  return result;
}

export async function deleteTransaction(id: string) {
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();

  await db.transaction(async (tx) => {
    // Fetch transaction inside the transaction to prevent stale-read race
    const [txn] = await tx.select({
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      account_id: transactionsTable.account_id,
      transfer_account_id: transactionsTable.transfer_account_id,
      account_user_id: accountsTable.user_id,
    }).from(transactionsTable)
      .leftJoin(accountsTable, eq(accountsTable.id, transactionsTable.account_id))
      .where(eq(transactionsTable.id, id));

    if (!txn) {
      throw new Error('Transaction not found');
    }

    // Verify the user owns the account or has edit access
    if (txn.account_id) {
      const canEdit = await hasEditAccess(userId, userEmail, 'account', txn.account_id);
      if (!canEdit) {
        throw new Error('You do not have access to this transaction');
      }
    }

    await tx.delete(transactionsTable).where(eq(transactionsTable.id, id));

    if (txn.type === 'transfer') {
      // Reverse transfer: add back to source, deduct from destination
      if (txn.account_id) {
        await tx.update(accountsTable)
          .set({ balance: sql`${accountsTable.balance} + ${txn.amount}` })
          .where(eq(accountsTable.id, txn.account_id));
      }
      if (txn.transfer_account_id) {
        await tx.update(accountsTable)
          .set({ balance: sql`${accountsTable.balance} - ${txn.amount}` })
          .where(eq(accountsTable.id, txn.transfer_account_id));
      }
    } else if (txn.account_id) {
      await tx.update(accountsTable)
        .set({ balance: sql`${accountsTable.balance} - ${balanceDelta(txn.type, txn.amount)}` })
        .where(eq(accountsTable.id, txn.account_id));
    }
  });

  revalidateDomains('transactions', 'accounts');
}

export type SplitInput = {
  category_id: string | null;
  amount: number;
  description: string;
};

export async function addSplitTransaction(
  type: 'income' | 'expense',
  totalAmount: number,
  description: string,
  accountId: string,
  txnDate: string,
  splits: SplitInput[],
) {
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();
  const canEdit = await hasEditAccess(userId, userEmail, 'account', accountId);
  if (!canEdit) throw new Error('You do not have access to this account');

  const userKey = await getUserKey(userId);

  const parent = await db.transaction(async (tx) => {
    // Create parent transaction with is_split = true, no single category
    const [inserted] = await tx.insert(transactionsTable).values({
      user_id: userId,
      type,
      amount: totalAmount,
      description: encryptForUser(description, userKey),
      is_recurring: false,
      date: txnDate,
      account_id: accountId,
      category_id: null,
      recurring_pattern: null,
      next_recurring_date: null,
      is_split: true,
    }).returning({ id: transactionsTable.id });

    // Insert splits
    if (splits.length > 0) {
      await tx.insert(transactionSplitsTable).values(
        splits.map((s) => ({
          transaction_id: inserted.id,
          category_id: s.category_id,
          amount: s.amount,
          description: s.description ? encryptForUser(s.description, userKey) : null,
        }))
      );
    }

    // Update account balance
    const delta = type === 'income' ? totalAmount : -totalAmount;
    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} + ${delta}` })
      .where(eq(accountsTable.id, accountId));

    return inserted;
  });

  revalidateDomains('transactions', 'accounts');

  await checkBudgetAlerts(userId);

  return parent;
}

/**
 * Lightweight category reassignment — used by the inline category picker.
 * Updates category_id + category_source, then auto-learns a rule + merchant mapping.
 */
export async function quickRecategorise(transactionId: string, categoryId: string) {
  const userId = await getCurrentUserId();

  const [txn] = await db
    .select({
      description: transactionsTable.description,
      merchant_name: transactionsTable.merchant_name,
    })
    .from(transactionsTable)
    .where(and(eq(transactionsTable.id, transactionId), eq(transactionsTable.user_id, userId)));

  if (!txn) throw new Error('Transaction not found');

  await db
    .update(transactionsTable)
    .set({ category_id: categoryId, category_source: 'manual' })
    .where(and(eq(transactionsTable.id, transactionId), eq(transactionsTable.user_id, userId)));

  revalidateDomains('transactions', 'categories');

  // Auto-learn in the background — decrypted description needed for rule pattern
  const userKey = await getUserKey(userId);
  const description = txn.description ? decryptForUser(txn.description, userKey) : '';
  const merchantName = txn.merchant_name ?? description;

  const { learnCategorisationRule } = await import('@/db/mutations/categorisation-rules');
  const { learnMerchantMapping } = await import('@/db/mutations/merchant-mappings');

  await Promise.all([
    learnCategorisationRule(description, categoryId),
    learnMerchantMapping(merchantName, categoryId),
  ]).catch((err) => logger.warn('quickRecategorise', 'auto-learn failed', err));

  return { id: transactionId };
}