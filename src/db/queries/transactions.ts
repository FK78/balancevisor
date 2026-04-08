import { db } from '@/index';
import { transactionsTable, categoriesTable, accountsTable } from '@/db/schema';
import { and, desc, eq, ne, sql, sum, gte, lte, lt } from 'drizzle-orm';
import { getMonthRange, getRecentMonthKeys, getRecentDayKeys, getTomorrowString, getNextMonthFirstString } from '@/lib/date';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import { getCached, setCached, cacheKey } from '@/lib/cache';

// User tag for cache invalidation
const userTag = (userId: string) => `user:${userId}`;

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
};

function baseTransactionsQuery(userId: string) {
  return db.select(transactionSelect)
    .from(transactionsTable)
    .leftJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(eq(accountsTable.user_id, userId))
    .$dynamic();
}

export type ExportTransaction = {
  id: string;
  date: string | null;
  type: 'income' | 'expense' | 'transfer' | 'sale' | null;
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
        eq(accountsTable.user_id, userId),
        gte(transactionsTable.date, startDate),
        lte(transactionsTable.date, endDate),
      ),
    )
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.id));
  return decryptTransactionRows(rows, userId);
}

export async function getTransactionsCount(userId: string, startDate?: string, endDate?: string, accountId?: string) {
  const conditions = [eq(accountsTable.user_id, userId)];
  if (startDate) conditions.push(gte(transactionsTable.date, startDate));
  if (endDate) conditions.push(lte(transactionsTable.date, endDate));
  if (accountId) conditions.push(eq(transactionsTable.account_id, accountId));

  const [row] = await db
    .select({ total: sql<number>`count(*)`.mapWith(Number) })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
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
  type: 'income' | 'expense',
  startDate?: string,
  endDate?: string,
  accountId?: string,
): Promise<number> {
  const key = cacheKey('totals-by-type', userId, type, startDate, endDate, accountId);
  const cached = getCached<number>(key);
  if (cached !== undefined) {
    return cached;
  }

  const conditions = [
    eq(accountsTable.user_id, userId),
    eq(transactionsTable.type, type),
  ];
  if (startDate) conditions.push(gte(transactionsTable.date, startDate));
  if (endDate) conditions.push(lte(transactionsTable.date, endDate));
  if (accountId) conditions.push(eq(transactionsTable.account_id, accountId));

  const [row] = await db
    .select({ total: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(and(...conditions));

  const result = Number(row?.total ?? 0);
  setCached(key, result, { tags: [userTag(userId)] });
  return result;
}

export type SearchTransactionsResult = {
  transactions: Awaited<ReturnType<typeof baseTransactionsQuery>>;
  totalCount: number;
  totalIncome: number;
  totalExpenses: number;
};

/**
 * Server-side search: fetches all transactions (with optional date range),
 * decrypts descriptions/account names, filters by search term, and returns
 * a paginated slice plus totals. Used only when a search query is present.
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
  let query = baseTransactionsQuery(userId);
  let effectiveStartDate = startDate;
  const effectiveEndDate = endDate;
  if (!startDate && !endDate) {
    const ninetyDaysAgo = new Date();
    ninetyDaysAgo.setDate(ninetyDaysAgo.getDate() - 90);
    effectiveStartDate = ninetyDaysAgo.toISOString().split('T')[0];
  }
  if (effectiveStartDate) query = query.where(gte(transactionsTable.date, effectiveStartDate));
  if (effectiveEndDate) query = query.where(lte(transactionsTable.date, effectiveEndDate));
  if (accountId) query = query.where(eq(transactionsTable.account_id, accountId));

  const allRows = await query
    .orderBy(desc(transactionsTable.date), desc(transactionsTable.id))
    .limit(MAX_SEARCH_ROWS);
  const decrypted = await decryptTransactionRows(allRows, userId);

  const needle = search.toLowerCase();
  const filtered = decrypted.filter((row) => {
    const desc = (row.description ?? '').toLowerCase();
    const acct = (row.accountName ?? '').toLowerCase();
    const cat = (row.category ?? '').toLowerCase();
    return desc.includes(needle) || acct.includes(needle) || cat.includes(needle);
  });

  const totalCount = filtered.length;
  const totalIncome = filtered
    .filter((r) => r.type === 'income')
    .reduce((s, r) => s + r.amount, 0);
  const totalExpenses = filtered
    .filter((r) => r.type === 'expense')
    .reduce((s, r) => s + r.amount, 0);

  const offset = (safePage - 1) * safePageSize;
  const transactions = filtered.slice(offset, offset + safePageSize);

  return { transactions, totalCount, totalIncome, totalExpenses };
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
        eq(accountsTable.user_id, userId),
        eq(accountsTable.type, 'savings'),
        gte(transactionsTable.date, startDate),
        lt(transactionsTable.date, endDate),
      )
    );

  return Number(row?.total ?? 0);
}

export async function getTotalSpendByCategoryThisMonth(userId: string): Promise<Array<{ category: string; total: string | null; color: string }>> {
  const key = cacheKey('total-spend-by-category-this-month', userId);
  const cached = getCached<Array<{ category: string; total: string | null; color: string }>>(key);
  if (cached) {
    return cached;
  }

  const { start, end } = getMonthRange();

  const result = await db.select({
    category: categoriesTable.name,
    total: sum(transactionsTable.amount),
    color: categoriesTable.color
  }).from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(and(
      eq(accountsTable.user_id, userId),
      eq(transactionsTable.type, 'expense'),
      ne(categoriesTable.name, 'Salary'),
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end)
    ))
    .groupBy(categoriesTable.name, categoriesTable.color);

  setCached(key, result, { tags: [userTag(userId)] });
  return result;
}

export type MonthlyCashflowPoint = {
  month: string;
  income: number;
  expenses: number;
  net: number;
};

export type DailyCashflowPoint = {
  day: string;
  income: number;
  expenses: number;
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
  color: string;
  total: number;
};

export async function getMonthlyIncomeExpenseTrend(userId: string, monthCount = 6): Promise<MonthlyCashflowPoint[]> {
  const key = cacheKey('monthly-income-expense-trend', userId, monthCount);
  const cached = getCached<MonthlyCashflowPoint[]>(key);
  if (cached) {
    return cached;
  }

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
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(and(
      eq(accountsTable.user_id, userId),
      gte(transactionsTable.date, `${startMonth}-01`),
      lt(transactionsTable.date, endMonth),
    ))
    .groupBy(
      sql`date_trunc('month', ${transactionsTable.date})`,
      transactionsTable.type,
    )
    .orderBy(sql`date_trunc('month', ${transactionsTable.date})`);

  const monthMap = new Map<string, { income: number; expenses: number }>();
  for (const monthKey of monthKeys) {
    monthMap.set(monthKey, { income: 0, expenses: 0 });
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
    }
  }

  const result = monthKeys.map((month) => {
    const totals = monthMap.get(month) ?? { income: 0, expenses: 0 };
    return {
      month,
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses,
    };
  });

  setCached(key, result, { tags: [userTag(userId)] });
  return result;
}

export async function getDailyIncomeExpenseTrend(userId: string, dayCount = 30): Promise<DailyCashflowPoint[]> {
  const key = cacheKey('daily-income-expense-trend', userId, dayCount);
  const cached = getCached<DailyCashflowPoint[]>(key);
  if (cached) {
    return cached;
  }

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
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(and(
      eq(accountsTable.user_id, userId),
      gte(transactionsTable.date, startDay),
      lt(transactionsTable.date, endDay),
    ))
    .groupBy(
      transactionsTable.date,
      transactionsTable.type,
    )
    .orderBy(transactionsTable.date);

  const dayMap = new Map<string, { income: number; expenses: number }>();
  for (const dayKey of dayKeys) {
    dayMap.set(dayKey, { income: 0, expenses: 0 });
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
    }
  }

  const result = dayKeys.map((day) => {
    const totals = dayMap.get(day) ?? { income: 0, expenses: 0 };
    return {
      day,
      income: totals.income,
      expenses: totals.expenses,
      net: totals.income - totals.expenses,
    };
  });

  setCached(key, result, { tags: [userTag(userId)] });
  return result;
}

export async function getDailyExpenseByCategory(userId: string, dayCount = 30): Promise<DailyCategoryExpensePoint[]> {
  const key = cacheKey('daily-expense-by-category', userId, dayCount);
  const cached = getCached<DailyCategoryExpensePoint[]>(key);
  if (cached) {
    return cached;
  }

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
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(and(
      eq(accountsTable.user_id, userId),
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

  setCached(key, rows, { tags: [userTag(userId)] });
  return rows;
}

export async function getMonthlyCategorySpendTrend(userId: string, monthCount = 6): Promise<MonthlyCategorySpendPoint[]> {
  const key = cacheKey('monthly-category-spend-trend', userId, monthCount);
  const cached = getCached<MonthlyCategorySpendPoint[]>(key);
  if (cached) {
    return cached;
  }

  const monthKeys = getRecentMonthKeys(monthCount);
  const [startMonth] = monthKeys;
  const endMonth = getNextMonthFirstString();

  const rows = await db
    .select({
      month: sql<string>`to_char(date_trunc('month', ${transactionsTable.date}), 'YYYY-MM')`,
      category: categoriesTable.name,
      color: categoriesTable.color,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(and(
      eq(accountsTable.user_id, userId),
      eq(transactionsTable.type, 'expense'),
      gte(transactionsTable.date, `${startMonth}-01`),
      lt(transactionsTable.date, endMonth),
    ))
    .groupBy(
      sql`date_trunc('month', ${transactionsTable.date})`,
      categoriesTable.name,
      categoriesTable.color,
    )
    .orderBy(
      sql`date_trunc('month', ${transactionsTable.date})`,
      categoriesTable.name,
    );

  setCached(key, rows, { tags: [userTag(userId)] });
  return rows;
}
