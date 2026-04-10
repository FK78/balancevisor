'use server';

import { db } from '@/index';
import { goalsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zDate, zString, zColor } from '@/lib/form-schema';
import { requireOwnership } from '@/lib/ownership';

const goalSchema = z.object({
  name: zRequiredString(),
  target_amount: zNumber({ min: 0.01 }),
  saved_amount: zNumber({ min: 0 }),
  target_date: zDate(),
  icon: zString(50),
  color: zColor(),
});

function parseGoalForm(formData: FormData) {
  return parseFormData(goalSchema, formData);
}

export async function addGoal(formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, target_amount, saved_amount, target_date, icon, color } = parseGoalForm(formData);

  const [result] = await db.insert(goalsTable).values({
    user_id: userId,
    name,
    target_amount,
    saved_amount,
    target_date,
    icon,
    color,
  }).returning({ id: goalsTable.id });
  revalidateDomains('goals');
  return result;
}

export async function editGoal(id: string, formData: FormData) {
  const userId = await getCurrentUserId();

  await requireOwnership(goalsTable, id, userId, 'goal');
  const { name, target_amount, saved_amount, target_date, icon, color } = parseGoalForm(formData);

  await db.update(goalsTable).set({
    name,
    target_amount,
    saved_amount,
    target_date,
    icon,
    color,
  }).where(and(eq(goalsTable.id, id), eq(goalsTable.user_id, userId)));
  revalidateDomains('goals');
}

export async function deleteGoal(id: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(goalsTable, id, userId, 'goal');

  await db.delete(goalsTable).where(and(eq(goalsTable.id, id), eq(goalsTable.user_id, userId)));
  revalidateDomains('goals');
}

export async function contributeToGoal(id: string, amount: number) {
  const userId = await getCurrentUserId();

  if (!amount || amount <= 0) {
    throw new Error('Amount must be positive');
  }

  await requireOwnership(goalsTable, id, userId, 'goal');

  await db.update(goalsTable).set({
    saved_amount: sql`${goalsTable.saved_amount} + ${amount}`,
  }).where(and(eq(goalsTable.id, id), eq(goalsTable.user_id, userId)));
  revalidateDomains('goals');
}
