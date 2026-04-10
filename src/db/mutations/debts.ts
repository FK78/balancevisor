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

function parseDebtForm(formData: FormData) {
  return {
    name: requireString(formData.get('name') as string, 'Debt name'),
    original_amount: sanitizeNumber(formData.get('original_amount') as string, 'Original amount', { required: true, min: 0.01 }),
    remaining_amount: sanitizeNumber(formData.get('remaining_amount') as string, 'Remaining amount', { required: true, min: 0 }),
    interest_rate: sanitizeNumber(formData.get('interest_rate') as string, 'Interest rate', { min: 0, max: 100 }),
    minimum_payment: sanitizeNumber(formData.get('minimum_payment') as string, 'Minimum payment', { min: 0 }),
    due_date: sanitizeDate(formData.get('due_date') as string),
    lender: sanitizeString(formData.get('lender') as string),
    color: sanitizeColor(formData.get('color') as string, '#6366f1'),
  };
}

export async function addDebt(formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, original_amount, remaining_amount, interest_rate, minimum_payment, due_date, lender, color } = parseDebtForm(formData);

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
  const { name, original_amount, remaining_amount, interest_rate, minimum_payment, due_date, lender, color } = parseDebtForm(formData);

  await db.update(debtsTable).set({
    name,
    original_amount,
    remaining_amount,
    interest_rate,
    minimum_payment,
    due_date,
    lender,
    color,
  }).where(and(eq(debtsTable.id, id), eq(debtsTable.user_id, userId)));

  revalidateDomains('debts');
}

export async function deleteDebt(id: string) {
  const userId = await getCurrentUserId();
  await requireOwnership(debtsTable, id, userId, 'debt');
  await db.delete(debtsTable).where(and(eq(debtsTable.id, id), eq(debtsTable.user_id, userId)));
  revalidateDomains('debts');
}

export async function recordDebtPayment(debtId: string, amount: number, date: string, accountId: string, note?: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(debtsTable, debtId, userId, 'debt');
  await requireOwnership(accountsTable, accountId, userId, 'account');

  await db.transaction(async (tx) => {
    // Insert payment record
    await tx.insert(debtPaymentsTable).values({
      debt_id: debtId,
      account_id: accountId,
      amount,
      date,
      note: note || null,
    });

    // Fetch debt name for the transaction description
    const [debt] = await tx.select({
      name: debtsTable.name,
    })
      .from(debtsTable)
      .where(eq(debtsTable.id, debtId));

    // Atomic decrement: prevents lost updates from concurrent payments
    await tx.update(debtsTable).set({
      remaining_amount: sql`GREATEST(${debtsTable.remaining_amount} - ${amount}, 0)`,
    }).where(eq(debtsTable.id, debtId));

    await createTransaction({
      type: 'expense',
      amount,
      description: `Debt payment: ${debt?.name ?? 'Unknown'}`,
      is_recurring: false,
      date,
      account_id: accountId,
      category_id: null,
    }, userId, tx);

    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} - ${amount}` })
      .where(eq(accountsTable.id, accountId));
  });

  await checkBudgetAlerts(userId);

  revalidateDomains('debts', 'transactions', 'accounts');
}
