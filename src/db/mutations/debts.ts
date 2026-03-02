'use server';

import { db } from '@/index';
import { debtsTable, debtPaymentsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';

export async function addDebt(formData: FormData) {
  const userId = await getCurrentUserId();

  const [result] = await db.insert(debtsTable).values({
    user_id: userId,
    name: formData.get('name') as string,
    original_amount: parseFloat(formData.get('original_amount') as string),
    remaining_amount: parseFloat(formData.get('remaining_amount') as string),
    interest_rate: parseFloat(formData.get('interest_rate') as string) || 0,
    minimum_payment: parseFloat(formData.get('minimum_payment') as string) || 0,
    due_date: (formData.get('due_date') as string) || null,
    lender: (formData.get('lender') as string) || null,
    color: (formData.get('color') as string) || '#ef4444',
  }).returning({ id: debtsTable.id });

  revalidatePath('/dashboard/debts');
  revalidatePath('/dashboard');
  return result;
}

export async function editDebt(id: number, formData: FormData) {
  const remaining = parseFloat(formData.get('remaining_amount') as string);
  const original = parseFloat(formData.get('original_amount') as string);

  await db.update(debtsTable).set({
    name: formData.get('name') as string,
    original_amount: original,
    remaining_amount: remaining,
    interest_rate: parseFloat(formData.get('interest_rate') as string) || 0,
    minimum_payment: parseFloat(formData.get('minimum_payment') as string) || 0,
    due_date: (formData.get('due_date') as string) || null,
    lender: (formData.get('lender') as string) || null,
    color: (formData.get('color') as string) || '#ef4444',
    is_paid_off: remaining <= 0,
  }).where(eq(debtsTable.id, id));

  revalidatePath('/dashboard/debts');
  revalidatePath('/dashboard');
}

export async function deleteDebt(id: number) {
  await db.delete(debtsTable).where(eq(debtsTable.id, id));
  revalidatePath('/dashboard/debts');
  revalidatePath('/dashboard');
}

export async function recordDebtPayment(debtId: number, amount: number, date: string, note?: string) {
  // Insert payment record
  await db.insert(debtPaymentsTable).values({
    debt_id: debtId,
    amount,
    date,
    note: note || null,
  });

  // Reduce remaining amount
  const [debt] = await db.select({ remaining_amount: debtsTable.remaining_amount })
    .from(debtsTable)
    .where(eq(debtsTable.id, debtId));

  if (debt) {
    const newRemaining = Math.max(debt.remaining_amount - amount, 0);
    await db.update(debtsTable).set({
      remaining_amount: newRemaining,
      is_paid_off: newRemaining <= 0,
    }).where(eq(debtsTable.id, debtId));
  }

  revalidatePath('/dashboard/debts');
  revalidatePath('/dashboard');
}
