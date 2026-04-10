import { db } from '@/index';
import { transactionsTable, categoriesTable, accountsTable } from '@/db/schema';
import { and, desc, eq, ne, sql, sum, gte, lte, lt } from 'drizzle-orm';
import { getMonthRange, getRecentMonthKeys, getRecentDayKeys, getTomorrowString, getNextMonthFirstString } from '@/lib/date';
import { decryptForUser, getUserKey } from '@/lib/encryption';

async function decryptTransactionRows<T extends { description?: string | null; accountName?: string | null }>(rows: T[], userId: string): Promise<T[]> {
  const userKey = await getUserKey(userId);
  return rows.map(row => ({
    ...row,
    ...(row.description != null && { description: decryptForUser(row.description, userKey) }),
    ...(row.accountName != null && { accountName: decryptForUser(row.accountName, userKey) }),
  }));
}

const transactionSelect = {
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

function baseTransactionsQuery(userId: string) {
  return db.select(transactionSelect)
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(eq(transactionsTable.user_id, userId))
    .$dynamic();
}

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

export async function getTotalsByType(
  userId: string,
  type: 'income' | 'expense' | 'refund',
  startDate?: string,
  endDate?: string,
  accountId?: string,
): Promise<number> {
  const conditions = [
    eq(transactionsTable.user_id, userId),
    eq(transactionsTable.type, type),
  ];
  if (startDate) conditions.push(gte(transactionsTable.date, startDate));
  if (endDate) conditions.push(lte(transactionsTable.date, endDate));
  if (accountId) conditions.push(eq(transactionsTable.account_id, accountId));

  const [row] = await db
    .select({ total: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .where(and(...conditions));

  return Number(row?.total ?? 0);
}

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

export async function getTotalSpendByCategoryThisMonth(userId: string): Promise<Array<{ category: string; total: string | null; color: string }>> {
  const { start, end } = getMonthRange();

  const result = await db.select({
    category: categoriesTable.name,
    total: sum(transactionsTable.amount),
    color: categoriesTable.color
  }).from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .where(and(
      eq(transactionsTable.user_id, userId),
      eq(transactionsTable.type, 'expense'),
      ne(categoriesTable.name, 'Salary'),
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end)
    ))
    .groupBy(categoriesTable.name, categoriesTable.color);

  return result;
}

export type MonthlyCashflowPoint = {
  month: string;
  income: number;
  expenses: number;
  refunds: number;
  net: number;
};

export type DailyCashflowPoint = {
  day: string;
  income: number;
  expenses: number;
  refunds: number;
  net: number;
};

export type DailyCategoryExpensePoint = {
  day: string;
  category: string;
  color: string;
  total: number;
};

export type MonthlyCategorySpendPoint = {
  month: string;
  category: string;
  category_id: string;
  color: string;
  total: number;
};

export async function getMonthlyIncomeExpenseTrend(userId: string, monthCount = 6): Promise<MonthlyCashflowPoint[]> {
  const monthKeys = getRecentMonthKeys(monthCount);
  const [startMonth] = monthKeys;
  const endMonth = getNextMonthFirstString();

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${transactionsTable.date}), 'YYYY-MM')`,
      type: transactionsTable.type,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(and(
      eq(transactionsTable.user_id, userId),
      gte(transactionsTable.date, `${startMonth}-01`),
      lt(transactionsTable.date, endMonth),
    ))
    .groupBy(
      sql`date_trunc('month', ${transactionsTable.date})`,
      transactionsTable.type,
    )
    .orderBy(sql`date_trunc('month', ${transactionsTable.date})`);

  const monthMap = new Map<string, { income: number; expenses: number; refunds: number }>();
  for (const monthKey of monthKeys) {
    monthMap.set(monthKey, { income: 0, expenses: 0, refunds: 0 });
  }

  for (const row of rows) {
    const existing = monthMap.get(row.month);
    if (!existing) {
      continue;
    }

    if (row.type === 'income') {
      existing.income = row.total;
    } else if (row.type === 'expense') {
      existing.expenses = row.total;
    } else if (row.type === 'refund') {
      existing.refunds = row.total;
    }
  }

  const result = monthKeys.map((month) => {
    const totals = monthMap.get(month) ?? { income: 0, expenses: 0, refunds: 0 };
    return {
      month,
      income: totals.income,
      expenses: totals.expenses,
      refunds: totals.refunds,
      net: totals.income - totals.expenses + totals.refunds,
    };
  });

  return result;
}

export async function getDailyIncomeExpenseTrend(userId: string, dayCount = 30): Promise<DailyCashflowPoint[]> {
  const dayKeys = getRecentDayKeys(dayCount);
  const [startDay] = dayKeys;
  const endDay = getTomorrowString();

  const rows = await db
    .select({
      day: sql<string>`to_char(${transactionsTable.date}, 'YYYY-MM-DD')`,
      type: transactionsTable.type,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(and(
      eq(transactionsTable.user_id, userId),
      gte(transactionsTable.date, startDay),
      lt(transactionsTable.date, endDay),
    ))
    .groupBy(
      transactionsTable.date,
      transactionsTable.type,
    )
    .orderBy(transactionsTable.date);

  const dayMap = new Map<string, { income: number; expenses: number; refunds: number }>();
  for (const dayKey of dayKeys) {
    dayMap.set(dayKey, { income: 0, expenses: 0, refunds: 0 });
  }

  for (const row of rows) {
    const existing = dayMap.get(row.day);
    if (!existing) {
      continue;
    }

    if (row.type === 'income') {
      existing.income = row.total;
    } else if (row.type === 'expense') {
      existing.expenses = row.total;
    } else if (row.type === 'refund') {
      existing.refunds = row.total;
    }
  }

  const result = dayKeys.map((day) => {
    const totals = dayMap.get(day) ?? { income: 0, expenses: 0, refunds: 0 };
    return {
      day,
      income: totals.income,
      expenses: totals.expenses,
      refunds: totals.refunds,
      net: totals.income - totals.expenses + totals.refunds,
    };
  });

  return result;
}

export async function getDailyExpenseByCategory(userId: string, dayCount = 30): Promise<DailyCategoryExpensePoint[]> {
  const dayKeys = getRecentDayKeys(dayCount);
  const [startDay] = dayKeys;
  const endDay = getTomorrowString();

  const rows = await db
    .select({
      day: sql<string>`to_char(${transactionsTable.date}, 'YYYY-MM-DD')`,
      category: categoriesTable.name,
      color: categoriesTable.color,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .where(and(
      eq(transactionsTable.user_id, userId),
      eq(transactionsTable.type, 'expense'),
      gte(transactionsTable.date, startDay),
      lt(transactionsTable.date, endDay),
    ))
    .groupBy(
      transactionsTable.date,
      categoriesTable.name,
      categoriesTable.color,
    )
    .orderBy(transactionsTable.date, categoriesTable.name);

  return rows;
}

// ---------------------------------------------------------------------------
// Lightweight query for spending-pattern detection (funny milestones)
// ---------------------------------------------------------------------------

export interface PatternTransactionRow {
  merchant_name: string | null;
  category: string | null;
  amount: number;
  date: string;
  type: string | null;
}

export async function getRecentTransactionsForPatterns(
  userId: string,
  days = 90,
): Promise<PatternTransactionRow[]> {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);
  const cutoffStr = cutoff.toISOString().slice(0, 10);

  const rows = await db
    .select({
      merchant_name: transactionsTable.merchant_name,
      category: categoriesTable.name,
      amount: transactionsTable.amount,
      date: transactionsTable.date,
      type: transactionsTable.type,
    })
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        gte(transactionsTable.date, cutoffStr),
      ),
    )
    .orderBy(desc(transactionsTable.date))
    .limit(2000);

  return rows.map((r) => ({
    merchant_name: r.merchant_name,
    category: r.category,
    amount: Number(r.amount),
    date: r.date ?? "",
    type: r.type,
  }));
}

export async function getMonthlyCategorySpendTrend(userId: string, monthCount = 6): Promise<MonthlyCategorySpendPoint[]> {
  const monthKeys = getRecentMonthKeys(monthCount);
  const [startMonth] = monthKeys;
  const endMonth = getNextMonthFirstString();

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${transactionsTable.date}), 'YYYY-MM')`,
      category: categoriesTable.name,
      category_id: categoriesTable.id,
      color: categoriesTable.color,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .where(and(
      eq(transactionsTable.user_id, userId),
      eq(transactionsTable.type, 'expense'),
      gte(transactionsTable.date, `${startMonth}-01`),
      lt(transactionsTable.date, endMonth),
    ))
    .groupBy(
      sql`date_trunc('month', ${transactionsTable.date})`,
      categoriesTable.id,
      categoriesTable.name,
      categoriesTable.color,
    )
    .orderBy(
      sql`date_trunc('month', ${transactionsTable.date})`,
      categoriesTable.name,
    );

  return rows;
}
