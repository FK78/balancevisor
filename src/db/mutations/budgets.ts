'use server';

import { db } from '@/index';
import { budgetsTable, sharedAccessTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { z } from 'zod';
import { parseFormData, zRequiredUUID, zNumber, zEnum, zRequiredDate } from '@/lib/form-schema';
import { requireOwnership } from '@/lib/ownership';
import { ConflictError } from '@/lib/errors';

const budgetSchema = z.object({
  category_id: zRequiredUUID(),
  amount: zNumber({ min: 0.01 }),
  period: zEnum(['monthly', 'weekly'] as const, 'monthly'),
  start_date: zRequiredDate(),
});

export async function addBudget(formData: FormData) {
  const userId = await getCurrentUserId();

  const { category_id, amount, period, start_date } = parseFormData(budgetSchema, formData);

  const rows = await db.insert(budgetsTable).values({
    user_id: userId,
    category_id,
    amount,
    period,
    start_date,
  }).onConflictDoNothing().returning({ id: budgetsTable.id });

  if (rows.length === 0) {
    throw new ConflictError('A budget already exists for this category. Edit the existing one instead.');
  }

  revalidateDomains('budgets', 'onboarding');
  return rows[0];
}

export async function editBudget(id: string, formData: FormData) {
  const userId = await getCurrentUserId();

  await requireOwnership(budgetsTable, id, userId, 'budget');

  const { category_id, amount, period, start_date } = parseFormData(budgetSchema, formData);

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
    const validCategoryId = z.string().uuid().parse(categoryId);
    const amount = z.number().min(0.01).parse(suggestedAmount);
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
    const amount = z.number().min(0.01).parse(suggestedAmount);

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
