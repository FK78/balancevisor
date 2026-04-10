import { db } from '@/index';
import { otherAssetsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';

export async function getOtherAssets(userId: string) {
  return db
    .select()
    .from(otherAssetsTable)
    .where(eq(otherAssetsTable.user_id, userId))
    .orderBy(otherAssetsTable.created_at);
}

export async function getZakatableOtherAssets(userId: string) {
  return db
    .select()
    .from(otherAssetsTable)
    .where(
      and(
        eq(otherAssetsTable.user_id, userId),
        eq(otherAssetsTable.is_zakatable, true),
      )
    )
    .orderBy(otherAssetsTable.created_at);
}

export async function getOtherAssetsTotalValue(userId: string): Promise<number> {
  const assets = await getOtherAssets(userId);
  return assets.reduce((sum, a) => sum + a.value, 0);
}
