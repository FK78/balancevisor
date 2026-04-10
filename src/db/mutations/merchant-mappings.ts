'use server';

import { db } from '@/index';
import { merchantMappingsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
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

  const [existing] = await db
    .select({ id: merchantMappingsTable.id, category_id: merchantMappingsTable.category_id })
    .from(merchantMappingsTable)
    .where(
      and(
        eq(merchantMappingsTable.user_id, userId),
        eq(merchantMappingsTable.merchant, merchant),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.category_id === categoryId) return;
    await db
      .update(merchantMappingsTable)
      .set({ category_id: categoryId, source, updated_at: new Date() })
      .where(eq(merchantMappingsTable.id, existing.id));
  } else {
    await db.insert(merchantMappingsTable).values({
      user_id: userId,
      merchant,
      category_id: categoryId,
      source,
    });
  }

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

  const [existing] = await db
    .select({ id: merchantMappingsTable.id, category_id: merchantMappingsTable.category_id })
    .from(merchantMappingsTable)
    .where(
      and(
        eq(merchantMappingsTable.user_id, userId),
        eq(merchantMappingsTable.merchant, merchant),
      ),
    )
    .limit(1);

  if (existing) {
    if (existing.category_id === categoryId) return;
    await db
      .update(merchantMappingsTable)
      .set({ category_id: categoryId, source, updated_at: new Date() })
      .where(eq(merchantMappingsTable.id, existing.id));
  } else {
    await db.insert(merchantMappingsTable).values({
      user_id: userId,
      merchant,
      category_id: categoryId,
      source,
    });
  }
}
