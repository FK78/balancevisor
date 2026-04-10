import { db } from '@/index';
import { merchantMappingsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getMerchantMapping(userId: string, merchant: string) {
  const [row] = await db
    .select({
      category_id: merchantMappingsTable.category_id,
      source: merchantMappingsTable.source,
    })
    .from(merchantMappingsTable)
    .where(
      and(
        eq(merchantMappingsTable.user_id, userId),
        eq(merchantMappingsTable.merchant, merchant),
      ),
    )
    .limit(1);

  return row ?? null;
}

export async function getAllMerchantMappings(userId: string) {
  return db
    .select({
      merchant: merchantMappingsTable.merchant,
      category_id: merchantMappingsTable.category_id,
    })
    .from(merchantMappingsTable)
    .where(eq(merchantMappingsTable.user_id, userId));
}
