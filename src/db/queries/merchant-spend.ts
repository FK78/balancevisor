import { db } from "@/index";
import { transactionsTable } from "@/db/schema";
import { eq, and, sql, gte, lt, isNotNull } from "drizzle-orm";
import { getMonthRange, getMonthKey } from "@/lib/date";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type TopMerchant = {
  readonly merchant: string;
  readonly total: number;
  readonly txnCount: number;
};

export type MerchantMonthPoint = {
  readonly month: string;
  readonly total: number;
};

export type MerchantMonthOverMonth = {
  readonly merchant: string;
  readonly currentMonth: number;
  readonly previousMonth: number;
  readonly change: number;
  readonly changePercent: number;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Returns top merchants by total spend in the given period (default: current month).
 */
export async function getTopMerchants(
  userId: string,
  limit = 10,
  monthsBack = 0,
): Promise<TopMerchant[]> {
  const { start, end } = getMonthRange(monthsBack);

  const rows = await db
    .select({
      merchant: transactionsTable.merchant_name,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
      txnCount: sql<number>`count(*)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, "expense"),
        isNotNull(transactionsTable.merchant_name),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
      ),
    )
    .groupBy(transactionsTable.merchant_name)
    .orderBy(sql`sum(${transactionsTable.amount}) desc`)
    .limit(limit);

  return rows
    .filter((r): r is TopMerchant & { merchant: string } => r.merchant !== null)
    .map((r) => ({
      merchant: r.merchant,
      total: Math.round(r.total * 100) / 100,
      txnCount: r.txnCount,
    }));
}

/**
 * Returns monthly spend trend for a specific merchant over the last N months.
 */
export async function getMerchantTrend(
  userId: string,
  merchant: string,
  months = 6,
): Promise<MerchantMonthPoint[]> {
  const { start } = getMonthRange(months - 1);

  const rows = await db
    .select({
      month: sql<string>`to_char(${transactionsTable.date}::date, 'YYYY-MM')`,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, "expense"),
        eq(transactionsTable.merchant_name, merchant),
        gte(transactionsTable.date, start),
      ),
    )
    .groupBy(sql`to_char(${transactionsTable.date}::date, 'YYYY-MM')`)
    .orderBy(sql`to_char(${transactionsTable.date}::date, 'YYYY-MM')`);

  return rows.map((r) => ({
    month: r.month,
    total: Math.round(r.total * 100) / 100,
  }));
}

/**
 * Compares current month merchant spend vs previous month.
 * Returns merchants with the biggest absolute changes (increase or decrease).
 */
export async function getMerchantMonthOverMonth(
  userId: string,
  limit = 5,
): Promise<MerchantMonthOverMonth[]> {
  const currentMonthKey = getMonthKey(new Date());
  const prevDate = new Date();
  prevDate.setMonth(prevDate.getMonth() - 1);
  const prevMonthKey = getMonthKey(prevDate);

  const { start: prevStart } = getMonthRange(1);
  const { end: currentEnd } = getMonthRange(0);

  const rows = await db
    .select({
      merchant: transactionsTable.merchant_name,
      month: sql<string>`to_char(${transactionsTable.date}::date, 'YYYY-MM')`,
      total: sql<number>`coalesce(sum(${transactionsTable.amount}), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, "expense"),
        isNotNull(transactionsTable.merchant_name),
        gte(transactionsTable.date, prevStart),
        lt(transactionsTable.date, currentEnd),
      ),
    )
    .groupBy(transactionsTable.merchant_name, sql`to_char(${transactionsTable.date}::date, 'YYYY-MM')`)
    .orderBy(transactionsTable.merchant_name);

  // Build a map of merchant -> { current, previous }
  const byMerchant = new Map<string, { current: number; previous: number }>();

  for (const row of rows) {
    if (!row.merchant) continue;
    const entry = byMerchant.get(row.merchant) ?? { current: 0, previous: 0 };
    if (row.month === currentMonthKey) {
      entry.current = row.total;
    } else if (row.month === prevMonthKey) {
      entry.previous = row.total;
    }
    byMerchant.set(row.merchant, entry);
  }

  const results: MerchantMonthOverMonth[] = [];

  for (const [merchant, { current, previous }] of byMerchant) {
    if (previous === 0 && current === 0) continue;
    const change = current - previous;
    const changePercent = previous > 0 ? (change / previous) * 100 : current > 0 ? 100 : 0;

    results.push({
      merchant,
      currentMonth: Math.round(current * 100) / 100,
      previousMonth: Math.round(previous * 100) / 100,
      change: Math.round(change * 100) / 100,
      changePercent: Math.round(changePercent),
    });
  }

  // Sort by absolute change descending
  results.sort((a, b) => Math.abs(b.change) - Math.abs(a.change));
  return results.slice(0, limit);
}
