import { getUserDb } from '@/db/rls-context';
import { transactionsTable, budgetsTable, categoriesTable, sharedAccessTable } from '@/db/schema';
import { eq, sum, sql, and, or, inArray, gte, lt } from 'drizzle-orm';

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

  const userDb = await getUserDb(userId);
  const rows = await userDb.select({
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
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end),
    ))
    .where(eq(budgetsTable.user_id, userId))
    .groupBy(budgetsTable.id, budgetsTable.category_id, categoriesTable.name, categoriesTable.color, categoriesTable.icon, budgetsTable.amount, budgetsTable.period, budgetsTable.start_date);

  return rows.map((row) => ({ ...row, isShared: false as boolean }));
}

export async function getSharedBudgets(userId: string, email: string) {
  const userDb = await getUserDb(userId);
  const sharedRows = await userDb
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

  const rows = await userDb.select({
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
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end),
    ))
    .where(inArray(budgetsTable.id, sharedBudgetIds))
    .groupBy(budgetsTable.id, budgetsTable.category_id, categoriesTable.name, categoriesTable.color, categoriesTable.icon, budgetsTable.amount, budgetsTable.period, budgetsTable.start_date);

  return rows.map((row) => ({ ...row, isShared: true as boolean }));
}
