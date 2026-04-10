import { db } from "@/index";
import { transactionsTable } from "@/db/schema";
import { eq, and, sql, gte, lt, desc } from "drizzle-orm";
import { getMonthRange } from "@/lib/date";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type RefundSummary = {
  readonly totalRefunds: number;
  readonly refundCount: number;
  readonly recentRefunds: readonly RecentRefund[];
};

export type RecentRefund = {
  readonly id: string;
  readonly description: string | null;
  readonly amount: number;
  readonly date: string;
  readonly merchantName: string | null;
};

export type LargeTransaction = {
  readonly id: string;
  readonly description: string | null;
  readonly amount: number;
  readonly date: string;
  readonly merchantName: string | null;
  readonly type: string;
};

// ---------------------------------------------------------------------------
// Queries
// ---------------------------------------------------------------------------

/**
 * Returns refund summary for the current month — total refunded, count, and last 5.
 * Refunds are income transactions that match common refund indicators or have
 * negative expense amounts.
 */
export async function getRefundSummary(userId: string): Promise<RefundSummary> {
  const { start, end } = getMonthRange(0);

  const rows = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      date: transactionsTable.date,
      merchantName: transactionsTable.merchant_name,
      type: transactionsTable.type,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        eq(transactionsTable.type, "income"),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
        sql`(
          lower(${transactionsTable.description}) like '%refund%'
          or lower(${transactionsTable.description}) like '%reversal%'
          or lower(${transactionsTable.description}) like '%cashback%'
          or lower(${transactionsTable.description}) like '%returned%'
          or lower(${transactionsTable.merchant_name}) like '%refund%'
        )`,
      ),
    )
    .orderBy(desc(transactionsTable.date))
    .limit(10);

  const totalRefunds = rows.reduce((s, r) => s + Math.abs(r.amount), 0);

  return {
    totalRefunds: Math.round(totalRefunds * 100) / 100,
    refundCount: rows.length,
    recentRefunds: rows.slice(0, 5).map((r) => ({
      id: r.id,
      description: r.description,
      amount: Math.abs(r.amount),
      date: r.date,
      merchantName: r.merchantName,
    })),
  };
}

/**
 * Returns unusually large transactions (top 3 by absolute amount this month)
 * that exceed 3x the user's average transaction.
 */
export async function getLargeTransactions(
  userId: string,
  multiplier = 3,
): Promise<LargeTransaction[]> {
  const { start, end } = getMonthRange(0);

  // Get average transaction amount over last 3 months
  const { start: histStart } = getMonthRange(3);
  const [avgRow] = await db
    .select({
      avgAmount: sql<number>`coalesce(avg(abs(${transactionsTable.amount})), 0)`.mapWith(Number),
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        gte(transactionsTable.date, histStart),
        lt(transactionsTable.date, start),
      ),
    );

  const avgAmount = avgRow?.avgAmount ?? 0;
  if (avgAmount <= 0) return [];

  const threshold = avgAmount * multiplier;

  const rows = await db
    .select({
      id: transactionsTable.id,
      description: transactionsTable.description,
      amount: transactionsTable.amount,
      date: transactionsTable.date,
      merchantName: transactionsTable.merchant_name,
      type: transactionsTable.type,
    })
    .from(transactionsTable)
    .where(
      and(
        eq(transactionsTable.user_id, userId),
        gte(transactionsTable.date, start),
        lt(transactionsTable.date, end),
        sql`abs(${transactionsTable.amount}) > ${threshold}`,
      ),
    )
    .orderBy(sql`abs(${transactionsTable.amount}) desc`)
    .limit(3);

  return rows.map((r) => ({
    id: r.id,
    description: r.description,
    amount: r.amount,
    date: r.date,
    merchantName: r.merchantName,
    type: r.type,
  }));
}
