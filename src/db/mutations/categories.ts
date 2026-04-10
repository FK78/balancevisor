'use server';

import { db } from '@/index';
import { categoriesTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { z } from 'zod';
import { parseFormData, zRequiredString, zString, zColor } from '@/lib/form-schema';

const categorySchema = z.object({
  name: zRequiredString(),
  color: zColor(),
  icon: zString(50),
});

export async function addCategory(formData: FormData) {
  const userId = await getCurrentUserId();

  const { name, color, icon } = parseFormData(categorySchema, formData);

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
  const { name, color, icon } = parseFormData(categorySchema, formData);

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
