import { db } from '@/index';
import { transactionsTable, accountsTable, sharedAccessTable } from '@/db/schema';
import { eq, count, or, and, inArray } from 'drizzle-orm';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import type { AccountWithDetails } from '@/lib/types';

export async function getAccountsWithDetails(userId: string): Promise<AccountWithDetails[]> {
  const userKey = await getUserKey(userId);
  const rows = await db.select({
    id: accountsTable.id,
    accountName: accountsTable.name,
    name: accountsTable.name,
    type: accountsTable.type,
    balance: accountsTable.balance,
    currency: accountsTable.currency,
    user_id: accountsTable.user_id,
    truelayer_id: accountsTable.truelayer_id,
    truelayer_connection_id: accountsTable.truelayer_connection_id,
    transactions: count(transactionsTable.id),
  })
    .from(accountsTable)
    .leftJoin(transactionsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(eq(accountsTable.user_id, userId))
    .groupBy(
      accountsTable.id,
      accountsTable.name,
      accountsTable.type,
      accountsTable.balance,
      accountsTable.currency,
      accountsTable.user_id,
      accountsTable.truelayer_id,
      accountsTable.truelayer_connection_id
    );
  return rows.map(row => ({
    ...row,
    accountName: decryptForUser(row.accountName, userKey),
    name: decryptForUser(row.name, userKey),
    isShared: false,
    sharedBy: null,
  }));
}

export async function getSharedAccounts(userId: string, email: string): Promise<AccountWithDetails[]> {
  // Get accepted shared account IDs
  const sharedRows = await db
    .select({
      resource_id: sharedAccessTable.resource_id,
      owner_id: sharedAccessTable.owner_id,
      shared_with_email: sharedAccessTable.shared_with_email,
    })
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.resource_type, "account"),
        eq(sharedAccessTable.status, "accepted"),
        or(
          eq(sharedAccessTable.shared_with_id, userId),
          eq(sharedAccessTable.shared_with_email, email),
        ),
      ),
    );

  if (sharedRows.length === 0) return [];

  const sharedAccountIds = sharedRows.map((r) => r.resource_id);
  const ownerMap = new Map(sharedRows.map((r) => [r.resource_id, r.owner_id]));

  const rows = await db
    .select({
      id: accountsTable.id,
      accountName: accountsTable.name,
      name: accountsTable.name,
      type: accountsTable.type,
      balance: accountsTable.balance,
      currency: accountsTable.currency,
      user_id: accountsTable.user_id,
      truelayer_id: accountsTable.truelayer_id,
      truelayer_connection_id: accountsTable.truelayer_connection_id,
      transactions: count(transactionsTable.id),
    })
    .from(accountsTable)
    .leftJoin(transactionsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(inArray(accountsTable.id, sharedAccountIds))
    .groupBy(
      accountsTable.id,
      accountsTable.name,
      accountsTable.type,
      accountsTable.balance,
      accountsTable.currency,
      accountsTable.user_id,
      accountsTable.truelayer_id,
      accountsTable.truelayer_connection_id
    );

  // Decrypt with owner's key since data is encrypted with owner's key
  const result = await Promise.all(rows.map(async (row) => {
    const ownerId = row.user_id;
    const ownerKey = await getUserKey(ownerId);
    return {
      ...row,
      accountName: decryptForUser(row.accountName, ownerKey),
      name: decryptForUser(row.name, ownerKey),
      isShared: true,
      sharedBy: ownerMap.get(row.id) ?? null,
    };
  }));
  return result;
}
