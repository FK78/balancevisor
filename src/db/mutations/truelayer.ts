"use server";

import { db } from "@/index";
import {
  truelayerConnectionsTable,
  accountsTable,
  transactionsTable,
  categoriesTable,
} from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidateDomains } from "@/lib/revalidate";
import { getCurrentUserId } from "@/lib/auth";
import { toDateString } from "@/lib/date";
import { encryptForUser, decryptForUser, getUserKey } from "@/lib/encryption";
import { isLikelyRefund, findMatchingExpense } from "@/lib/refund-matcher";
import {
  TrueLayerTokens,
  refreshAccessToken,
  fetchAccounts,
  fetchBalance,
  fetchTransactions,
  fetchCards,
  fetchCardBalance,
  fetchCardTransactions,
} from "@/lib/truelayer";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { fetchUserRules } from "@/lib/auto-categorise";
import { getAllMerchantMappings } from "@/db/queries/merchant-mappings";
import { categoriseTransaction } from "@/lib/categorise-transaction";
import type { CategoriseContext } from "@/lib/categorise-transaction";
import { learnMerchantMappingForUser } from "@/db/mutations/merchant-mappings";
import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Save a new TrueLayer connection after OAuth callback
// ---------------------------------------------------------------------------

export async function saveTrueLayerConnection(
  userId: string,
  tokens: TrueLayerTokens,
) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  const userKey = await getUserKey(userId);

  const [connection] = await db
    .insert(truelayerConnectionsTable)
    .values({
      user_id: userId,
      access_token: encryptForUser(tokens.access_token, userKey),
      refresh_token: encryptForUser(tokens.refresh_token, userKey),
      token_expires_at: expiresAt,
    })
    .returning({ id: truelayerConnectionsTable.id });

  return connection;
}

// ---------------------------------------------------------------------------
// Get a valid access token, refreshing if expired
// ---------------------------------------------------------------------------

async function getValidToken(connectionId: string): Promise<string> {
  const [conn] = await db
    .select()
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.id, connectionId));

  if (!conn) throw new Error("TrueLayer connection not found");

  const userKey = await getUserKey(conn.user_id);

  if (conn.token_expires_at > new Date()) {
    logger.info("truelayer.token", "Access token still valid", {
      connectionId,
      expiresAt: conn.token_expires_at.toISOString(),
    });
    return decryptForUser(conn.access_token, userKey);
  }

  logger.info("truelayer.token", "Access token expired, refreshing", {
    connectionId,
    expiredAt: conn.token_expires_at.toISOString(),
  });

  const tokens = await refreshAccessToken(decryptForUser(conn.refresh_token, userKey));
  const newExpiry = new Date(Date.now() + tokens.expires_in * 1000);

  await db
    .update(truelayerConnectionsTable)
    .set({
      access_token: encryptForUser(tokens.access_token, userKey),
      refresh_token: encryptForUser(tokens.refresh_token, userKey),
      token_expires_at: newExpiry,
    })
    .where(eq(truelayerConnectionsTable.id, connectionId));

  return tokens.access_token;
}

// ---------------------------------------------------------------------------
// Map TrueLayer account type → our account type enum
// ---------------------------------------------------------------------------

function mapAccountType(
  tlType: string,
): "currentAccount" | "savings" | "creditCard" | "investment" {
  const t = tlType.toUpperCase();
  if (t === "SAVINGS") return "savings";
  if (t === "CREDIT_CARD" || t === "CREDITCARD") return "creditCard";
  if (t === "INVESTMENT" || t === "ISA" || t === "PENSION") return "investment";
  return "currentAccount";
}

function mapCardType(
  cardType: string,
): "currentAccount" | "savings" | "creditCard" | "investment" {
  const t = cardType.toUpperCase();
  if (t === "PREPAID") return "currentAccount";
  return "creditCard"; // CREDIT, CHARGE, etc.
}

/**
 * Normalised shape for both TrueLayer accounts and cards so the import
 * loop can handle them identically.
 */
interface NormalisedTlAccount {
  readonly tlId: string;
  readonly displayName: string;
  readonly accountType: "currentAccount" | "savings" | "creditCard" | "investment";
  readonly currency: string;
  readonly providerName: string | undefined;
  readonly source: "account" | "card";
}

// ---------------------------------------------------------------------------
// Import accounts + transactions for all of a user's TrueLayer connections
// ---------------------------------------------------------------------------

export async function importFromTrueLayer() {
  const userId = await getCurrentUserId();
  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  const connections = await db
    .select()
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.user_id, userId));

  if (connections.length === 0) {
    throw new Error(
      "No TrueLayer connections found. Please connect a bank first.",
    );
  }

  // Build categorisation context once for the entire import
  const [rules, merchantMappings, userCategories] = await Promise.all([
    fetchUserRules(userId),
    getAllMerchantMappings(userId),
    db.select({ id: categoriesTable.id, name: categoriesTable.name })
      .from(categoriesTable)
      .where(eq(categoriesTable.user_id, userId)),
  ]);
  const catCtx: CategoriseContext = { rules, merchantMappings, userCategories };

  let accountsImported = 0;
  let transactionsImported = 0;
  const importedTransactionIds: string[] = [];

  for (const connection of connections) {
    const accessToken = await getValidToken(connection.id);

    // Fetch bank accounts (/data/v1/accounts) and cards (/data/v1/cards)
    // separately — TrueLayer serves them from different endpoints.
    const [tlAccounts, tlCards] = await Promise.all([
      fetchAccounts(accessToken).catch((err) => {
        logger.warn("truelayer.import", "Accounts endpoint failed", { connectionId: connection.id, error: String(err) });
        return [] as Awaited<ReturnType<typeof fetchAccounts>>;
      }),
      fetchCards(accessToken).catch((err) => {
        logger.warn("truelayer.import", "Cards endpoint failed", { connectionId: connection.id, error: String(err) });
        return [] as Awaited<ReturnType<typeof fetchCards>>;
      }),
    ]);

    // Normalise into a unified shape so the import loop handles both
    const normalised: NormalisedTlAccount[] = [
      ...tlAccounts.map((a) => ({
        tlId: a.account_id,
        displayName: a.display_name,
        accountType: mapAccountType(a.account_type),
        currency: a.currency,
        providerName: a.provider?.display_name,
        source: "account" as const,
      })),
      ...tlCards.map((c) => ({
        tlId: c.account_id,
        displayName: c.display_name,
        accountType: mapCardType(c.card_type),
        currency: c.currency,
        providerName: c.provider?.display_name,
        source: "card" as const,
      })),
    ];

    logger.debug("truelayer.import", `Fetched ${tlAccounts.length} accounts + ${tlCards.length} cards from TrueLayer`, {
      connectionId: connection.id,
      items: normalised.map((a) => ({
        tl_id: a.tlId,
        display_name: a.displayName,
        type: a.accountType,
        source: a.source,
        currency: a.currency,
        provider: a.providerName,
      })),
    });

    for (const tlItem of normalised) {
      let balance = 0;
      try {
        const balanceData = tlItem.source === "card"
          ? await fetchCardBalance(accessToken, tlItem.tlId)
          : await fetchBalance(accessToken, tlItem.tlId);
        balance = balanceData.current;
        logger.debug("truelayer.import", `Balance for ${tlItem.displayName}`, {
          accountId: tlItem.tlId,
          source: tlItem.source,
          balance: balanceData.current,
          currency: balanceData.currency,
        });
      } catch {
        logger.warn("truelayer.import", "Balance fetch failed for account", {
          accountId: tlItem.tlId,
          source: tlItem.source,
        });
      }

      // Upsert: insert or update on conflict (user_id, truelayer_id) to prevent duplicate accounts
      const [upserted] = await db
        .insert(accountsTable)
        .values({
          user_id: userId,
          name: encryptForUser(
            tlItem.displayName ||
              `${tlItem.providerName ?? "Bank"} Account`,
            userKey,
          ),
          type: tlItem.accountType,
          balance,
          currency: tlItem.currency || baseCurrency,
          truelayer_id: tlItem.tlId,
          truelayer_connection_id: connection.id,
        })
        .onConflictDoUpdate({
          target: [accountsTable.user_id, accountsTable.truelayer_id],
          set: { balance },
        })
        .returning({ id: accountsTable.id });

      const localAccountId = upserted.id;
      accountsImported++;

      if (tlItem.providerName && !connection.provider_name) {
        await db
          .update(truelayerConnectionsTable)
          .set({ provider_name: tlItem.providerName })
          .where(eq(truelayerConnectionsTable.id, connection.id));
      }

      const to = toDateString(new Date());
      const from = toDateString(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));

      let tlTransactions;
      try {
        tlTransactions = tlItem.source === "card"
          ? await fetchCardTransactions(accessToken, tlItem.tlId, from, to)
          : await fetchTransactions(accessToken, tlItem.tlId, from, to);
        logger.debug("truelayer.import", `Fetched ${tlTransactions.length} transactions for ${tlItem.displayName}`, {
          accountId: tlItem.tlId,
          source: tlItem.source,
          accountType: tlItem.accountType,
          totalCount: tlTransactions.length,
          sample: tlTransactions.slice(0, 10).map((t) => ({
            transaction_id: t.transaction_id,
            timestamp: t.timestamp,
            description: t.description,
            amount: t.amount,
            currency: t.currency,
            transaction_type: t.transaction_type,
            transaction_category: t.transaction_category,
          })),
        });
      } catch {
        logger.warn(
          "truelayer.import",
          "Transaction fetch failed for account",
          {
            accountId: tlItem.tlId,
            source: tlItem.source,
          },
        );
        continue;
      }

      const uncategorised =
        userCategories.find((c) => c.name.toLowerCase() === "uncategorised") ??
        userCategories.find((c) => c.name.toLowerCase() === "other") ??
        userCategories[0];

      for (const tlTxn of tlTransactions) {
        const isExpense =
          tlTxn.transaction_type === "DEBIT" || tlTxn.amount < 0;
        const amount = Math.abs(tlTxn.amount);
        const description = tlTxn.description || "Bank transaction";

        logger.debug("truelayer.import", `Transaction: ${description}`, {
          transaction_id: tlTxn.transaction_id,
          raw_amount: tlTxn.amount,
          abs_amount: amount,
          transaction_type: tlTxn.transaction_type,
          transaction_category: tlTxn.transaction_category,
          isExpense,
          timestamp: tlTxn.timestamp,
        });

        // Classify transaction type
        // DEBIT + TRANSFER = internal move (e.g. Monzo Roundups, pot transfers) — not a real expense
        const isTransfer = tlTxn.transaction_category === "TRANSFER";
        let type: "income" | "expense" | "transfer" | "refund" = isExpense
          ? (isTransfer ? "transfer" : "expense")
          : "income";
        let refundForTransactionId: string | null = null;

        if (!isExpense) {
          const keywordMatch = isLikelyRefund(description);
          const expenseMatch = await findMatchingExpense(userId, localAccountId, amount, description);
          if (keywordMatch || expenseMatch) {
            type = "refund";
            refundForTransactionId = expenseMatch?.transactionId ?? null;
          }
        }

        // Unified categorisation pipeline: rules → merchant → bank category
        const catResult = categoriseTransaction(
          description,
          catCtx,
          tlTxn.transaction_category,
        );
        const categoryId = catResult.categoryId ?? uncategorised?.id ?? null;

        // Use onConflictDoNothing to safely skip duplicates during concurrent imports
        const rows = await db.insert(transactionsTable).values({
          user_id: userId,
          account_id: localAccountId,
          category_id: categoryId,
          category_source: catResult.categorySource,
          merchant_name: catResult.merchantName,
          type,
          amount,
          description: encryptForUser(description, userKey),
          date: tlTxn.timestamp ? tlTxn.timestamp.split("T")[0] : to,
          is_recurring: false,
          truelayer_id: tlTxn.transaction_id,
          refund_for_transaction_id: refundForTransactionId,
        }).onConflictDoNothing().returning({ id: transactionsTable.id });

        if (rows.length > 0) {
          importedTransactionIds.push(rows[0].id);
          transactionsImported++;

          // Learn merchant mapping from bank category matches
          if (catResult.categorySource === 'bank' && catResult.merchantName && catResult.categoryId) {
            learnMerchantMappingForUser(userId, catResult.merchantName, catResult.categoryId, 'bank').catch((err) => logger.warn('truelayer-import', 'merchant mapping learn failed', err));
          }
        }
      }
    }
  }

  for (const connection of connections) {
    await db
      .update(truelayerConnectionsTable)
      .set({ last_synced_at: new Date() })
      .where(eq(truelayerConnectionsTable.id, connection.id));
  }

  revalidateDomains('accounts', 'transactions');

  return { accountsImported, transactionsImported, transactionIds: importedTransactionIds };
}

// ---------------------------------------------------------------------------
// Auto-sync: only import if last sync was more than 1 hour ago
// ---------------------------------------------------------------------------

const SYNC_INTERVAL_MS = 60 * 60 * 1000;

export async function syncBankIfNeeded(): Promise<{
  synced: boolean;
  accountsImported: number;
  transactionsImported: number;
  transactionIds: string[];
}> {
  const userId = await getCurrentUserId();

  const connections = await db
    .select({
      id: truelayerConnectionsTable.id,
      last_synced_at: truelayerConnectionsTable.last_synced_at,
    })
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.user_id, userId));

  if (connections.length === 0) {
    logger.info("truelayer.sync", "No connections found, skipping sync", { userId });
    return { synced: false, accountsImported: 0, transactionsImported: 0, transactionIds: [] };
  }

  const now = Date.now();
  const needsSync = connections.some(
    (c) =>
      !c.last_synced_at || now - c.last_synced_at.getTime() > SYNC_INTERVAL_MS,
  );

  if (!needsSync) {
    logger.info("truelayer.sync", "All connections recently synced, skipping", {
      userId,
      lastSyncedAt: connections.map((c) => c.last_synced_at?.toISOString() ?? "never"),
    });
    return { synced: false, accountsImported: 0, transactionsImported: 0, transactionIds: [] };
  }

  logger.info("truelayer.sync", "Sync needed, starting import", { userId });

  // Optimistic lock: set last_synced_at BEFORE import to prevent concurrent syncs
  for (const c of connections) {
    if (!c.last_synced_at || now - c.last_synced_at.getTime() > SYNC_INTERVAL_MS) {
      await db
        .update(truelayerConnectionsTable)
        .set({ last_synced_at: new Date() })
        .where(eq(truelayerConnectionsTable.id, c.id));
    }
  }

  try {
    const result = await importFromTrueLayer();
    logger.info("truelayer.sync", "Sync completed", {
      userId,
      accountsImported: result.accountsImported,
      transactionsImported: result.transactionsImported,
    });
    return { synced: true, ...result };
  } catch (err) {
    logger.error("truelayer.sync", "Auto-sync failed", err);
    return { synced: false, accountsImported: 0, transactionsImported: 0, transactionIds: [] };
  }
}

// ---------------------------------------------------------------------------
// Get user's TrueLayer connections
// ---------------------------------------------------------------------------

export async function getTrueLayerConnections() {
  const userId = await getCurrentUserId();

  return db
    .select({
      id: truelayerConnectionsTable.id,
      provider_name: truelayerConnectionsTable.provider_name,
      connected_at: truelayerConnectionsTable.connected_at,
      last_synced_at: truelayerConnectionsTable.last_synced_at,
    })
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.user_id, userId));
}

// ---------------------------------------------------------------------------
// Disconnect a TrueLayer connection
// ---------------------------------------------------------------------------

export async function disconnectTrueLayer(connectionId: string) {
  const userId = await getCurrentUserId();

  await db.transaction(async (tx) => {
    const linkedAccounts = await tx
      .select({ id: accountsTable.id })
      .from(accountsTable)
      .where(
        and(
          eq(accountsTable.truelayer_connection_id, connectionId),
          eq(accountsTable.user_id, userId),
        ),
      );

    for (const account of linkedAccounts) {
      await tx
        .delete(transactionsTable)
        .where(eq(transactionsTable.account_id, account.id));
    }

    await tx
      .delete(accountsTable)
      .where(
        and(
          eq(accountsTable.truelayer_connection_id, connectionId),
          eq(accountsTable.user_id, userId),
        ),
      );

    await tx
      .delete(truelayerConnectionsTable)
      .where(
        and(
          eq(truelayerConnectionsTable.id, connectionId),
          eq(truelayerConnectionsTable.user_id, userId),
        ),
      );
  });

  revalidateDomains('accounts');
}
