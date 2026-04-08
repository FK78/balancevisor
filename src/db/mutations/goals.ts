'use server';

import { getUserDb } from '@/db/rls-context';
import { goalsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireString, sanitizeNumber, sanitizeDate, sanitizeString, sanitizeColor } from '@/lib/sanitize';
import { requireOwnership } from '@/lib/ownership';

function parseGoalForm(formData: FormData) {
  return {
    name: requireString(formData.get('name') as string, 'Goal name'),
    target_amount: sanitizeNumber(formData.get('target_amount') as string, 'Target amount', { required: true, min: 0.01 }),
    saved_amount: sanitizeNumber(formData.get('saved_amount') as string, 'Saved amount'),
    target_date: sanitizeDate(formData.get('target_date') as string),
    icon: sanitizeString(formData.get('icon') as string, 50),
    color: sanitizeColor(formData.get('color') as string),
  };
}

export async function addGoal(formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, target_amount, saved_amount, target_date, icon, color } = parseGoalForm(formData);

  const userDb = await getUserDb(userId);
  const [result] = await userDb.insert(goalsTable).values({
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

  const userDb = await getUserDb(userId);
  await userDb.update(goalsTable).set({
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

  const userDb = await getUserDb(userId);
  await userDb.delete(goalsTable).where(eq(goalsTable.id, id));
  revalidateDomains('goals');
}

export async function contributeToGoal(id: string, amount: number) {
  const userId = await getCurrentUserId();

  if (!amount || amount <= 0) {
    throw new Error('Amount must be positive');
  }

  await requireOwnership(goalsTable, id, userId, 'goal');

  const userDb = await getUserDb(userId);
  const [goal] = await userDb.select({ saved_amount: goalsTable.saved_amount })
    .from(goalsTable)
    .where(eq(goalsTable.id, id));

  if (!goal) {
    throw new Error('Goal not found');
  }

  await userDb.update(goalsTable).set({
    saved_amount: goal.saved_amount + amount,
  }).where(eq(goalsTable.id, id));
  revalidateDomains('goals');
}
