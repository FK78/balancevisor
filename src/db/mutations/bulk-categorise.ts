'use server';

import { db } from '@/index';
import { transactionsTable } from '@/db/schema';
import { and, eq, isNull } from 'drizzle-orm';
import { getCurrentUserId } from '@/lib/auth';
import { fetchUserRules, matchAgainstRules } from '@/lib/auto-categorise';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import { revalidateDomains } from '@/lib/revalidate';
import { invalidateByUser } from '@/lib/cache';

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

  // Fetch rules once
  const rules = await fetchUserRules(userId);
  if (rules.length === 0) {
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

  let categorised = 0;

  for (const txn of uncategorised) {
    const description = txn.description ? decryptForUser(txn.description, userKey) : '';
    const categoryId = matchAgainstRules(rules, description);
    if (categoryId) {
      await db
        .update(transactionsTable)
        .set({ category_id: categoryId })
        .where(eq(transactionsTable.id, txn.id));
      categorised++;
    }
  }

  if (categorised > 0) {
    revalidateDomains('transactions', 'categories');
    invalidateByUser(userId);
  }

  return {
    categorised,
    remaining: uncategorised.length - categorised,
  };
}
