'use server';

import { db } from '@/index';
import { debtsTable, debtPaymentsTable, accountsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { createTransaction } from '@/db/mutations/transactions';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zDate, zString, zColor } from '@/lib/form-schema';
import { requireOwnership } from '@/lib/ownership';

const debtSchema = z.object({
  name: zRequiredString(),
  original_amount: zNumber({ min: 0.01 }),
  remaining_amount: zNumber({ min: 0 }),
  interest_rate: zNumber({ min: 0, max: 100 }),
  minimum_payment: zNumber({ min: 0 }),
  due_date: zDate(),
  lender: zString(),
  color: zColor('#6366f1'),
});

function parseDebtForm(formData: FormData) {
  return parseFormData(debtSchema, formData);
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
