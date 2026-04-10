import { db } from '@/index';
import { transactionsTable, budgetsTable, categoriesTable, sharedAccessTable } from '@/db/schema';
import { eq, sum, sql, and, or, inArray, gte, lt } from 'drizzle-orm';
import { getMonthRange } from '@/lib/date';

function getCurrentPeriodRange(): { start: string; end: string } {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth(), 1);
  const end = new Date(now.getFullYear(), now.getMonth() + 1, 1);
  return {
    start: start.toISOString().split('T')[0],
    end: end.toISOString().split('T')[0],
  };
}

export async function getBudgets(userId: string) {
  const { start, end } = getCurrentPeriodRange();

  const rows = await db.select({
    id: budgetsTable.id,
    category_id: budgetsTable.category_id,
    budgetCategory: categoriesTable.name,
    budgetColor: categoriesTable.color,
    budgetIcon: categoriesTable.icon,
    budgetAmount: budgetsTable.amount,
    budgetSpent: sql<number>`coalesce(${sum(transactionsTable.amount)}, 0)`.mapWith(Number),
    budgetPeriod: budgetsTable.period,
    start_date: budgetsTable.start_date,
  })
    .from(budgetsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, budgetsTable.category_id))
    .leftJoin(transactionsTable, and(
      eq(transactionsTable.category_id, budgetsTable.category_id),
      eq(transactionsTable.user_id, userId),
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end),
    ))
    .where(eq(budgetsTable.user_id, userId))
    .groupBy(budgetsTable.id, budgetsTable.category_id, categoriesTable.name, categoriesTable.color, categoriesTable.icon, budgetsTable.amount, budgetsTable.period, budgetsTable.start_date);

  return rows.map((row) => ({ ...row, isShared: false as boolean }));
}

export type BudgetRow = Awaited<ReturnType<typeof getBudgets>>[number];

export async function getSharedBudgets(userId: string, email: string) {
  const sharedRows = await db
    .select({ resource_id: sharedAccessTable.resource_id })
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.resource_type, "budget"),
        eq(sharedAccessTable.status, "accepted"),
        or(
          eq(sharedAccessTable.shared_with_id, userId),
          eq(sharedAccessTable.shared_with_email, email),
        ),
      ),
    );

  if (sharedRows.length === 0) return [];

  const sharedBudgetIds = sharedRows.map((r) => r.resource_id);

  const { start, end } = getCurrentPeriodRange();

  const rows = await db.select({
    id: budgetsTable.id,
    category_id: budgetsTable.category_id,
    budgetCategory: categoriesTable.name,
    budgetColor: categoriesTable.color,
    budgetIcon: categoriesTable.icon,
    budgetAmount: budgetsTable.amount,
    budgetSpent: sql<number>`coalesce(${sum(transactionsTable.amount)}, 0)`.mapWith(Number),
    budgetPeriod: budgetsTable.period,
    start_date: budgetsTable.start_date,
  })
    .from(budgetsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, budgetsTable.category_id))
    .leftJoin(transactionsTable, and(
      eq(transactionsTable.category_id, budgetsTable.category_id),
      eq(transactionsTable.user_id, budgetsTable.user_id),
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end),
    ))
    .where(inArray(budgetsTable.id, sharedBudgetIds))
    .groupBy(budgetsTable.id, budgetsTable.category_id, categoriesTable.name, categoriesTable.color, categoriesTable.icon, budgetsTable.amount, budgetsTable.period, budgetsTable.start_date);

  return rows.map((row) => ({ ...row, isShared: true as boolean }));
}

/**
 * Returns average monthly spend per category over the last 3 months.
 * Used to suggest budget amounts when creating a new budget.
 */
export async function getAvgMonthlySpendByCategory(userId: string): Promise<Record<string, number>> {
  const threeMonthsAgo = getMonthRange(3);
  const thisMonth = getMonthRange(0);

  const rows = await db
    .select({
      category_id: transactionsTable.category_id,
      total: sql<number>`coalesce(${sum(transactionsTable.amount)}, 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, 'expense'),
        gte(transactionsTable.date, threeMonthsAgo.start),
        lt(transactionsTable.date, thisMonth.start),
      ),
    )
    .groupBy(transactionsTable.category_id);

  const result: Record<string, number> = {};
  for (const row of rows) {
    if (row.category_id) {
      result[row.category_id] = Math.round((row.total / 3) * 100) / 100;
    }
  }
  return result;
}
