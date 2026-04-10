import { db } from '@/index';
import { transactionsTable, categoriesTable, accountsTable } from '@/db/schema';
import { and, desc, eq, sql, sum, gte, lte, lt } from 'drizzle-orm';
import { decryptForUser, getUserKey } from '@/lib/encryption';

// ---------------------------------------------------------------------------
// Shared internals (used by transaction-search.ts too)
// ---------------------------------------------------------------------------

export async function decryptTransactionRows<T extends { description?: string | null; accountName?: string | null }>(rows: T[], userId: string): Promise<T[]> {
  const userKey = await getUserKey(userId);
  return rows.map(row => ({
    ...row,
    ...(row.description != null && { description: decryptForUser(row.description, userKey) }),
    ...(row.accountName != null && { accountName: decryptForUser(row.accountName, userKey) }),
  }));
}

export const transactionSelect = {
  id: transactionsTable.id,
  accountName: accountsTable.name,
  account_id: transactionsTable.account_id,
  type: transactionsTable.type,
  amount: transactionsTable.amount,
  category: categoriesTable.name,
  category_id: transactionsTable.category_id,
  description: transactionsTable.description,
  date: transactionsTable.date,
  is_recurring: transactionsTable.is_recurring,
  transfer_account_id: transactionsTable.transfer_account_id,
  is_split: transactionsTable.is_split,
  refund_for_transaction_id: transactionsTable.refund_for_transaction_id,
  category_source: transactionsTable.category_source,
  merchant_name: transactionsTable.merchant_name,
};

export function baseTransactionsQuery(userId: string) {
  return db.select(transactionSelect)
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(eq(transactionsTable.user_id, userId))
    .$dynamic();
}

// ---------------------------------------------------------------------------
// Export type
// ---------------------------------------------------------------------------

export type ExportTransaction = {
  id: string;
  date: string | null;
  type: 'income' | 'expense' | 'transfer' | 'sale' | 'refund' | null;
  amount: number;
  description: string;
  accountName: string;
  category: string | null;
  isRecurring: boolean;
  transferAccountId: string | null;
};

// ---------------------------------------------------------------------------
// CRUD & pagination queries
// ---------------------------------------------------------------------------

export async function getTransactionsForExport(
  userId: string,
  startDate: string,
  endDate: string,
): Promise<ExportTransaction[]> {
  const rows = await db
    .select({
      id: transactionsTable.id,
      date: transactionsTable.date,
      type: transactionsTable.type,
      amount: transactionsTable.amount,
      description: transactionsTable.description,
      accountName: accountsTable.name,
      category: categoriesTable.name,
      isRecurring: transactionsTable.is_recurring,
      transferAccountId: transactionsTable.transfer_account_id,
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .leftJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate),
      ),
    )
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.id));
  return decryptTransactionRows(rows, userId);
}

export async function getTransactionsCount(userId: string, startDate?: string, endDate?: string, accountId?: string) {
  const conditions = [eq(transactionsTable.user_id, userId)];
  if (startDate) conditions.push(gte(transactionsTable.date, startDate));
  if (endDate) conditions.push(lte(transactionsTable.date, endDate));
  if (accountId) conditions.push(eq(transactionsTable.account_id, accountId));

  const [row] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(transactionsTable)
    .where(and(...conditions));

  return row?.total ?? 0;
}

export async function getTransactionsWithDetailsPaginated(
  userId: string,
  page: number,
  pageSize: number,
  startDate?: string,
  endDate?: string,
  accountId?: string,
) {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0
    ? Math.floor(pageSize)
    : 10;
  const offset = (safePage - 1) * safePageSize;

  let query = baseTransactionsQuery(userId);
  if (startDate) query = query.where(gte(transactionsTable.date, startDate));
  if (endDate) query = query.where(lte(transactionsTable.date, endDate));
  if (accountId) query = query.where(eq(transactionsTable.account_id, accountId));

  const rows = await query
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.id))
    .limit(safePageSize)
    .offset(offset);
  return decryptTransactionRows(rows, userId);
}

export async function getLatestFiveTransactionsWithDetails(userId: string) {
  const rows = await baseTransactionsQuery(userId)
    .orderBy(desc(transactionsTable.date))
    .limit(5);
  return decryptTransactionRows(rows, userId);
}

export async function getSavingsDepositTotal(userId: string, startDate: string, endDate: string): Promise<number> {
  const [row] = await db
    .select({ total: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(accountsTable.type, 'savings'),
        gte(transactionsTable.date, startDate),
        lt(transactionsTable.date, endDate),
      )
    );

  return Number(row?.total ?? 0);
}
