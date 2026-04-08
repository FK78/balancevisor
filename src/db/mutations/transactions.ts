'use server';

import { db } from '@/index';
import { accountsTable, transactionsTable, transactionSplitsTable } from '@/db/schema';
import { revalidateDomains } from '@/lib/revalidate';
import { toDateString } from '@/lib/date';
import { eq, sql } from 'drizzle-orm';
import { getCurrentUserId, getCurrentUserEmail } from '@/lib/auth';
import { hasEditAccess } from '@/db/queries/sharing';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { encryptForUser, getUserKey } from '@/lib/encryption';
import { matchCategorisationRule } from '@/lib/auto-categorise';
import { invalidateByUser } from '@/lib/cache';
import { requireString, sanitizeNumber, sanitizeEnum, requireDate, sanitizeUUID, sanitizeString } from '@/lib/sanitize';

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

function balanceDelta(type: 'income' | 'expense' | 'transfer' | 'sale', amount: number) {
  if (type === 'transfer') return 0;
  if (type === 'income' || type === 'sale') return amount;
  return -amount;
}

export async function addTransaction(formData: FormData) {
  const type = sanitizeEnum(formData.get('type') as string, ['income', 'expense', 'sale'] as const, 'expense');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const accountId = requireString(formData.get('account_id') as string, 'Account');

  // Verify the user owns or has edit access to this account
  const userId = await getCurrentUserId();
  const email = await getCurrentUserEmail();
  const canEdit = await hasEditAccess(userId, email, 'account', accountId);
  if (!canEdit) throw new Error('You do not have access to this account');

  const isRecurring = formData.get('is_recurring') === 'true';
  const recurringPattern = isRecurring
    ? sanitizeEnum(formData.get('recurring_pattern') as string, ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const, 'monthly')
    : null;
  const txnDate = requireDate(formData.get('date') as string, 'Date');
  const nextRecurringDate = isRecurring && recurringPattern && txnDate
    ? computeNextRecurringDate(txnDate, recurringPattern)
    : null;

  const description = sanitizeString(formData.get('description') as string) ?? '';
  let categoryId = sanitizeUUID(formData.get('category_id') as string);

  // Auto-categorise if no category was selected
  if (!categoryId && description) {
    const matched = await matchCategorisationRule(userId, description);
    if (matched) categoryId = matched;
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
      recurring_pattern: recurringPattern as typeof transactionsTable.$inferInsert['recurring_pattern'],
      next_recurring_date: nextRecurringDate,
    }, userId, tx);

    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} + ${balanceDelta(type, amount)}` })
      .where(eq(accountsTable.id, accountId));

    return inserted;
  });

  revalidateDomains('transactions', 'accounts');

  await checkBudgetAlerts(userId);
  invalidateByUser(userId);

  return result;
}

export async function editTransaction(formData: FormData) {
  const id = requireString(formData.get('id') as string, 'Transaction ID');
  const newType = sanitizeEnum(formData.get('type') as string, ['income', 'expense', 'sale'] as const, 'expense');
  const newAmount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const newAccountId = requireString(formData.get('account_id') as string, 'Account');

  // Verify access
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();
  const canEdit = await hasEditAccess(userId, userEmail, 'account', newAccountId);
  if (!canEdit) throw new Error('You do not have access to this account');

  // Fetch old transaction to reverse its balance effect
  const [old] = await db.select({
    type: transactionsTable.type,
    amount: transactionsTable.amount,
    account_id: transactionsTable.account_id,
  }).from(transactionsTable).where(eq(transactionsTable.id, id));

  const isRecurring = formData.get('is_recurring') === 'true';
  const recurringPattern = isRecurring
    ? sanitizeEnum(formData.get('recurring_pattern') as string, ['daily', 'weekly', 'biweekly', 'monthly', 'yearly'] as const, 'monthly')
    : null;
  const txnDate = requireDate(formData.get('date') as string, 'Date');
  const nextRecurringDate = isRecurring && recurringPattern && txnDate
    ? computeNextRecurringDate(txnDate, recurringPattern)
    : null;

  const editDescription = sanitizeString(formData.get('description') as string) ?? '';
  const userKey = await getUserKey(userId);

  const result = await db.transaction(async (tx) => {
    const [updated] = await tx.update(transactionsTable).set({
      type: newType,
      amount: newAmount,
      description: encryptForUser(editDescription, userKey),
      is_recurring: isRecurring,
      date: txnDate,
      account_id: newAccountId,
      category_id: sanitizeUUID(formData.get('category_id') as string),
      recurring_pattern: recurringPattern as typeof transactionsTable.$inferInsert['recurring_pattern'],
      next_recurring_date: nextRecurringDate,
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
  invalidateByUser(userId);

  return result;
}

export async function addTransfer(formData: FormData) {
  const userId = await getCurrentUserId();
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const fromAccountId = requireString(formData.get('from_account_id') as string, 'Source account');
  const toAccountId = requireString(formData.get('to_account_id') as string, 'Destination account');
  const description = sanitizeString(formData.get('description') as string) ?? 'Transfer';
  const txnDate = requireDate(formData.get('date') as string, 'Date');

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
  invalidateByUser(userId);

  return result;
}

export async function deleteTransaction(id: string) {
  const userId = await getCurrentUserId();
  const userEmail = await getCurrentUserEmail();

  // Fetch transaction along with the owning account to verify access
  const [txn] = await db.select({
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

  await db.transaction(async (tx) => {
    await tx.delete(transactionsTable).where(eq(transactionsTable.id, id));

    if (txn?.type === 'transfer') {
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
    } else if (txn?.account_id) {
      await tx.update(accountsTable)
        .set({ balance: sql`${accountsTable.balance} - ${balanceDelta(txn.type, txn.amount)}` })
        .where(eq(accountsTable.id, txn.account_id));
    }
  });

  revalidateDomains('transactions', 'accounts');
  invalidateByUser(userId);
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