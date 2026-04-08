'use server';

import { getUserDb } from '@/db/rls-context';
import { categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { requireString, sanitizeColor, sanitizeString } from '@/lib/sanitize';

export async function addCategory(formData: FormData) {
  const userId = await getCurrentUserId();

  const name = requireString(formData.get('name') as string, 'Category name');
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

  const userDb = await getUserDb(userId);
  const [result] = await userDb.insert(categoriesTable).values({
    user_id: userId,
    name,
    color,
    icon,
  }).returning({ id: categoriesTable.id });
  revalidateDomains('categories', 'onboarding');
  return result;
}

export async function editCategory(id: string, formData: FormData) {
  const name = requireString(formData.get('name') as string, 'Category name');
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

  const userId = await getCurrentUserId();
  const userDb = await getUserDb(userId);
  await userDb.update(categoriesTable).set({
    name,
    color,
    icon,
  }).where(eq(categoriesTable.id, id));
  revalidateDomains('categories');
}

export async function deleteCategory(id: string) {
  const userId = await getCurrentUserId();
  const userDb = await getUserDb(userId);
  await userDb.delete(categoriesTable).where(eq(categoriesTable.id, id));
  revalidateDomains('categories');
}
