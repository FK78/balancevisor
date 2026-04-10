'use server';

import { db } from '@/index';
import { budgetsTable, sharedAccessTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireUUID, sanitizeNumber, sanitizeEnum, requireDate } from '@/lib/sanitize';
import { requireOwnership } from '@/lib/ownership';

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

  await db.update(budgetsTable).set({
    category_id,
    amount,
    period,
    start_date,
  }).where(and(eq(budgetsTable.id, id), eq(budgetsTable.user_id, userId)));

  revalidateDomains('budgets');
}

export async function applyBudgetSuggestion(
  type: 'new' | 'increase' | 'decrease',
  categoryId: string,
  suggestedAmount: number,
  budgetId: string | null,
) {
  const userId = await getCurrentUserId();

  if (type === 'new') {
    const validCategoryId = requireUUID(categoryId, 'Category');
    const amount = sanitizeNumber(String(suggestedAmount), 'Amount', { required: true, min: 0.01 });
    const start_date = new Date().toISOString().split('T')[0];

    await db.insert(budgetsTable).values({
      user_id: userId,
      category_id: validCategoryId,
      amount,
      period: 'monthly',
      start_date,
    });
  } else {
    if (!budgetId) throw new Error('Budget ID is required for adjustments');
    await requireOwnership(budgetsTable, budgetId, userId, 'budget');
    const amount = sanitizeNumber(String(suggestedAmount), 'Amount', { required: true, min: 0.01 });

    await db.update(budgetsTable).set({ amount }).where(
      and(eq(budgetsTable.id, budgetId), eq(budgetsTable.user_id, userId)),
    );
  }

  revalidateDomains('budgets', 'onboarding');
}

export async function deleteBudget(id: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(budgetsTable, id, userId, 'budget');

  await db.delete(sharedAccessTable).where(and(eq(sharedAccessTable.resource_type, 'budget'), eq(sharedAccessTable.resource_id, id)));
  await db.delete(budgetsTable).where(and(eq(budgetsTable.id, id), eq(budgetsTable.user_id, userId)));

  revalidateDomains('budgets');
}
