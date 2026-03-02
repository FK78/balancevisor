"use server";

import { db } from "@/index";
import { trading212ConnectionsTable, manualHoldingsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";
import { encrypt } from "@/lib/encryption";
import { getQuote } from "@/lib/yahoo-finance";
import { requireString, sanitizeNumber, sanitizeEnum, sanitizeUUID } from "@/lib/sanitize";

function revalidateInvestments() {
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard");
}

export async function connectTrading212(formData: FormData) {
  const userId = await getCurrentUserId();
  const apiKey = requireString(formData.get("apiKey") as string, "API key");
  const environment = sanitizeEnum(formData.get("environment") as string, ["live", "demo"] as const, "live");
  const accountId = sanitizeUUID(formData.get("account_id") as string);

  const encrypted = encrypt(apiKey);

  await db
    .insert(trading212ConnectionsTable)
    .values({
      user_id: userId,
      api_key_encrypted: encrypted,
      environment,
      account_id: accountId,
    })
    .onConflictDoUpdate({
      target: trading212ConnectionsTable.user_id,
      set: {
        api_key_encrypted: encrypted,
        environment,
        account_id: accountId,
        connected_at: new Date(),
      },
    });

  revalidateInvestments();
}

export async function disconnectTrading212() {
  const userId = await getCurrentUserId();
  await db
    .delete(trading212ConnectionsTable)
    .where(eq(trading212ConnectionsTable.user_id, userId));
  revalidateInvestments();
}

export async function addManualHolding(formData: FormData) {
  const userId = await getCurrentUserId();
  const ticker = requireString(formData.get("ticker") as string, "Ticker").toUpperCase();
  const name = requireString(formData.get("name") as string, "Holding name");
  const quantity = sanitizeNumber(formData.get("quantity") as string, "Quantity", { required: true, min: 0.0001 });
  const averagePrice = sanitizeNumber(formData.get("averagePrice") as string, "Average price", { required: true, min: 0 });
  const currency = sanitizeEnum(formData.get("currency") as string, ["GBP", "USD", "EUR"] as const, "GBP");
  const accountId = sanitizeUUID(formData.get("account_id") as string);
  const groupId = sanitizeUUID(formData.get("group_id") as string);

  const quote = await getQuote(ticker);

  await db.insert(manualHoldingsTable).values({
    user_id: userId,
    ticker,
    name,
    quantity,
    average_price: averagePrice,
    current_price: quote?.currentPrice ?? null,
    currency,
    account_id: accountId,
    group_id: groupId,
    last_price_update: quote ? new Date() : null,
  });

  revalidateInvestments();
}

export async function editManualHolding(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const ticker = requireString(formData.get("ticker") as string, "Ticker").toUpperCase();
  const name = requireString(formData.get("name") as string, "Holding name");
  const quantity = sanitizeNumber(formData.get("quantity") as string, "Quantity", { required: true, min: 0.0001 });
  const averagePrice = sanitizeNumber(formData.get("averagePrice") as string, "Average price", { required: true, min: 0 });
  const accountId = sanitizeUUID(formData.get("account_id") as string);
  const groupId = sanitizeUUID(formData.get("group_id") as string);

  await db
    .update(manualHoldingsTable)
    .set({ ticker, name, quantity, average_price: averagePrice, account_id: accountId, group_id: groupId })
    .where(
      and(
        eq(manualHoldingsTable.id, id),
        eq(manualHoldingsTable.user_id, userId),
      ),
    );

  revalidateInvestments();
}

export async function deleteManualHolding(id: string) {
  const userId = await getCurrentUserId();
  await db
    .delete(manualHoldingsTable)
    .where(
      and(
        eq(manualHoldingsTable.id, id),
        eq(manualHoldingsTable.user_id, userId),
      ),
    );
  revalidateInvestments();
}

export async function refreshManualHoldingPrices() {
  const userId = await getCurrentUserId();
  const holdings = await db
    .select()
    .from(manualHoldingsTable)
    .where(eq(manualHoldingsTable.user_id, userId));

  const updates = holdings.map(async (holding) => {
    const quote = await getQuote(holding.ticker);
    if (quote) {
      await db
        .update(manualHoldingsTable)
        .set({
          current_price: quote.currentPrice,
          last_price_update: new Date(),
        })
        .where(eq(manualHoldingsTable.id, holding.id));
    }
  });

  await Promise.all(updates);
  revalidateInvestments();
}
