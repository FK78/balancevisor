'use server';

import { db } from '@/index';
import { categoriesTable, merchantMappingsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { revalidateDomains } from '@/lib/revalidate';
import { resolveBrand } from '@/lib/brand-dictionary';
import { contributeAlias } from '@/db/mutations/brand-dictionary';
import { logger } from '@/lib/logger';

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

  // Look up the category name for the global contribution
  const [cat] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  const categoryName = cat?.name ?? '';

  // Always contribute to global dictionary (anonymous, fire-and-forget)
  contributeAlias(merchant, merchant, categoryName).catch((err) =>
    logger.error('merchant-mappings', 'contributeAlias failed', err),
  );

  // Overrides-only: skip per-user row if it matches the global default
  const brand = await resolveBrand(merchant);
  if (brand && categoryName && brand.defaultCategory.toLowerCase() === categoryName.toLowerCase()) {
    // User agrees with global — delete any existing override, don't create one
    await db.delete(merchantMappingsTable).where(
      and(
        eq(merchantMappingsTable.user_id, userId),
        eq(merchantMappingsTable.merchant, merchant),
      ),
    );
    return;
  }

  // User disagrees with global (or no global entry) — write per-user override
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

  // Look up the category name for the global contribution
  const [cat] = await db
    .select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.id, categoryId))
    .limit(1);
  const categoryName = cat?.name ?? '';

  // Always contribute to global dictionary (anonymous, fire-and-forget)
  contributeAlias(merchant, merchant, categoryName).catch((err) =>
    logger.error('merchant-mappings', 'contributeAlias failed', err),
  );

  // Overrides-only: skip per-user row if it matches the global default
  const brand = await resolveBrand(merchant);
  if (brand && categoryName && brand.defaultCategory.toLowerCase() === categoryName.toLowerCase()) {
    await db.delete(merchantMappingsTable).where(
      and(
        eq(merchantMappingsTable.user_id, userId),
        eq(merchantMappingsTable.merchant, merchant),
      ),
    );
    return;
  }

  // User disagrees with global (or no global entry) — write per-user override
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
