import { db } from '@/index';
import { transactionsTable } from '@/db/schema';
import { and, eq, gte, lte } from 'drizzle-orm';
import { decryptForUser, getUserKey } from '@/lib/encryption';

export type PotentialDuplicate = {
  id: string;
  description: string;
  amount: number;
  date: string;
};

/**
 * Check for potential duplicate transactions.
 * Matches on same account + same amount within ±3 days.
 * Returns decrypted descriptions for display.
 */
export async function findPotentialDuplicates(
  userId: string,
  accountId: string,
  amount: number,
  date: string,
  type: 'income' | 'expense' | 'transfer' | 'sale',
): Promise<PotentialDuplicate[]> {
  const d = new Date(date + 'T00:00:00');
  const from = new Date(d);
  from.setDate(from.getDate() - 3);
  const to = new Date(d);
  to.setDate(to.getDate() + 3);

  const fromStr = from.toISOString().split('T')[0];
  const toStr = to.toISOString().split('T')[0];

  const rows = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      date: transactionsTable.date,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.account_id, accountId),
        eq(transactionsTable.type, type),
        eq(transactionsTable.amount, amount),
        gte(transactionsTable.date, fromStr),
        lte(transactionsTable.date, toStr),
      ),
    )
    .limit(3);

  if (rows.length === 0) return [];

  const userKey = await getUserKey(userId);
  return rows.map((r) => ({
    id: r.id,
    description: r.description ? decryptForUser(r.description, userKey) : '',
    amount: r.amount,
    date: r.date ?? '',
  }));
}
