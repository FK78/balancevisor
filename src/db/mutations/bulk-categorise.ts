'use server';

import { db } from '@/index';
import { transactionsTable } from '@/db/schema';
import { and, eq, isNull, inArray } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { fetchUserRules, matchAgainstRules } from '@/lib/auto-categorise';
import { getAllMerchantMappings } from '@/db/queries/merchant-mappings';
import { normaliseMerchant } from '@/lib/merchant-normalise';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import { revalidateDomains } from '@/lib/revalidate';

export type BulkCategoriseResult = {
  categorised: number;
  remaining: number;
};

/**
 * Attempts to auto-categorise all uncategorised transactions
 * using the user's categorisation rules (no AI calls to keep it fast).
 */
export async function bulkAutoCategorise(): Promise<BulkCategoriseResult> {
  const userId = await getCurrentUserId();
  const userKey = await getUserKey(userId);

  // Fetch rules and merchant mappings once
  const [rules, merchantMappings] = await Promise.all([
    fetchUserRules(userId),
    getAllMerchantMappings(userId),
  ]);
  if (rules.length === 0 && merchantMappings.length === 0) {
    return { categorised: 0, remaining: 0 };
  }

  // Fetch all uncategorised transactions
  const uncategorised = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        isNull(transactionsTable.category_id),
      ),
    );

  // Classify all transactions in memory first
  type CatKey = `${string}|${string}`;
  const categorisedGroups = new Map<CatKey, string[]>();
  const merchantBackfillIds: string[] = [];
  let categorised = 0;

  for (const txn of uncategorised) {
    const description = txn.description ? decryptForUser(txn.description, userKey) : '';
    const merchantName = normaliseMerchant(description);

    // 1. Try rules first
    let categoryId = matchAgainstRules(rules, description);
    let categorySource: string | null = categoryId ? 'rule' : null;

    // 2. Try merchant mapping if no rule match
    if (!categoryId && merchantName) {
      const merchantLower = merchantName.toLowerCase();
      const mapping = merchantMappings.find(
        (m) => m.merchant.toLowerCase() === merchantLower,
      );
      if (mapping?.category_id) {
        categoryId = mapping.category_id;
        categorySource = 'merchant';
      }
    }

    if (categoryId) {
      const key: CatKey = `${categoryId}|${categorySource}`;
      const group = categorisedGroups.get(key) ?? [];
      group.push(txn.id);
      categorisedGroups.set(key, group);
      categorised++;
    } else if (merchantName) {
      merchantBackfillIds.push(txn.id);
    }
  }

  // Batch update: one UPDATE per category group
  await db.transaction(async (tx) => {
    for (const [key, ids] of categorisedGroups) {
      const [categoryId, categorySource] = key.split('|');
      await tx
        .update(transactionsTable)
        .set({ category_id: categoryId, category_source: categorySource })
        .where(inArray(transactionsTable.id, ids));
    }

    // Batch backfill merchant_name for uncategorised txns
    if (merchantBackfillIds.length > 0) {
      // merchant_name varies per txn so we must update individually,
      // but we wrap in the same transaction to reduce round trips
      for (const txn of uncategorised) {
        if (!merchantBackfillIds.includes(txn.id)) continue;
        const description = txn.description ? decryptForUser(txn.description, userKey) : '';
        const merchantName = normaliseMerchant(description);
        if (merchantName) {
          await tx
            .update(transactionsTable)
            .set({ merchant_name: merchantName })
            .where(eq(transactionsTable.id, txn.id));
        }
      }
    }
  });

  if (categorised > 0) {
    revalidateDomains('transactions', 'categories');
  }

  return {
    categorised,
    remaining: uncategorised.length - categorised,
  };
}
