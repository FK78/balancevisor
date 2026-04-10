import { db } from '@/index';
import { transactionsTable, categoriesTable } from '@/db/schema';
import { and, desc, eq, ne, sql, sum, gte, lt } from 'drizzle-orm';
import { getMonthRange, getRecentMonthKeys, getRecentDayKeys, getTomorrowString, getNextMonthFirstString } from '@/lib/date';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Simple totals
// ---------------------------------------------------------------------------

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
  if (endDate) conditions.push(lt(transactionsTable.date, endDate));
  if (accountId) conditions.push(eq(transactionsTable.account_id, accountId));

  const [row] = await db
    .select({ total: sum(transactionsTable.amount) })
    .from(transactionsTable)
    .where(and(...conditions));

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

// ---------------------------------------------------------------------------
// Monthly trends
// ---------------------------------------------------------------------------

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

// ---------------------------------------------------------------------------
// Daily trends
// ---------------------------------------------------------------------------

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
// Pattern detection
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
