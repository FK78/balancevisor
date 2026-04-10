'use server';

import { db } from '@/index';
import { merchantMappingsTable } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';
import { revalidateDomains } from '@/lib/revalidate';

/**
 * Upsert a merchant → category mapping.
 * Called automatically when a user corrects a transaction's category.
 */
export async function learnMerchantMapping(
  merchant: string,
  categoryId: string,
  source: string = 'correction',
) {
  if (!merchant || !categoryId) return;

  const userId = await getCurrentUserId();

  await db.insert(merchantMappingsTable).values({
    user_id: userId,
    merchant,
    category_id: categoryId,
    source,
  }).onConflictDoUpdate({
    target: [merchantMappingsTable.user_id, merchantMappingsTable.merchant],
    set: { category_id: categoryId, source, updated_at: new Date() },
  });

  revalidateDomains('categories');
}

/**
 * Upsert without requiring auth context — used during imports where userId is known.
 */
export async function learnMerchantMappingForUser(
  userId: string,
  merchant: string,
  categoryId: string,
  source: string = 'correction',
) {
  if (!merchant || !categoryId) return;

  await db.insert(merchantMappingsTable).values({
    user_id: userId,
    merchant,
    category_id: categoryId,
    source,
  }).onConflictDoUpdate({
    target: [merchantMappingsTable.user_id, merchantMappingsTable.merchant],
    set: { category_id: categoryId, source, updated_at: new Date() },
  });
}
