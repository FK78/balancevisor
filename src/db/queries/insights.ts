import { db } from '@/index';
import { transactionsTable, categoriesTable } from '@/db/schema';
import { and, eq, gte, lt, sum, sql, isNull, count } from 'drizzle-orm';
import { getMonthRange } from '@/lib/date';

export type Insight = {
  id: string;
  icon: 'trending-up' | 'alert-triangle' | 'calendar' | 'piggy-bank' | 'tag' | 'target';
  message: string;
  link?: string;
  variant: 'info' | 'warning' | 'success';
};

/**
 * Compute a set of proactive insights for the dashboard.
 * All queries run server-side; returns the top insights sorted by priority.
 */
export async function getDashboardInsights(
  userId: string,
  budgets: Array<{ budgetCategory: string; budgetAmount: number; budgetSpent: number }>,
  goals: Array<{ name: string; saved_amount: number; target_amount: number }>,
  baseCurrency = 'GBP',
): Promise<Insight[]> {
  const insights: Insight[] = [];

  const thisMonth = getMonthRange(0);
  const lastMonth = getMonthRange(1);

  // Run independent queries in parallel
  const [
    thisMonthByCategory,
    lastMonthByCategory,
    uncategorisedCount,
    thisMonthTotals,
    lastMonthTotals,
    upcomingRecurringRows,
  ] = await Promise.all([
    getCategorySpend(userId, thisMonth.start, thisMonth.end),
    getCategorySpend(userId, lastMonth.start, lastMonth.end),
    getUncategorisedCount(userId),
    getIncomeExpenseTotals(userId, thisMonth.start, thisMonth.end),
    getIncomeExpenseTotals(userId, lastMonth.start, lastMonth.end),
    getUpcomingRecurring(userId),
  ]);

  // 1. Spending spike detection (category MoM comparison)
  const lastMonthMap = new Map(lastMonthByCategory.map((r) => [r.category, r.total]));
  for (const current of thisMonthByCategory) {
    const prev = lastMonthMap.get(current.category) ?? 0;
    if (prev > 0 && current.total > prev * 1.3 && current.total - prev >= 20) {
      const pctUp = Math.round(((current.total - prev) / prev) * 100);
      insights.push({
        id: `spike-${current.category}`,
        icon: 'trending-up',
        message: `${current.category} spending is up ${pctUp}% vs last month`,
        link: '/dashboard/categories',
        variant: 'warning',
      });
    }
  }

  // 2. Budget warnings (>=80% used)
  const now = new Date();
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const daysLeft = daysInMonth - now.getDate();
  for (const b of budgets) {
    if (b.budgetAmount <= 0) continue;
    const pct = (b.budgetSpent / b.budgetAmount) * 100;
    if (pct >= 100) {
      insights.push({
        id: `budget-over-${b.budgetCategory}`,
        icon: 'alert-triangle',
        message: `${b.budgetCategory} budget exceeded by ${formatCurrency(b.budgetSpent - b.budgetAmount, baseCurrency)}`,
        link: '/dashboard/budgets',
        variant: 'warning',
      });
    } else if (pct >= 80) {
      insights.push({
        id: `budget-risk-${b.budgetCategory}`,
        icon: 'alert-triangle',
        message: `${b.budgetCategory} budget is ${Math.round(pct)}% used with ${daysLeft} day${daysLeft !== 1 ? 's' : ''} left`,
        link: '/dashboard/budgets',
        variant: 'warning',
      });
    }
  }

  // 3. Upcoming recurring payments (next 7 days)
  if (upcomingRecurringRows.length > 0) {
    const totalUpcoming = upcomingRecurringRows.reduce((s, r) => s + r.amount, 0);
    insights.push({
      id: 'upcoming-recurring',
      icon: 'calendar',
      message: `${upcomingRecurringRows.length} recurring payment${upcomingRecurringRows.length !== 1 ? 's' : ''} due this week (${formatCurrency(totalUpcoming, baseCurrency)})`,
      link: '/dashboard/recurring',
      variant: 'info',
    });
  }

  // 4. Savings streak (income > expenses for consecutive months)
  if (lastMonthTotals.income > 0 && lastMonthTotals.income > lastMonthTotals.expenses &&
      thisMonthTotals.income > 0 && thisMonthTotals.income > thisMonthTotals.expenses) {
    const savingsRate = Math.round(((thisMonthTotals.income - thisMonthTotals.expenses) / thisMonthTotals.income) * 100);
    insights.push({
      id: 'savings-streak',
      icon: 'piggy-bank',
      message: `You're saving ${savingsRate}% of income this month — keep it up!`,
      link: '/dashboard/reports',
      variant: 'success',
    });
  }

  // 5. Uncategorised transactions
  if (uncategorisedCount > 0) {
    insights.push({
      id: 'uncategorised',
      icon: 'tag',
      message: `${uncategorisedCount} transaction${uncategorisedCount !== 1 ? 's' : ''} need categorising`,
      link: '/dashboard/transactions',
      variant: 'info',
    });
  }

  // 6. Goal milestones (closest to completion)
  for (const g of goals) {
    if (g.target_amount <= 0) continue;
    const pct = (g.saved_amount / g.target_amount) * 100;
    if (pct >= 75 && pct < 100) {
      const remaining = g.target_amount - g.saved_amount;
      insights.push({
        id: `goal-${g.name}`,
        icon: 'target',
        message: `${g.name} is ${Math.round(pct)}% funded — ${formatCurrency(remaining, baseCurrency)} to go`,
        link: '/dashboard/goals',
        variant: 'success',
      });
    }
  }

  // Sort: warnings first, then info, then success. Return top 4.
  const variantOrder: Record<string, number> = { warning: 0, info: 1, success: 2 };
  return insights
    .sort((a, b) => (variantOrder[a.variant] ?? 1) - (variantOrder[b.variant] ?? 1))
    .slice(0, 4);
}

// ── Helper queries ──

async function getCategorySpend(userId: string, start: string, end: string) {
  const rows = await db
    .select({
      category: categoriesTable.name,
      total: sql<number>`coalesce(${sum(transactionsTable.amount)}, 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
      ),
    )
    .groupBy(categoriesTable.name);
  return rows;
}

export async function getUncategorisedCount(userId: string): Promise<number> {
  const [row] = await db
    .select({ total: count() })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        isNull(transactionsTable.category_id),
      ),
    );
  return row?.total ?? 0;
}

async function getIncomeExpenseTotals(userId: string, start: string, end: string) {
  const rows = await db
    .select({
      type: transactionsTable.type,
      total: sql<number>`coalesce(${sum(transactionsTable.amount)}, 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
      ),
    )
    .groupBy(transactionsTable.type);

  let income = 0;
  let expenses = 0;
  for (const r of rows) {
    if (r.type === 'income') income = r.total;
    else if (r.type === 'expense') expenses = r.total;
  }
  return { income, expenses };
}

async function getUpcomingRecurring(userId: string) {
  const today = new Date().toISOString().split('T')[0];
  const next7 = new Date();
  next7.setDate(next7.getDate() + 7);
  const next7Str = next7.toISOString().split('T')[0];

  return db
    .select({
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      next_recurring_date: transactionsTable.next_recurring_date,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.is_recurring, true),
        gte(transactionsTable.next_recurring_date, today),
        lt(transactionsTable.next_recurring_date, next7Str),
      ),
    );
}

function formatCurrency(amount: number, currency = 'GBP'): string {
  return new Intl.NumberFormat('en-GB', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Math.abs(amount));
}
