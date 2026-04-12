"use server";

import { db } from "@/index";
import {
  truelayerConnectionsTable,
  accountsTable,
  transactionsTable,
  categoriesTable,
} from "@/db/schema";
import { eq, and, gte, desc, sql } from "drizzle-orm";
import { revalidateDomains } from "@/lib/revalidate";
import { getCurrentUserId } from "@/lib/auth";
import { toDateString } from "@/lib/date";
import { encryptForUser, decryptForUser, getUserKey } from "@/lib/encryption";
import { isLikelyRefund } from "@/lib/refund-matcher";
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
import { rateLimiters } from "@/lib/rate-limiter";
import { ValidationError } from "@/lib/errors";
import { getTrueLayerConnections as _getTrueLayerConnections } from "@/db/queries/truelayer";
import {
  setCachedImport,
  getCachedImport,
  clearCachedImport,
  type CachedTlAccount,
} from "@/lib/truelayer-import-cache";

// ---------------------------------------------------------------------------
// Save a new TrueLayer connection after OAuth callback
// ---------------------------------------------------------------------------

export async function saveTrueLayerConnection(
  userId: string,
  tokens: TrueLayerTokens,
) {
  const expiresAt = new Date(Date.now() + tokens.expires_in * 1000);
  const userKey = await getUserKey(userId);

  // Upsert: if the user reconnects (e.g. to grant access to more accounts),
  // update the existing connection's tokens instead of failing.
  const [connection] = await db
    .insert(truelayerConnectionsTable)
    .values({
      user_id: userId,
      access_token: encryptForUser(tokens.access_token, userKey),
      refresh_token: encryptForUser(tokens.refresh_token, userKey),
      token_expires_at: expiresAt,
    })
    .onConflictDoUpdate({
      target: truelayerConnectionsTable.user_id,
      set: {
        access_token: encryptForUser(tokens.access_token, userKey),
        refresh_token: encryptForUser(tokens.refresh_token, userKey),
        token_expires_at: expiresAt,
      },
    })
    .returning({ id: truelayerConnectionsTable.id });

  return connection;
}

// ---------------------------------------------------------------------------
// Get a valid access token, refreshing if expired
// ---------------------------------------------------------------------------

async function getValidToken(connectionId: string, userId: string): Promise<string> {
  const [conn] = await db
    .select()
    .from(truelayerConnectionsTable)
    .where(and(
      eq(truelayerConnectionsTable.id, connectionId),
      eq(truelayerConnectionsTable.user_id, userId),
    ));

  if (!conn) throw new Error("TrueLayer connection not found or access denied");

  const userKey = await getUserKey(userId);

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

// Re-export the account preview type from the cache module
export type { CachedTlAccount as TlAccountPreview } from "@/lib/truelayer-import-cache";

// ---------------------------------------------------------------------------
// Phase 1: Fetch ALL data from TrueLayer, cache it, return account previews
// ---------------------------------------------------------------------------

export async function fetchAndCacheTrueLayerData(): Promise<CachedTlAccount[]> {
  const userId = await getCurrentUserId();

  const connections = await db
    .select()
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.user_id, userId));

  if (connections.length === 0) {
    throw new Error("No TrueLayer connections found. Please connect a bank first.");
  }

  const allAccounts: CachedTlAccount[] = [];
  const allTransactions = new Map<string, Awaited<ReturnType<typeof fetchTransactions>>>();
  const allDateRanges = new Map<string, { from: string; to: string }>();

  for (const connection of connections) {
    let accessToken: string;
    try {
      accessToken = await getValidToken(connection.id, userId);
    } catch (tokenErr) {
      logger.error("truelayer.fetchAndCache", "Token refresh failed", { connectionId: connection.id, error: String(tokenErr) });
      continue;
    }

    const [tlAccounts, tlCards] = await Promise.all([
      fetchAccounts(accessToken).catch(() => [] as Awaited<ReturnType<typeof fetchAccounts>>),
      fetchCards(accessToken).catch(() => [] as Awaited<ReturnType<typeof fetchCards>>),
    ]);

    const hasCurrentAccount = tlAccounts.some(
      (a) => mapAccountType(a.account_type) === "currentAccount",
    );

    // Date range for transactions
    const to = toDateString(new Date());
    const from = connection.last_synced_at
      ? toDateString(new Date(connection.last_synced_at.getTime() - 2 * 24 * 60 * 60 * 1000))
      : toDateString(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));

    // Fetch accounts + balances + transactions in parallel per account
    for (const a of tlAccounts) {
      const accountType = mapAccountType(a.account_type);
      let balance = 0;
      try {
        const b = await fetchBalance(accessToken, a.account_id);
        balance = b.current;
      } catch { /* non-critical */ }

      allAccounts.push({
        tlId: a.account_id,
        displayName: a.display_name,
        accountType,
        currency: a.currency,
        providerName: a.provider?.display_name,
        source: "account",
        balance,
        likelyPot: hasCurrentAccount && accountType === "savings",
        connectionId: connection.id,
      });

      // Fetch transactions for this account
      try {
        const txns = await fetchTransactions(accessToken, a.account_id, from, to);
        allTransactions.set(a.account_id, txns);
        allDateRanges.set(a.account_id, { from, to });
        logger.debug("truelayer.fetchAndCache", `Fetched ${txns.length} txns for ${a.display_name}`, {
          accountId: a.account_id, count: txns.length,
        });
      } catch {
        logger.warn("truelayer.fetchAndCache", "Transaction fetch failed", { accountId: a.account_id });
      }
    }

    for (const c of tlCards) {
      let balance = 0;
      try {
        const b = await fetchCardBalance(accessToken, c.account_id);
        balance = b.current;
      } catch { /* non-critical */ }

      allAccounts.push({
        tlId: c.account_id,
        displayName: c.display_name,
        accountType: mapCardType(c.card_type),
        currency: c.currency,
        providerName: c.provider?.display_name,
        source: "card",
        balance,
        likelyPot: false,
        connectionId: connection.id,
      });

      // Fetch card transactions
      try {
        const txns = await fetchCardTransactions(accessToken, c.account_id, from, to);
        allTransactions.set(c.account_id, txns);
        allDateRanges.set(c.account_id, { from, to });
        logger.debug("truelayer.fetchAndCache", `Fetched ${txns.length} card txns for ${c.display_name}`, {
          accountId: c.account_id, count: txns.length,
        });
      } catch {
        logger.warn("truelayer.fetchAndCache", "Card transaction fetch failed", { accountId: c.account_id });
      }
    }
  }

  logger.info("truelayer.fetchAndCache", `Cached ${allAccounts.length} accounts, ${allTransactions.size} transaction sets`, {
    userId,
    totalTxns: Array.from(allTransactions.values()).reduce((s, t) => s + t.length, 0),
  });

  // Store everything in the cache
  setCachedImport(userId, {
    userId,
    accounts: allAccounts,
    transactions: allTransactions,
    dateRanges: allDateRanges,
    fetchedAt: new Date(),
  });

  return allAccounts;
}

// ---------------------------------------------------------------------------
// Phase 3: Write cached data to DB for selected accounts only
// ---------------------------------------------------------------------------

export async function importFromCache(selectedTlIds: string[]) {
  const userId = await getCurrentUserId();
  const cached = getCachedImport(userId);

  if (!cached || cached.userId !== userId) {
    logger.warn("truelayer.importFromCache", "Cache miss — falling back to live import", { userId });
    // Safety net: fall back to live fetch if cache expired
    return importFromTrueLayer(selectedTlIds);
  }

  try {
    const baseCurrency = await getUserBaseCurrency(userId);
    const userKey = await getUserKey(userId);

    // Build categorisation context
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
    const skippedAccounts: string[] = [];

    // Group cached accounts by connectionId to update last_synced_at
    const connectionIds = new Set<string>();

    const selectedAccounts = cached.accounts.filter((a) => selectedTlIds.includes(a.tlId));

    for (const tlItem of selectedAccounts) {
      try {
        connectionIds.add(tlItem.connectionId);

        // Upsert account
        const [upserted] = await db
          .insert(accountsTable)
          .values({
            user_id: userId,
            name: encryptForUser(
              tlItem.displayName || `Bank Account`,
              userKey,
            ),
            type: tlItem.accountType,
            balance: tlItem.balance,
            currency: tlItem.currency || baseCurrency,
            truelayer_id: tlItem.tlId,
            truelayer_connection_id: tlItem.connectionId,
          })
          .onConflictDoUpdate({
            target: [accountsTable.user_id, accountsTable.truelayer_id],
            set: { balance: tlItem.balance },
          })
          .returning({ id: accountsTable.id });

        const localAccountId = upserted.id;
        accountsImported++;

        // Get cached transactions for this account
        const tlTransactions = cached.transactions.get(tlItem.tlId);
        if (!tlTransactions || tlTransactions.length === 0) continue;

        const dateRange = cached.dateRanges.get(tlItem.tlId);
        const from = dateRange?.from ?? toDateString(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));
        const to = dateRange?.to ?? toDateString(new Date());

        // Pre-fetch recent expenses for refund matching
        const recentExpenses = await db
          .select({
            id: transactionsTable.id,
            amount: transactionsTable.amount,
            description: transactionsTable.description,
          })
          .from(transactionsTable)
          .where(
            and(
              eq(transactionsTable.user_id, userId),
              eq(transactionsTable.account_id, localAccountId),
              eq(transactionsTable.type, "expense"),
              gte(transactionsTable.date, from),
            ),
          )
          .orderBy(desc(transactionsTable.date))
          .limit(500);

        const uncategorised =
          userCategories.find((c) => c.name.toLowerCase() === "uncategorised") ??
          userCategories.find((c) => c.name.toLowerCase() === "other") ??
          userCategories[0];

        const txnBatch: (typeof transactionsTable.$inferInsert)[] = [];
        const merchantLearnings: { merchant: string; categoryId: string }[] = [];

        for (const tlTxn of tlTransactions) {
          const isExpense =
            tlTxn.transaction_type === "DEBIT" || tlTxn.amount < 0;
          const amount = Math.abs(tlTxn.amount);
          const description = tlTxn.description || "Bank transaction";

          // Classify transaction type
          const isMonzoPot = tlTxn.meta?.provider_category === "uk_retail_pot";
          const isStarlingSpace = tlTxn.meta?.provider_source === "INTERNAL_TRANSFER";
          const isTransfer = tlTxn.transaction_category === "TRANSFER" || isMonzoPot || isStarlingSpace;
          let type: "income" | "expense" | "transfer" | "refund" = isTransfer
            ? "transfer"
            : (isExpense ? "expense" : "income");
          let refundForTransactionId: string | null = null;

          // Refund matching (skip for transfers)
          if (!isExpense && !isTransfer) {
            const keywordMatch = isLikelyRefund(description);
            const descLower = description.toLowerCase();
            const expenseMatch = recentExpenses.find((e) => {
              if (Math.abs(e.amount - amount) > 0.01) return false;
              const expDesc = decryptForUser(e.description, userKey).toLowerCase();
              return descLower.includes(expDesc.substring(0, 20)) || expDesc.includes(descLower.substring(0, 20));
            });
            if (keywordMatch || expenseMatch) {
              type = "refund";
              refundForTransactionId = expenseMatch?.id ?? null;
            }
          }

          // Categorisation pipeline
          const catResult = categoriseTransaction(
            description,
            catCtx,
            tlTxn.transaction_category,
          );
          const categoryId = catResult.categoryId ?? uncategorised?.id ?? null;

          txnBatch.push({
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
          });

          if (catResult.categorySource === 'bank' && catResult.merchantName && catResult.categoryId) {
            merchantLearnings.push({ merchant: catResult.merchantName, categoryId: catResult.categoryId });
          }
        }

        // Insert in chunks
        const CHUNK_SIZE = 100;
        for (let i = 0; i < txnBatch.length; i += CHUNK_SIZE) {
          const chunk = txnBatch.slice(i, i + CHUNK_SIZE);
          const rows = await db.insert(transactionsTable)
            .values(chunk)
            .onConflictDoNothing()
            .returning({ id: transactionsTable.id });
          for (const row of rows) {
            importedTransactionIds.push(row.id);
          }
          transactionsImported += rows.length;
        }

        // Learn merchant mappings (non-blocking)
        for (const ml of merchantLearnings) {
          learnMerchantMappingForUser(userId, ml.merchant, ml.categoryId, 'bank')
            .catch((err) => logger.warn('truelayer.importFromCache', 'merchant mapping learn failed', err));
        }
      } catch (accountErr) {
        logger.error("truelayer.importFromCache", `Failed to import account ${tlItem.displayName}`, accountErr);
        skippedAccounts.push(tlItem.displayName);
      }
    }

    // Update last_synced_at for all involved connections
    for (const connId of connectionIds) {
      await db
        .update(truelayerConnectionsTable)
        .set({ last_synced_at: new Date() })
        .where(eq(truelayerConnectionsTable.id, connId));
    }

    revalidateDomains('accounts', 'transactions');

    return {
      accountsImported,
      transactionsImported,
      transactionIds: importedTransactionIds,
      skippedAccounts,
    };
  } finally {
    // Always clear cache after use
    clearCachedImport(userId);
  }
}

// ---------------------------------------------------------------------------
// Import accounts + transactions for all of a user's TrueLayer connections
// ---------------------------------------------------------------------------

export async function importFromTrueLayer(selectedTlIds?: string[]) {
  const userId = await getCurrentUserId();

  // H2: Rate limit import to prevent excessive TrueLayer API usage
  const rl = rateLimiters.truelayer.consume(`truelayer-import:${userId}`);
  if (!rl.allowed) {
    throw new ValidationError("Import rate limit exceeded. Please try again in a few minutes.");
  }

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
  const skippedAccounts: string[] = []; // L3: track skipped accounts

  for (const connection of connections) {
    // H4: Get token ONCE per connection, not per account
    let accessToken: string;
    try {
      accessToken = await getValidToken(connection.id, userId);
    } catch (tokenErr) {
      logger.error("truelayer.import", "Token refresh failed for connection, skipping all accounts", { connectionId: connection.id, error: String(tokenErr) });
      skippedAccounts.push(`Connection ${connection.provider_name ?? connection.id}`);
      continue;
    }

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

    logger.info("truelayer.import", `Found ${tlAccounts.length} accounts + ${tlCards.length} cards from TrueLayer`, {
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

    // C1: Smart date window — 730d on first import, last_synced_at - 2d on re-sync
    const to = toDateString(new Date());
    const from = connection.last_synced_at
      ? toDateString(new Date(connection.last_synced_at.getTime() - 2 * 24 * 60 * 60 * 1000))
      : toDateString(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));

    // Filter to user-selected accounts when provided (first import with account picker)
    const toImport = selectedTlIds
      ? normalised.filter((a) => selectedTlIds.includes(a.tlId))
      : normalised;

    for (const tlItem of toImport) {
      try {
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
            dateRange: { from, to },
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
          skippedAccounts.push(tlItem.displayName);
          continue;
        }

        // H1: Pre-fetch recent expenses for this account for refund matching (avoid N+1)
        const recentExpenses = await db
          .select({
            id: transactionsTable.id,
            amount: transactionsTable.amount,
            description: transactionsTable.description,
          })
          .from(transactionsTable)
          .where(
            and(
              eq(transactionsTable.user_id, userId),
              eq(transactionsTable.account_id, localAccountId),
              eq(transactionsTable.type, "expense"),
              gte(transactionsTable.date, from),
            ),
          )
          .orderBy(desc(transactionsTable.date))
          .limit(500);

        const uncategorised =
          userCategories.find((c) => c.name.toLowerCase() === "uncategorised") ??
          userCategories.find((c) => c.name.toLowerCase() === "other") ??
          userCategories[0];

        // C2: Build batch of transaction values, then insert in chunks
        const txnBatch: (typeof transactionsTable.$inferInsert)[] = [];
        const merchantLearnings: { merchant: string; categoryId: string }[] = [];

        for (const tlTxn of tlTransactions) {
          const isExpense =
            tlTxn.transaction_type === "DEBIT" || tlTxn.amount < 0;
          const amount = Math.abs(tlTxn.amount);
          const description = tlTxn.description || "Bank transaction";

          // Classify transaction type
          // Detect internal transfers: TL category TRANSFER, Monzo pots, or Starling Spaces
          const isMonzoPot = tlTxn.meta?.provider_category === "uk_retail_pot";
          const isStarlingSpace = tlTxn.meta?.provider_source === "INTERNAL_TRANSFER";
          const isTransfer = tlTxn.transaction_category === "TRANSFER" || isMonzoPot || isStarlingSpace;
          let type: "income" | "expense" | "transfer" | "refund" = isTransfer
            ? "transfer"
            : (isExpense ? "expense" : "income");
          let refundForTransactionId: string | null = null;

          // H1: In-memory refund matching using pre-fetched expenses
          // Skip refund detection for transfers (e.g. Monzo pot withdrawals back to current account)
          if (!isExpense && !isTransfer) {
            const keywordMatch = isLikelyRefund(description);
            const descLower = description.toLowerCase();
            const expenseMatch = recentExpenses.find((e) => {
              if (Math.abs(e.amount - amount) > 0.01) return false;
              const expDesc = decryptForUser(e.description, userKey).toLowerCase();
              return descLower.includes(expDesc.substring(0, 20)) || expDesc.includes(descLower.substring(0, 20));
            });
            if (keywordMatch || expenseMatch) {
              type = "refund";
              refundForTransactionId = expenseMatch?.id ?? null;
            }
          }

          // Unified categorisation pipeline: rules → merchant → bank category
          const catResult = categoriseTransaction(
            description,
            catCtx,
            tlTxn.transaction_category,
          );
          const categoryId = catResult.categoryId ?? uncategorised?.id ?? null;

          txnBatch.push({
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
          });

          if (catResult.categorySource === 'bank' && catResult.merchantName && catResult.categoryId) {
            merchantLearnings.push({ merchant: catResult.merchantName, categoryId: catResult.categoryId });
          }
        }

        // C2: Insert in chunks of 100 instead of one-by-one
        const CHUNK_SIZE = 100;
        for (let i = 0; i < txnBatch.length; i += CHUNK_SIZE) {
          const chunk = txnBatch.slice(i, i + CHUNK_SIZE);
          const rows = await db.insert(transactionsTable)
            .values(chunk)
            .onConflictDoNothing()
            .returning({ id: transactionsTable.id });
          for (const row of rows) {
            importedTransactionIds.push(row.id);
          }
          transactionsImported += rows.length;
        }

        // Learn merchant mappings in background (non-blocking)
        for (const ml of merchantLearnings) {
          learnMerchantMappingForUser(userId, ml.merchant, ml.categoryId, 'bank')
            .catch((err) => logger.warn('truelayer-import', 'merchant mapping learn failed', err));
        }
      } catch (accountErr) {
        logger.error("truelayer.import", `Failed to import account ${tlItem.displayName} (${tlItem.tlId}), continuing with next account`, accountErr);
        skippedAccounts.push(tlItem.displayName);
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

  return {
    accountsImported,
    transactionsImported,
    transactionIds: importedTransactionIds,
    skippedAccounts, // L3: expose skipped accounts to UI
  };
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
  const noSync = { synced: false, accountsImported: 0, transactionsImported: 0, transactionIds: [] };

  // M2: Atomic lock — UPDATE only rows whose last_synced_at is stale, RETURNING
  // the rows that were actually claimed. This eliminates the TOCTOU race.
  const threshold = new Date(Date.now() - SYNC_INTERVAL_MS);
  const claimed = await db
    .update(truelayerConnectionsTable)
    .set({ last_synced_at: new Date() })
    .where(
      and(
        eq(truelayerConnectionsTable.user_id, userId),
        sql`(${truelayerConnectionsTable.last_synced_at} IS NULL OR ${truelayerConnectionsTable.last_synced_at} < ${threshold})`,
      ),
    )
    .returning({ id: truelayerConnectionsTable.id });

  if (claimed.length === 0) {
    logger.info("truelayer.sync", "No connections need sync (atomic check)", { userId });
    return noSync;
  }

  logger.info("truelayer.sync", `Sync needed for ${claimed.length} connection(s)`, { userId });

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
    return noSync;
  }
}

// M5: getTrueLayerConnections moved to src/db/queries/truelayer.ts
// Thin wrapper (not a bare re-export) so this "use server" module stays valid.
export async function getTrueLayerConnections() {
  return _getTrueLayerConnections();
}

// ---------------------------------------------------------------------------
// Disconnect a TrueLayer connection
// ---------------------------------------------------------------------------

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export async function disconnectTrueLayer(connectionId: string) {
  // H3: Validate connectionId format before using in queries
  if (!UUID_RE.test(connectionId)) {
    throw new ValidationError("Invalid connection ID");
  }

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
