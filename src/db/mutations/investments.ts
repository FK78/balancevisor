"use server";

import { db } from "@/index";
import { trading212ConnectionsTable, manualHoldingsTable } from "@/db/schema";
import { eq, and, isNotNull } from "drizzle-orm";
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
  const apiSecret = requireString(formData.get("apiSecret") as string, "API secret");
  const environment = sanitizeEnum(formData.get("environment") as string, ["live", "demo"] as const, "live");
  const accountId = sanitizeUUID(formData.get("account_id") as string);

  const encryptedKey = encrypt(apiKey);
  const encryptedSecret = encrypt(apiSecret);

  await db
    .insert(trading212ConnectionsTable)
    .values({
      user_id: userId,
      api_key_encrypted: encryptedKey,
      api_secret_encrypted: encryptedSecret,
      environment,
      account_id: accountId,
    })
    .onConflictDoUpdate({
      target: trading212ConnectionsTable.user_id,
      set: {
        api_key_encrypted: encryptedKey,
        api_secret_encrypted: encryptedSecret,
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
  const investmentType = sanitizeEnum(formData.get("investment_type") as string, ["stock", "real_estate", "private_equity", "other"] as const, "stock");
  const tickerRaw = (formData.get("ticker") as string)?.trim() || "";
  const name = requireString(formData.get("name") as string, "Holding name");
  const quantity = sanitizeNumber(formData.get("quantity") as string, "Quantity", { required: true, min: 0.0001 });
  const averagePrice = sanitizeNumber(formData.get("averagePrice") as string, "Average price", { required: true, min: 0 });
  const currency = sanitizeEnum(formData.get("currency") as string, ["GBP", "USD", "EUR"] as const, "GBP");
  const accountId = sanitizeUUID(formData.get("account_id") as string);
  const groupId = sanitizeUUID(formData.get("group_id") as string);
  const estimatedReturnPercentRaw = (formData.get("estimated_return_percent") as string)?.trim();
  const estimatedReturnPercent = estimatedReturnPercentRaw ? sanitizeNumber(estimatedReturnPercentRaw, "Estimated return percent", { required: false }) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  let ticker: string | null = null;
  let quote = null;
  if (investmentType === "stock") {
    if (!tickerRaw) {
      throw new Error("Ticker is required for stock investments");
    }
    ticker = tickerRaw.toUpperCase();
    quote = await getQuote(ticker);
  } else {
    // Private investments can have an optional ticker (e.g., custom identifier)
    ticker = tickerRaw ? tickerRaw.toUpperCase() : null;
  }

  await db.insert(manualHoldingsTable).values({
    user_id: userId,
    ticker,
    name,
    quantity,
    average_price: averagePrice,
    current_price: quote?.currentPrice ?? null,
    currency,
    investment_type: investmentType,
    estimated_return_percent: estimatedReturnPercent,
    notes,
    account_id: accountId,
    group_id: groupId,
    last_price_update: quote ? new Date() : null,
  });

  revalidateInvestments();
}

export async function editManualHolding(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  
  // Fetch existing holding to know its investment_type
  const existing = await db
    .select()
    .from(manualHoldingsTable)
    .where(
      and(
        eq(manualHoldingsTable.id, id),
        eq(manualHoldingsTable.user_id, userId),
      ),
    )
    .limit(1);
  
  if (!existing[0]) {
    throw new Error("Holding not found");
  }
  
  const investmentType = existing[0].investment_type;
  const tickerRaw = (formData.get("ticker") as string)?.trim() || "";
  const name = requireString(formData.get("name") as string, "Holding name");
  const quantity = sanitizeNumber(formData.get("quantity") as string, "Quantity", { required: true, min: 0.0001 });
  const averagePrice = sanitizeNumber(formData.get("averagePrice") as string, "Average price", { required: true, min: 0 });
  const accountId = sanitizeUUID(formData.get("account_id") as string);
  const groupId = sanitizeUUID(formData.get("group_id") as string);
  const estimatedReturnPercentRaw = (formData.get("estimated_return_percent") as string)?.trim();
  const estimatedReturnPercent = estimatedReturnPercentRaw ? sanitizeNumber(estimatedReturnPercentRaw, "Estimated return percent", { required: false }) : null;
  const notes = (formData.get("notes") as string)?.trim() || null;

  let ticker: string | null = null;
  if (investmentType === "stock") {
    if (!tickerRaw) {
      throw new Error("Ticker is required for stock investments");
    }
    ticker = tickerRaw.toUpperCase();
  } else {
    ticker = tickerRaw ? tickerRaw.toUpperCase() : null;
  }

  await db
    .update(manualHoldingsTable)
    .set({
      ticker,
      name,
      quantity,
      average_price: averagePrice,
      account_id: accountId,
      group_id: groupId,
      estimated_return_percent: estimatedReturnPercent,
      notes,
    })
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
    .where(
      and(
        eq(manualHoldingsTable.user_id, userId),
        eq(manualHoldingsTable.investment_type, "stock"),
        isNotNull(manualHoldingsTable.ticker),
      ),
    );

  const updates = holdings.map(async (holding) => {
    const quote = await getQuote(holding.ticker!);
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
