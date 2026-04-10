"use server";

import { db } from "@/index";
import { createTransaction } from "@/db/mutations/transactions";
import { brokerConnectionsTable, manualHoldingsTable, holdingSalesTable, accountsTable } from "@/db/schema";
import { eq, and, isNotNull, sql } from "drizzle-orm";
import { revalidateDomains } from "@/lib/revalidate";
import { getCurrentUserId } from "@/lib/auth";
import { toDateString } from "@/lib/date";
import { encryptForUser, getUserKey } from "@/lib/encryption";
import { getQuote } from "@/lib/yahoo-finance";
import { requireString, sanitizeNumber, sanitizeEnum, sanitizeUUID } from "@/lib/sanitize";
import type { BrokerSource, BrokerCredentials } from "@/lib/brokers/types";
import { BROKER_SOURCES } from "@/lib/brokers/types";

function revalidateInvestments() {
  revalidateDomains('investments');
}

// ---------------------------------------------------------------------------
// Generic broker connection mutations
// ---------------------------------------------------------------------------

export async function connectBroker(formData: FormData) {
  const userId = await getCurrentUserId();
  const broker = sanitizeEnum(
    formData.get("broker") as string,
    BROKER_SOURCES,
    "trading212",
  ) as BrokerSource;
  const apiKey = requireString(formData.get("apiKey") as string, "API key");
  const apiSecret = ((formData.get("apiSecret") as string) ?? "").trim();
  const environment = sanitizeEnum(
    formData.get("environment") as string,
    ["live", "demo", "paper"] as const,
    "live",
  );
  const accountId = sanitizeUUID(formData.get("account_id") as string);

  const credentials: BrokerCredentials = {
    apiKey,
    apiSecret,
    environment,
  };

  const userKey = await getUserKey(userId);
  const credentialsEncrypted = encryptForUser(JSON.stringify(credentials), userKey);

  await db
    .insert(brokerConnectionsTable)
    .values({
      user_id: userId,
      broker,
      credentials_encrypted: credentialsEncrypted,
      environment,
      account_id: accountId,
    })
    .onConflictDoUpdate({
      target: [brokerConnectionsTable.user_id, brokerConnectionsTable.broker],
      set: {
        credentials_encrypted: credentialsEncrypted,
        environment,
        account_id: accountId,
        connected_at: new Date(),
      },
    });

  revalidateInvestments();
}

export async function disconnectBroker(formData: FormData) {
  const userId = await getCurrentUserId();
  const broker = requireString(formData.get("broker") as string, "Broker") as BrokerSource;

  await db
    .delete(brokerConnectionsTable)
    .where(
      and(
        eq(brokerConnectionsTable.user_id, userId),
        eq(brokerConnectionsTable.broker, broker),
      ),
    );

  revalidateInvestments();
}

export async function updateBrokerTokens(
  userId: string,
  broker: BrokerSource,
  tokens: { accessToken: string; refreshToken: string; tokenExpiresAt: string },
) {
  const userKey = await getUserKey(userId);

  // Fetch existing credentials to merge
  const [existing] = await db
    .select({ credentials_encrypted: brokerConnectionsTable.credentials_encrypted })
    .from(brokerConnectionsTable)
    .where(
      and(
        eq(brokerConnectionsTable.user_id, userId),
        eq(brokerConnectionsTable.broker, broker),
      ),
    );

  if (!existing) {
    throw new Error(`No ${broker} connection found for user ${userId}`);
  }

  const { decryptForUser } = await import("@/lib/encryption");
  const currentCreds: BrokerCredentials = JSON.parse(
    decryptForUser(existing.credentials_encrypted, userKey),
  );

  const updatedCreds: BrokerCredentials = {
    ...currentCreds,
    ...tokens,
  };

  const credentialsEncrypted = encryptForUser(JSON.stringify(updatedCreds), userKey);

  await db
    .update(brokerConnectionsTable)
    .set({
      credentials_encrypted: credentialsEncrypted,
      last_synced_at: new Date(),
    })
    .where(
      and(
        eq(brokerConnectionsTable.user_id, userId),
        eq(brokerConnectionsTable.broker, broker),
      ),
    );
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

export async function recordHoldingSale(formData: FormData) {
  const userId = await getCurrentUserId();
  const holdingId = sanitizeUUID(formData.get("holding_id") as string);
  if (!holdingId) throw new Error("Missing holding ID");

  const quantity = sanitizeNumber(formData.get("quantity") as string, "Quantity");
  const pricePerUnit = sanitizeNumber(formData.get("price_per_unit") as string, "Price per unit");
  const dateRaw = formData.get("date") as string;
  const date = dateRaw ? new Date(dateRaw) : new Date();
  const cashAccountId = sanitizeUUID(formData.get("cash_account_id") as string);
  const notes = (formData.get("notes") as string) || null;

  // Fetch holding
  const [holding] = await db
    .select()
    .from(manualHoldingsTable)
    .where(
      and(
        eq(manualHoldingsTable.id, holdingId),
        eq(manualHoldingsTable.user_id, userId),
      ),
    );

  if (!holding) throw new Error("Holding not found");
  if (quantity > holding.quantity) throw new Error("Quantity exceeds current holding");

  const totalAmount = quantity * pricePerUnit;
  const realizedGain = (pricePerUnit - holding.average_price) * quantity;

  await db.transaction(async (tx) => {
    // Update holding quantity (reduce)
    await tx
      .update(manualHoldingsTable)
      .set({
        quantity: holding.quantity - quantity,
      })
      .where(eq(manualHoldingsTable.id, holdingId));

    // Insert sale record
    await tx.insert(holdingSalesTable).values({
      holding_id: holdingId,
      user_id: userId,
      date: toDateString(date),
      quantity,
      price_per_unit: pricePerUnit,
      realized_gain: realizedGain,
      cash_account_id: cashAccountId,
      notes,
    });

    // If cashAccountId, create a transaction
    if (cashAccountId) {
      const description = `Sold ${quantity} ${holding.ticker ? holding.ticker : holding.name}`;
      await createTransaction({
        type: 'sale',
        amount: totalAmount,
        description,
        date: toDateString(date),
        account_id: cashAccountId,
        category_id: null,
        is_recurring: false,
        recurring_pattern: null,
        next_recurring_date: null,
        transfer_account_id: null,
        is_split: false,
      }, userId, tx);

      // Update account balance
      await tx.update(accountsTable)
        .set({ balance: sql`${accountsTable.balance} + ${totalAmount}` })
        .where(eq(accountsTable.id, cashAccountId));
    }
  });

  if (cashAccountId) {
    revalidateDomains('transactions', 'accounts');
  }
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
