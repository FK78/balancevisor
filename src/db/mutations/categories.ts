'use server';

import { db } from '@/index';
import { categoriesTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireString, sanitizeColor, sanitizeString } from '@/lib/sanitize';

export async function addCategory(formData: FormData) {
  const userId = await getCurrentUserId();

  const name = requireString(formData.get('name') as string, 'Category name');
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

  const [result] = await db.insert(categoriesTable).values({
    user_id: userId,
    name,
    color,
    icon,
  }).returning({ id: categoriesTable.id });
  revalidateDomains('categories', 'onboarding');
  return result;
}

export async function editCategory(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const name = requireString(formData.get('name') as string, 'Category name');
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

  await db.update(categoriesTable).set({
    name,
    color,
    icon,
  }).where(and(eq(categoriesTable.id, id), eq(categoriesTable.user_id, userId)));
  revalidateDomains('categories');
}

export async function deleteCategory(id: string) {
  const userId = await getCurrentUserId();
  await db.delete(categoriesTable).where(and(eq(categoriesTable.id, id), eq(categoriesTable.user_id, userId)));
  revalidateDomains('categories');
}
