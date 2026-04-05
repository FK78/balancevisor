"use server";

import { db } from "@/index";
import { trading212ConnectionsTable, manualHoldingsTable, accountsTable } from "@/db/schema";
import { eq } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";
import { searchTicker } from "@/lib/yahoo-finance";
import { decrypt } from "@/lib/encryption";

export async function searchTickers(query: string) {
  await getCurrentUserId();
  if (!query || query.length < 1) return [];
  return searchTicker(query);
}

export async function getTrading212Connection(userId: string) {
  const rows = await db
    .select()
    .from(trading212ConnectionsTable)
    .where(eq(trading212ConnectionsTable.user_id, userId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getInvestmentsByAccountId(accountId: string) {
  return db
    .select({
      id: manualHoldingsTable.id,
      ticker: manualHoldingsTable.ticker,
      name: manualHoldingsTable.name,
      quantity: manualHoldingsTable.quantity,
      average_price: manualHoldingsTable.average_price,
      current_price: manualHoldingsTable.current_price,
      currency: manualHoldingsTable.currency,
      group_id: manualHoldingsTable.group_id,
    })
    .from(manualHoldingsTable)
    .where(eq(manualHoldingsTable.account_id, accountId));
}

export async function getT212ConnectionByAccountId(accountId: string) {
  const rows = await db
    .select()
    .from(trading212ConnectionsTable)
    .where(eq(trading212ConnectionsTable.account_id, accountId))
    .limit(1);
  return rows[0] ?? null;
}

export async function getManualHoldings(userId: string) {
  const rows = await db
    .select({
      id: manualHoldingsTable.id,
      user_id: manualHoldingsTable.user_id,
      ticker: manualHoldingsTable.ticker,
      name: manualHoldingsTable.name,
      quantity: manualHoldingsTable.quantity,
      average_price: manualHoldingsTable.average_price,
      current_price: manualHoldingsTable.current_price,
      currency: manualHoldingsTable.currency,
      investment_type: manualHoldingsTable.investment_type,
      estimated_return_percent: manualHoldingsTable.estimated_return_percent,
      notes: manualHoldingsTable.notes,
      account_id: manualHoldingsTable.account_id,
      group_id: manualHoldingsTable.group_id,
      accountName: accountsTable.name,
      last_price_update: manualHoldingsTable.last_price_update,
      created_at: manualHoldingsTable.created_at,
    })
    .from(manualHoldingsTable)
    .leftJoin(accountsTable, eq(manualHoldingsTable.account_id, accountsTable.id))
    .where(eq(manualHoldingsTable.user_id, userId));

  return rows.map((row) => ({
    ...row,
    accountName: row.accountName ? decrypt(row.accountName) : null,
  }));
}
