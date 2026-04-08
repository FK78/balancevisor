'use server';

import { db } from '@/index';
import { goalsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireString, sanitizeNumber, sanitizeDate, sanitizeString, sanitizeColor } from '@/lib/sanitize';
import { requireOwnership } from '@/lib/ownership';

export async function addGoal(formData: FormData) {
  const userId = await getCurrentUserId();

  const name = requireString(formData.get('name') as string, 'Goal name');
  const target_amount = sanitizeNumber(formData.get('target_amount') as string, 'Target amount', { required: true, min: 0.01 });
  const saved_amount = sanitizeNumber(formData.get('saved_amount') as string, 'Saved amount');
  const target_date = sanitizeDate(formData.get('target_date') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);
  const color = sanitizeColor(formData.get('color') as string);

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

  const name = requireString(formData.get('name') as string, 'Goal name');
  const target_amount = sanitizeNumber(formData.get('target_amount') as string, 'Target amount', { required: true, min: 0.01 });
  const saved_amount = sanitizeNumber(formData.get('saved_amount') as string, 'Saved amount');
  const target_date = sanitizeDate(formData.get('target_date') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);
  const color = sanitizeColor(formData.get('color') as string);

  await db.update(goalsTable).set({
    name,
    target_amount,
    saved_amount,
    target_date,
    icon,
    color,
  }).where(eq(goalsTable.id, id));
  revalidateDomains('goals');
}

export async function deleteGoal(id: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(goalsTable, id, userId, 'goal');

  await db.delete(goalsTable).where(eq(goalsTable.id, id));
  revalidateDomains('goals');
}

export async function contributeToGoal(id: string, amount: number) {
  const userId = await getCurrentUserId();

  if (!amount || amount <= 0) {
    throw new Error('Amount must be positive');
  }

  await requireOwnership(goalsTable, id, userId, 'goal');

  const [goal] = await db.select({ saved_amount: goalsTable.saved_amount })
    .from(goalsTable)
    .where(eq(goalsTable.id, id));

  if (!goal) {
    throw new Error('Goal not found');
  }

  await db.update(goalsTable).set({
    saved_amount: goal.saved_amount + amount,
  }).where(eq(goalsTable.id, id));
  revalidateDomains('goals');
}
