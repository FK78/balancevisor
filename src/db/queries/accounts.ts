import { db } from '@/index';
import { accountsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import type { AccountWithDetails } from '@/lib/types';

export async function getAccountById(
  userId: string,
  accountId: string,
): Promise<AccountWithDetails | null> {
  const [row] = await db
    .select({
      id: accountsTable.id,
      accountName: accountsTable.name,
      type: accountsTable.type,
      balance: accountsTable.balance,
      currency: accountsTable.currency,
      user_id: accountsTable.user_id,
      truelayer_id: accountsTable.truelayer_id,
      truelayer_connection_id: accountsTable.truelayer_connection_id,
    })
    .from(accountsTable)
    .where(and(eq(accountsTable.id, accountId), eq(accountsTable.user_id, userId)));

  if (!row) return null;

  const userKey = await getUserKey(userId);
  const decrypted = decryptForUser(row.accountName, userKey);
  return { ...row, accountName: decrypted, name: decrypted };
}

export async function getAccountsWithDetails(userId: string): Promise<AccountWithDetails[]> {
  const userKey = await getUserKey(userId);
  const rows = await db.select({
    id: accountsTable.id,
    accountName: accountsTable.name,
    type: accountsTable.type,
    balance: accountsTable.balance,
    currency: accountsTable.currency,
    user_id: accountsTable.user_id,
    truelayer_id: accountsTable.truelayer_id,
    truelayer_connection_id: accountsTable.truelayer_connection_id,
  })
    .from(accountsTable)
    .where(eq(accountsTable.user_id, userId));

  return rows.map(row => {
    const decrypted = decryptForUser(row.accountName, userKey);
    return {
      ...row,
      accountName: decrypted,
      name: decrypted,
    };
  });
}
