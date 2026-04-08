import { db } from "@/index";
import { transactionsTable, categoriesTable, accountsTable } from "@/db/schema";
import { and, eq, gte, lt, ne, sum, sql, desc } from "drizzle-orm";
import { toDateString } from "@/lib/date";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { formatCurrency } from "@/lib/formatCurrency";
import { decryptForUser, getUserKey } from "@/lib/encryption";

export type WeeklyDigestData = {
  baseCurrency: string;
  hasData: boolean;
  context: string;
};

export async function getWeeklyDigestData(userId: string): Promise<WeeklyDigestData> {
  const now = new Date();
  const weekAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 7);
  const twoWeeksAgo = new Date(now.getFullYear(), now.getMonth(), now.getDate() - 14);
  const weekStart = toDateString(weekAgo);
  const prevWeekStart = toDateString(twoWeeksAgo);
  const today = toDateString(now);

  const [baseCurrency, thisWeekCategories, thisWeekTotals, prevWeekTotals, topTransactions] =
    await Promise.all([
      getUserBaseCurrency(userId),
      getCategorySpend(userId, weekStart, today),
      getWeekTotals(userId, weekStart, today),
      getWeekTotals(userId, prevWeekStart, weekStart),
      getTopTransactions(userId, weekStart, today),
    ]);

  if (thisWeekTotals.expenses === 0 && thisWeekTotals.income === 0) {
    return { baseCurrency, hasData: false, context: "" };
  }

  const userKey = await getUserKey(userId);
  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const lines: string[] = [
    `# Last 7 Days Summary`,
    `- Income: ${fmt(thisWeekTotals.income)}`,
    `- Expenses: ${fmt(thisWeekTotals.expenses)}`,
    `- Net: ${fmt(thisWeekTotals.income - thisWeekTotals.expenses)}`,
    ``,
    `# Previous Week Comparison`,
    `- Previous week income: ${fmt(prevWeekTotals.income)}`,
    `- Previous week expenses: ${fmt(prevWeekTotals.expenses)}`,
    `- Expense change: ${prevWeekTotals.expenses > 0 ? Math.round(((thisWeekTotals.expenses - prevWeekTotals.expenses) / prevWeekTotals.expenses) * 100) : 0}%`,
    ``,
    `# Top Spending Categories (This Week)`,
    ...thisWeekCategories.map((c) => `- ${c.category}: ${fmt(Number(c.total ?? 0))}`),
    ``,
    `# Largest Transactions`,
    ...topTransactions.map((t) => `- ${decryptForUser(t.description!, userKey)}: ${fmt(t.amount)} (${t.type}, ${t.date})`),
  ];

  return {
    baseCurrency,
    hasData: true,
    context: lines.join("\n"),
  };
}

async function getCategorySpend(userId: string, start: string, end: string) {
  return db
    .select({
      category: categoriesTable.name,
      total: sum(transactionsTable.amount),
    })
    .from(transactionsTable)
    .innerJoin(categoriesTable, eq(transactionsTable.category_id, categoriesTable.id))
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(accountsTable.user_id, userId),
        eq(transactionsTable.type, "expense"),
        ne(categoriesTable.name, "Salary"),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
      ),
    )
    .groupBy(categoriesTable.name)
    .orderBy(desc(sum(transactionsTable.amount)));
}

async function getWeekTotals(userId: string, start: string, end: string) {
  const rows = await db
    .select({
      type: transactionsTable.type,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(accountsTable.user_id, userId),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
      ),
    )
    .groupBy(transactionsTable.type);

  let income = 0;
  let expenses = 0;
  for (const row of rows) {
    if (row.type === "income") income = row.total;
    else if (row.type === "expense") expenses = row.total;
  }
  return { income, expenses };
}

async function getTopTransactions(userId: string, start: string, end: string) {
  return db
    .select({
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      type: transactionsTable.type,
      date: transactionsTable.date,
    })
    .from(transactionsTable)
    .innerJoin(accountsTable, eq(transactionsTable.account_id, accountsTable.id))
    .where(
      and(
        eq(accountsTable.user_id, userId),
        eq(transactionsTable.type, "expense"),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
      ),
    )
    .orderBy(desc(transactionsTable.amount))
    .limit(5);
}
