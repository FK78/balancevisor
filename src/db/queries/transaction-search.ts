import { transactionsTable, categoriesTable } from '@/db/schema';
import { desc, eq, sql, gte, lte } from 'drizzle-orm';
import {
  baseTransactionsQuery,
  decryptTransactionRows,
} from './transaction-queries';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type SearchTransactionsResult = {
  transactions: Awaited<ReturnType<typeof baseTransactionsQuery>>;
  totalCount: number;
  totalIncome: number;
  totalExpenses: number;
  totalRefunds: number;
};

type SearchableTransactionRow = {
  category?: string | null;
  description?: string | null;
  accountName?: string | null;
  type: 'income' | 'expense' | 'transfer' | 'sale' | 'refund' | null;
  amount: number;
};

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export async function filterSearchRows<T extends SearchableTransactionRow>(
  rows: readonly T[],
  search: string,
  decryptRows: (rows: T[]) => Promise<T[]>,
): Promise<T[]> {
  const needle = search.toLowerCase();
  const categoryMatches: T[] = [];
  const rowsNeedingDecryption: T[] = [];

  for (const row of rows) {
    const category = (row.category ?? '').toLowerCase();
    if (category.includes(needle)) {
      categoryMatches.push(row);
    } else {
      rowsNeedingDecryption.push(row);
    }
  }

  const decryptedRows = rowsNeedingDecryption.length > 0
    ? await decryptRows(rowsNeedingDecryption)
    : [];

  const decryptedMatches = decryptedRows.filter((row) => {
    const desc = (row.description ?? '').toLowerCase();
    const acct = (row.accountName ?? '').toLowerCase();
    const cat = (row.category ?? '').toLowerCase();
    return desc.includes(needle) || acct.includes(needle) || cat.includes(needle);
  });

  return [...categoryMatches, ...decryptedMatches];
}

function buildSearchResult(
  filtered: Awaited<ReturnType<typeof baseTransactionsQuery>>,
  page: number,
  pageSize: number,
): SearchTransactionsResult {
  const totalCount = filtered.length;
  const totalIncome = filtered
    .filter((r) => r.type === 'income')
    .reduce((s, r) => s + r.amount, 0);
  const totalExpenses = filtered
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);
  const totalRefunds = filtered
    .filter((r) => r.type === 'refund')
    .reduce((s, r) => s + r.amount, 0);

  const offset = (page - 1) * pageSize;
  const transactions = filtered.slice(offset, offset + pageSize);

  return { transactions, totalCount, totalIncome, totalExpenses, totalRefunds };
}

// ---------------------------------------------------------------------------
// Main search
// ---------------------------------------------------------------------------

/**
 * Server-side search: first attempts SQL-level filtering on plaintext fields
 * (merchant_name, category name) to avoid decrypting all rows. Falls back to
 * full decrypt + JS filter only when needed (encrypted description/account name match).
 */
export async function searchTransactions(
  userId: string,
  search: string,
  page: number,
  pageSize: number,
  startDate?: string,
  endDate?: string,
  accountId?: string,
): Promise<SearchTransactionsResult> {
  const safePage = Number.isFinite(page) && page > 0 ? Math.floor(page) : 1;
  const safePageSize = Number.isFinite(pageSize) && pageSize > 0 ? Math.floor(pageSize) : 10;

  const MAX_SEARCH_ROWS = 1000;
  const needle = search.toLowerCase();
  const sqlPattern = `%${needle}%`;

  // Build date filters
  let effectiveStartDate = startDate;
  const effectiveEndDate = endDate;
  if (!startDate && !endDate) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    effectiveStartDate = ninetyDaysAgo.toISOString().split('T')[0];
  }

  // Phase 1: SQL-level search on plaintext fields (merchant_name, category name)
  let sqlQuery = baseTransactionsQuery(userId);
  if (effectiveStartDate) sqlQuery = sqlQuery.where(gte(transactionsTable.date, effectiveStartDate));
  if (effectiveEndDate) sqlQuery = sqlQuery.where(lte(transactionsTable.date, effectiveEndDate));
  if (accountId) sqlQuery = sqlQuery.where(eq(transactionsTable.account_id, accountId));

  sqlQuery = sqlQuery.where(
    sql`(lower(${transactionsTable.merchant_name}) LIKE ${sqlPattern} OR lower(${categoriesTable.name}) LIKE ${sqlPattern})`
  );

  const sqlMatched = await sqlQuery
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.id))
    .limit(MAX_SEARCH_ROWS);

  // If we found enough results via SQL, decrypt only those and return
  if (sqlMatched.length > 0) {
    const decrypted = await decryptTransactionRows(sqlMatched, userId);
    return buildSearchResult(decrypted, safePage, safePageSize);
  }

  // Phase 2: Fallback — fetch all rows and search encrypted fields too
  let fallbackQuery = baseTransactionsQuery(userId);
  if (effectiveStartDate) fallbackQuery = fallbackQuery.where(gte(transactionsTable.date, effectiveStartDate));
  if (effectiveEndDate) fallbackQuery = fallbackQuery.where(lte(transactionsTable.date, effectiveEndDate));
  if (accountId) fallbackQuery = fallbackQuery.where(eq(transactionsTable.account_id, accountId));

  const allRows = await fallbackQuery
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.id))
    .limit(MAX_SEARCH_ROWS);
  const filtered = await filterSearchRows(
    allRows,
    search,
    (rows) => decryptTransactionRows(rows, userId),
  );

  return buildSearchResult(filtered, safePage, safePageSize);
}
