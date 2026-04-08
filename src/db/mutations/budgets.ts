'use server';

import { getUserDb } from '@/db/rls-context';
import { budgetsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireUUID, sanitizeNumber, sanitizeEnum, requireDate } from '@/lib/sanitize';
import { requireOwnership } from '@/lib/ownership';
import { invalidateByUser } from '@/lib/cache';

export async function addBudget(formData: FormData) {
  const userId = await getCurrentUserId();

  const category_id = requireUUID(formData.get('category_id') as string, 'Category');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const period = sanitizeEnum(formData.get('period') as string, ['monthly', 'weekly'] as const, 'monthly');
  const start_date = requireDate(formData.get('start_date') as string, 'Start date');

  const userDb = await getUserDb(userId);
  const [result] = await userDb.insert(budgetsTable).values({
    user_id: userId,
    category_id,
    amount,
    period,
    start_date,
  }).returning({ id: budgetsTable.id });
  revalidateDomains('budgets', 'onboarding');
  return result;
}

export async function editBudget(id: string, formData: FormData) {
  const userId = await getCurrentUserId();

  await requireOwnership(budgetsTable, id, userId, 'budget');

  const category_id = requireUUID(formData.get('category_id') as string, 'Category');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const period = sanitizeEnum(formData.get('period') as string, ['monthly', 'weekly'] as const, 'monthly');
  const start_date = requireDate(formData.get('start_date') as string, 'Start date');

  const userDb = await getUserDb(userId);
  await userDb.update(budgetsTable).set({
    category_id,
    amount,
    period,
    start_date,
  }).where(eq(budgetsTable.id, id));

  revalidateDomains('budgets');
  invalidateByUser(userId);
}

export async function deleteBudget(id: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(budgetsTable, id, userId, 'budget');

  const userDb = await getUserDb(userId);
  await userDb.delete(budgetsTable).where(eq(budgetsTable.id, id));

  revalidateDomains('budgets');
  invalidateByUser(userId);
}
