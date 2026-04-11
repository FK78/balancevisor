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
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zEnum, zUUID, zString, zOptionalNumber } from '@/lib/form-schema';
import type { BrokerSource, BrokerCredentials } from "@/lib/brokers/types";
import { BROKER_SOURCES } from "@/lib/brokers/types";
import { getAdapter } from "@/lib/brokers";
import { logger } from "@/lib/logger";

function revalidateInvestments() {
  revalidateDomains('investments');
}

// ---------------------------------------------------------------------------
// Generic broker connection mutations
// ---------------------------------------------------------------------------

const connectBrokerSchema = z.object({
  broker: zEnum(BROKER_SOURCES, 'trading212'),
  apiKey: zRequiredString(),
  apiSecret: zRequiredString(),
  environment: zEnum(['live', 'demo', 'paper'] as const, 'live'),
  account_id: zUUID(),
});

export async function connectBroker(formData: FormData) {
  const userId = await getCurrentUserId();
  const data = parseFormData(connectBrokerSchema, formData);
  const broker = data.broker as BrokerSource;
  const apiKey = data.apiKey;
  const apiSecret = data.apiSecret;
  const environment = data.environment;
  const accountId = data.account_id;

  const credentials: BrokerCredentials = {
    apiKey,
    apiSecret,
    environment,
  };

  // Preflight: validate credentials before persisting
  const adapter = getAdapter(broker);
  if (adapter.validateCredentials) {
    const validation = await adapter.validateCredentials(credentials);
    if (!validation.valid) {
      logger.warn("connectBroker", `${broker} validation failed`, {
        code: validation.code,
        message: validation.message,
      });
      throw new Error(validation.message);
    }
  }

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

/**
 * Record a successful or failed sync attempt for a broker connection.
 * Called from portfolio-data / investment-value after each fetch.
 */
export async function updateBrokerSyncStatus(
  userId: string,
  broker: BrokerSource,
  result: { success: true } | { success: false; error: string },
) {
  if (result.success) {
    await db
      .update(brokerConnectionsTable)
      .set({
        last_synced_at: new Date(),
        last_error: null,
        consecutive_failures: 0,
      })
      .where(
        and(
          eq(brokerConnectionsTable.user_id, userId),
          eq(brokerConnectionsTable.broker, broker),
        ),
      );
  } else {
    await db
      .update(brokerConnectionsTable)
      .set({
        last_error: result.error.slice(0, 500),
        consecutive_failures: sql`${brokerConnectionsTable.consecutive_failures} + 1`,
      })
      .where(
        and(
          eq(brokerConnectionsTable.user_id, userId),
          eq(brokerConnectionsTable.broker, broker),
        ),
      );
  }
}

export async function disconnectBroker(formData: FormData) {
  const userId = await getCurrentUserId();
  const { broker: brokerRaw } = parseFormData(z.object({ broker: zRequiredString() }), formData);
  const broker = brokerRaw as BrokerSource;

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
  const { decryptForUser } = await import("@/lib/encryption");

  await db.transaction(async (tx) => {
    // Fetch existing credentials inside the transaction to prevent concurrent overwrites
    const [existing] = await tx
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

    const currentCreds: BrokerCredentials = JSON.parse(
      decryptForUser(existing.credentials_encrypted, userKey),
    );

    const updatedCreds: BrokerCredentials = {
      ...currentCreds,
      ...tokens,
    };

    const credentialsEncrypted = encryptForUser(JSON.stringify(updatedCreds), userKey);

    await tx
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
  });
}

const holdingSchema = z.object({
  investment_type: zEnum(['stock', 'real_estate', 'private_equity', 'other'] as const, 'stock'),
  ticker: zString(20).transform((v) => v?.trim() ?? ''),
  name: zRequiredString(),
  quantity: zNumber({ min: 0.0001 }),
  averagePrice: zNumber({ min: 0 }),
  currency: zEnum(['GBP', 'USD', 'EUR'] as const, 'GBP'),
  account_id: zUUID(),
  group_id: zUUID(),
  estimated_return_percent: zOptionalNumber(),
  notes: zString(500),
});

export async function addManualHolding(formData: FormData) {
  const userId = await getCurrentUserId();
  const data = parseFormData(holdingSchema, formData);
  const investmentType = data.investment_type;
  const tickerRaw = data.ticker ?? '';
  const name = data.name;
  const quantity = data.quantity;
  const averagePriceRaw = data.averagePrice;
  const currency = data.currency;
  const accountId = data.account_id;
  const groupId = data.group_id;
  const estimatedReturnPercent = data.estimated_return_percent;
  const notes = data.notes;

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

  // For private investments the form sends total invested; convert to per-unit price
  const averagePrice = investmentType === "stock" ? averagePriceRaw : averagePriceRaw / quantity;

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
  const editData = parseFormData(holdingSchema.omit({ investment_type: true, currency: true }), formData);
  const tickerRaw = editData.ticker ?? '';
  const name = editData.name;
  const quantity = editData.quantity;
  const averagePriceRaw = editData.averagePrice;

  // For private investments the form sends total invested; convert to per-unit price
  const averagePrice = investmentType === "stock" ? averagePriceRaw : averagePriceRaw / quantity;
  const accountId = editData.account_id;
  const groupId = editData.group_id;
  const estimatedReturnPercent = editData.estimated_return_percent;
  const notes = editData.notes;

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
  const saleSchema = z.object({
    holding_id: z.string().uuid('Missing holding ID'),
    quantity: zNumber({ min: 0.0001 }),
    price_per_unit: zNumber({ min: 0 }),
    date: zString().transform((v) => v ? new Date(v) : new Date()),
    cash_account_id: zUUID(),
    notes: zString(500),
  });
  const saleData = parseFormData(saleSchema, formData);
  const holdingId = saleData.holding_id;
  const quantity = saleData.quantity;
  const pricePerUnit = saleData.price_per_unit;
  const date = saleData.date ?? new Date();
  const cashAccountId = saleData.cash_account_id;
  const notes = saleData.notes;

  await db.transaction(async (tx) => {
    // Fetch holding inside the transaction to prevent stale-read race
    const [holding] = await tx
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

    // Atomic quantity decrement to prevent overselling
    await tx
      .update(manualHoldingsTable)
      .set({
        quantity: sql`GREATEST(${manualHoldingsTable.quantity} - ${quantity}, 0)`,
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
