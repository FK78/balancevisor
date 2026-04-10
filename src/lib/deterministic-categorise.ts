/**
 * Applies rule-based + merchant-mapping categorisation to uncategorised
 * transactions. Runs before AI so that known patterns are resolved instantly
 * without consuming LLM tokens.
 */

import { db } from "@/index";
import { transactionsTable } from "@/db/schema";
import { and, eq, isNull, inArray } from "drizzle-orm";
import { fetchUserRules, matchAgainstRules } from "@/lib/auto-categorise";
import { getAllMerchantMappings } from "@/db/queries/merchant-mappings";
import { normaliseMerchant } from "@/lib/merchant-normalise";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { revalidateDomains } from "@/lib/revalidate";
import { logger } from "@/lib/logger";

export type DeterministicResult = {
  categorised: number;
};

/**
 * Categorise uncategorised transactions using rules + merchant mappings.
 * Optionally scoped to a set of transaction IDs.
 */
export async function applyDeterministicCategorisation(
  userId: string,
  transactionIds?: string[],
): Promise<DeterministicResult> {
  const [rules, merchantMappings] = await Promise.all([
    fetchUserRules(userId),
    getAllMerchantMappings(userId),
  ]);

  if (rules.length === 0 && merchantMappings.length === 0) {
    return { categorised: 0 };
  }

  const conditions = [
    eq(transactionsTable.user_id, userId),
    isNull(transactionsTable.category_id),
  ];
  if (transactionIds && transactionIds.length > 0) {
    conditions.push(inArray(transactionsTable.id, transactionIds));
  }

  const uncategorised = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
    })
    .from(transactionsTable)
    .where(and(...conditions));

  if (uncategorised.length === 0) return { categorised: 0 };

  const userKey = await getUserKey(userId);

  // Classify all in memory, then batch-update
  type CatKey = `${string}|${string}`;
  const categorisedGroups = new Map<CatKey, string[]>();
  const merchantBackfills: Array<{ id: string; merchantName: string }> = [];
  let categorised = 0;

  for (const txn of uncategorised) {
    const description = txn.description
      ? decryptForUser(txn.description, userKey)
      : "";
    const merchantName = normaliseMerchant(description);

    // 1. Try rules
    let categoryId = matchAgainstRules(rules, description);
    let categorySource: string | null = categoryId ? "rule" : null;

    // 2. Try merchant mapping
    if (!categoryId && merchantName) {
      const merchantLower = merchantName.toLowerCase();
      const mapping = merchantMappings.find(
        (m) => m.merchant.toLowerCase() === merchantLower,
      );
      if (mapping?.category_id) {
        categoryId = mapping.category_id;
        categorySource = "merchant";
      }
    }

    if (categoryId) {
      const key: CatKey = `${categoryId}|${categorySource}`;
      const group = categorisedGroups.get(key) ?? [];
      group.push(txn.id);
      categorisedGroups.set(key, group);
      categorised++;
    } else if (merchantName) {
      merchantBackfills.push({ id: txn.id, merchantName });
    }
  }

  // Batch update in a single transaction
  await db.transaction(async (tx) => {
    for (const [key, ids] of categorisedGroups) {
      const [categoryId, categorySource] = key.split("|");
      await tx
        .update(transactionsTable)
        .set({ category_id: categoryId, category_source: categorySource })
        .where(inArray(transactionsTable.id, ids));
    }

    for (const { id, merchantName } of merchantBackfills) {
      await tx
        .update(transactionsTable)
        .set({ merchant_name: merchantName })
        .where(eq(transactionsTable.id, id));
    }
  });

  if (categorised > 0) {
    logger.info(
      "deterministic-categorise",
      `User ${userId}: ${categorised} transactions categorised via rules/merchant mappings`,
    );
    revalidateDomains("transactions", "categories");
  }

  return { categorised };
}
