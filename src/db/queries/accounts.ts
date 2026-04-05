import { db } from '@/index';
import { transactionsTable, accountsTable, sharedAccessTable } from '@/db/schema';
import { eq, count, or, and, inArray } from 'drizzle-orm';
import { decrypt } from '@/lib/encryption';
import type { AccountWithDetails } from '@/lib/types';

export async function getAccountsWithDetails(userId: string): Promise<AccountWithDetails[]> {
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
    accountName: decrypt(row.accountName),
    name: decrypt(row.name),
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

  return rows.map((row) => ({
    ...row,
    accountName: decrypt(row.accountName),
    name: decrypt(row.name),
    isShared: true,
    sharedBy: ownerMap.get(row.id) ?? null,
  }));
}
