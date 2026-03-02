'use server';

import { db } from '@/index';
import { categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
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
  revalidatePath('/onboarding');
  revalidatePath('/dashboard/categories');
  return result;
}

export async function editCategory(id: string, formData: FormData) {
  const name = requireString(formData.get('name') as string, 'Category name');
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

  await db.update(categoriesTable).set({
    name,
    color,
    icon,
  }).where(eq(categoriesTable.id, id));
  revalidatePath('/dashboard/categories');
}

export async function deleteCategory(id: string) {
  await db.delete(categoriesTable).where(eq(categoriesTable.id, id));
  revalidatePath('/dashboard/categories');
}
