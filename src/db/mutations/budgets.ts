'use server';

import { db } from '@/index';
import { budgetsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';
import { requireUUID, sanitizeNumber, sanitizeEnum, requireDate } from '@/lib/sanitize';
import { UnauthorizedError } from '@/lib/errors';
import { invalidateByUser } from '@/lib/cache';

export async function addBudget(formData: FormData) {
  const userId = await getCurrentUserId();

  const category_id = requireUUID(formData.get('category_id') as string, 'Category');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const period = sanitizeEnum(formData.get('period') as string, ['monthly', 'weekly'] as const, 'monthly');
  const start_date = requireDate(formData.get('start_date') as string, 'Start date');

  const [result] = await db.insert(budgetsTable).values({
    user_id: userId,
    category_id,
    amount,
    period,
    start_date,
  }).returning({ id: budgetsTable.id });
  revalidatePath('/onboarding');
  revalidatePath('/dashboard/budgets');
  return result;
}

export async function editBudget(id: string, formData: FormData) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const [budget] = await db
    .select({ user_id: budgetsTable.user_id })
    .from(budgetsTable)
    .where(eq(budgetsTable.id, id));

  if (!budget || budget.user_id !== userId) {
    throw new UnauthorizedError('budget');
  }

  const category_id = requireUUID(formData.get('category_id') as string, 'Category');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const period = sanitizeEnum(formData.get('period') as string, ['monthly', 'weekly'] as const, 'monthly');
  const start_date = requireDate(formData.get('start_date') as string, 'Start date');

  await db.update(budgetsTable).set({
    category_id,
    amount,
    period,
    start_date,
  }).where(eq(budgetsTable.id, id));

  revalidatePath('/dashboard/budgets');
  invalidateByUser(userId);
}

export async function deleteBudget(id: string) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const [budget] = await db
    .select({ user_id: budgetsTable.user_id })
    .from(budgetsTable)
    .where(eq(budgetsTable.id, id));

  if (!budget || budget.user_id !== userId) {
    throw new UnauthorizedError('budget');
  }

  await db.delete(budgetsTable).where(eq(budgetsTable.id, id));

  revalidatePath('/dashboard/budgets');
  invalidateByUser(userId);
}
