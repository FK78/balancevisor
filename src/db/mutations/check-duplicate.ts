'use server';

import { getCurrentUserId } from '@/lib/auth';
import { findPotentialDuplicates, type PotentialDuplicate } from '@/db/queries/duplicate-check';

/**
 * Server action to check for potential duplicate transactions before saving.
 */
export async function checkForDuplicate(
  accountId: string,
  amount: number,
  date: string,
  type: 'income' | 'expense' | 'transfer' | 'sale',
): Promise<PotentialDuplicate[]> {
  const userId = await getCurrentUserId();
  return findPotentialDuplicates(userId, accountId, amount, date, type);
}
