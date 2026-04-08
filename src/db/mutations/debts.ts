'use server';

import { db } from '@/index';
import { debtsTable, debtPaymentsTable, accountsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { createTransaction } from '@/db/mutations/transactions';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { requireString, sanitizeNumber, sanitizeDate, sanitizeString, sanitizeColor } from '@/lib/sanitize';
import { requireOwnership } from '@/lib/ownership';

export async function addDebt(formData: FormData) {
  const userId = await getCurrentUserId();

  const name = requireString(formData.get('name') as string, 'Debt name');
  const original_amount = sanitizeNumber(formData.get('original_amount') as string, 'Original amount', { required: true, min: 0.01 });
  const remaining_amount = sanitizeNumber(formData.get('remaining_amount') as string, 'Remaining amount', { required: true, min: 0 });
  const interest_rate = sanitizeNumber(formData.get('interest_rate') as string, 'Interest rate', { min: 0, max: 100 });
  const minimum_payment = sanitizeNumber(formData.get('minimum_payment') as string, 'Minimum payment', { min: 0 });
  const due_date = sanitizeDate(formData.get('due_date') as string);
  const lender = sanitizeString(formData.get('lender') as string);
  const color = sanitizeColor(formData.get('color') as string, '#6366f1');

  const [result] = await db.insert(debtsTable).values({
    user_id: userId,
    name,
    original_amount,
    remaining_amount,
    interest_rate,
    minimum_payment,
    due_date,
    lender,
    color,
  }).returning({ id: debtsTable.id });

  revalidateDomains('debts');
  return result;
}

export async function editDebt(id: string, formData: FormData) {
  const userId = await getCurrentUserId();

  await requireOwnership(debtsTable, id, userId, 'debt');

  const name = requireString(formData.get('name') as string, 'Debt name');
  const original = sanitizeNumber(formData.get('original_amount') as string, 'Original amount', { required: true, min: 0.01 });
  const remaining = sanitizeNumber(formData.get('remaining_amount') as string, 'Remaining amount', { required: true, min: 0 });
  const interest_rate = sanitizeNumber(formData.get('interest_rate') as string, 'Interest rate', { min: 0, max: 100 });
  const minimum_payment = sanitizeNumber(formData.get('minimum_payment') as string, 'Minimum payment', { min: 0 });
  const due_date = sanitizeDate(formData.get('due_date') as string);
  const lender = sanitizeString(formData.get('lender') as string);
  const color = sanitizeColor(formData.get('color') as string, '#6366f1');

  await db.update(debtsTable).set({
    name,
    original_amount: original,
    remaining_amount: remaining,
    interest_rate,
    minimum_payment,
    due_date,
    lender,
    color,
    is_paid_off: remaining <= 0,
  }).where(eq(debtsTable.id, id));

  revalidateDomains('debts');
}

export async function deleteDebt(id: string) {
  const userId = await getCurrentUserId();
  await db.delete(debtsTable).where(and(eq(debtsTable.id, id), eq(debtsTable.user_id, userId)));
  revalidateDomains('debts');
}

export async function recordDebtPayment(debtId: string, amount: number, date: string, accountId: string, note?: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(debtsTable, debtId, userId, 'debt');
  await requireOwnership(accountsTable, accountId, userId, 'account');

  // Insert payment record
  await db.insert(debtPaymentsTable).values({
    debt_id: debtId,
    account_id: accountId,
    amount,
    date,
    note: note || null,
  });

  // Reduce remaining amount
  const [debt] = await db.select({
    remaining_amount: debtsTable.remaining_amount,
    name: debtsTable.name,
  })
    .from(debtsTable)
    .where(eq(debtsTable.id, debtId));

  if (debt) {
    const newRemaining = Math.max(debt.remaining_amount - amount, 0);
    await db.update(debtsTable).set({
      remaining_amount: newRemaining,
      is_paid_off: newRemaining <= 0,
    }).where(eq(debtsTable.id, debtId));
  }

  await createTransaction({
    type: 'expense',
    amount,
    description: `Debt payment: ${debt?.name ?? 'Unknown'}`,
    is_recurring: false,
    date,
    account_id: accountId,
    category_id: null,
  }, userId);

  await db.update(accountsTable)
    .set({ balance: sql`${accountsTable.balance} - ${amount}` })
    .where(eq(accountsTable.id, accountId));

  await checkBudgetAlerts(userId);

  revalidateDomains('debts', 'transactions', 'accounts');
}
