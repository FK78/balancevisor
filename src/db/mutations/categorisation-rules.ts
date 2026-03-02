'use server';

import { db } from '@/index';
import { categorisationRulesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';
import { requireString, requireUUID, sanitizeNumber } from '@/lib/sanitize';

export async function addCategorisationRule(formData: FormData) {
  const userId = await getCurrentUserId();

  const pattern = requireString(formData.get('pattern') as string, 'Pattern');
  const category_id = requireUUID(formData.get('category_id') as string, 'Category');
  const priority = sanitizeNumber(formData.get('priority') as string, 'Priority');

  await db.insert(categorisationRulesTable).values({
    user_id: userId,
    pattern,
    category_id,
    priority,
  });

  revalidatePath('/dashboard/categories');
}

export async function editCategorisationRule(id: string, formData: FormData) {
  const pattern = requireString(formData.get('pattern') as string, 'Pattern');
  const category_id = requireUUID(formData.get('category_id') as string, 'Category');
  const priority = sanitizeNumber(formData.get('priority') as string, 'Priority');

  await db.update(categorisationRulesTable).set({
    pattern,
    category_id,
    priority,
  }).where(eq(categorisationRulesTable.id, id));

  revalidatePath('/dashboard/categories');
}

export async function deleteCategorisationRule(id: string) {
  await db.delete(categorisationRulesTable).where(eq(categorisationRulesTable.id, id));
  revalidatePath('/dashboard/categories');
}
