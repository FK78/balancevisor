'use server';

import { db } from '@/index';
import { categorisationRulesTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { z } from 'zod';
import { parseFormData, zRequiredString, zRequiredUUID, zNumber } from '@/lib/form-schema';

const ruleSchema = z.object({
  pattern: zRequiredString(),
  category_id: zRequiredUUID(),
  priority: zNumber(),
});

export async function addCategorisationRule(formData: FormData) {
  const userId = await getCurrentUserId();

  const { pattern, category_id, priority } = parseFormData(ruleSchema, formData);

  await db.insert(categorisationRulesTable).values({
    user_id: userId,
    pattern,
    category_id,
    priority,
  });

  revalidateDomains('categories');
}

export async function editCategorisationRule(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const { pattern, category_id, priority } = parseFormData(ruleSchema, formData);

  await db.update(categorisationRulesTable).set({
    pattern,
    category_id,
    priority,
  }).where(and(eq(categorisationRulesTable.id, id), eq(categorisationRulesTable.user_id, userId)));

  revalidateDomains('categories');
}

export async function deleteCategorisationRule(id: string) {
  const userId = await getCurrentUserId();
  await db.delete(categorisationRulesTable).where(and(eq(categorisationRulesTable.id, id), eq(categorisationRulesTable.user_id, userId)));
  revalidateDomains('categories');
}

/**
 * Create a categorisation rule from a manual category correction.
 * Called when a user re-categorises a transaction and wants future
 * transactions with the same description to auto-categorise.
 */
export async function learnCategorisationRule(pattern: string, categoryId: string) {
  if (!pattern || !categoryId) return;

  const userId = await getCurrentUserId();

  await db.insert(categorisationRulesTable).values({
    user_id: userId,
    pattern,
    category_id: categoryId,
    priority: 10,
  }).onConflictDoUpdate({
    target: [categorisationRulesTable.user_id, categorisationRulesTable.pattern],
    set: { category_id: categoryId },
  });

  revalidateDomains('categories');
}
