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
import {
  TrueLayerTokens,
  refreshAccessToken,
  fetchAccounts,
  fetchBalance,
  fetchTransactions,
} from "@/lib/truelayer";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { fetchUserRules, matchAgainstRules } from "@/lib/auto-categorise";
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
    return decryptForUser(conn.access_token, userKey);
  }

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

  // Fetch rules once for the entire import — used for all transactions
  // across all connections and accounts, avoiding an N+1 per transaction.
  const rules = await fetchUserRules(userId);

  let accountsImported = 0;
  let transactionsImported = 0;

  for (const connection of connections) {
    const accessToken = await getValidToken(connection.id);
    const tlAccounts = await fetchAccounts(accessToken);

    for (const tlAccount of tlAccounts) {
      const [existing] = await db
        .select({ id: accountsTable.id })
        .from(accountsTable)
        .where(
          and(
            eq(accountsTable.user_id, userId),
            eq(accountsTable.truelayer_id, tlAccount.account_id),
          ),
        );

      let balance = 0;
      try {
        const balanceData = await fetchBalance(
          accessToken,
          tlAccount.account_id,
        );
        balance = balanceData.current;
      } catch {
        logger.warn("truelayer.import", "Balance fetch failed for account", {
          accountId: tlAccount.account_id,
        });
      }

      let localAccountId: string;

      if (existing) {
        await db
          .update(accountsTable)
          .set({ balance })
          .where(eq(accountsTable.id, existing.id));
        localAccountId = existing.id;
      } else {
        const [created] = await db
          .insert(accountsTable)
          .values({
            user_id: userId,
            name: encryptForUser(
              tlAccount.display_name ||
                `${tlAccount.provider?.display_name ?? "Bank"} Account`,
              userKey,
            ),
            type: mapAccountType(tlAccount.account_type),
            balance,
            currency: tlAccount.currency || baseCurrency,
            truelayer_id: tlAccount.account_id,
            truelayer_connection_id: connection.id,
          })
          .returning({ id: accountsTable.id });

        localAccountId = created.id;
        accountsImported++;
      }

      if (tlAccount.provider?.display_name && !connection.provider_name) {
        await db
          .update(truelayerConnectionsTable)
          .set({ provider_name: tlAccount.provider.display_name })
          .where(eq(truelayerConnectionsTable.id, connection.id));
      }

      const to = toDateString(new Date());
      const from = toDateString(new Date(Date.now() - 730 * 24 * 60 * 60 * 1000));

      let tlTransactions;
      try {
        tlTransactions = await fetchTransactions(
          accessToken,
          tlAccount.account_id,
          from,
          to,
        );
      } catch {
        logger.warn(
          "truelayer.import",
          "Transaction fetch failed for account",
          {
            accountId: tlAccount.account_id,
          },
        );
        continue;
      }

      // Fetch categories once per account, not once per transaction
      const categories = await db
        .select({ id: categoriesTable.id, name: categoriesTable.name })
        .from(categoriesTable)
        .where(eq(categoriesTable.user_id, userId));

      const uncategorised =
        categories.find((c) => c.name.toLowerCase() === "uncategorised") ??
        categories.find((c) => c.name.toLowerCase() === "other") ??
        categories[0];

      for (const tlTxn of tlTransactions) {
        const [existingTxn] = await db
          .select({ id: transactionsTable.id })
          .from(transactionsTable)
          .where(eq(transactionsTable.truelayer_id, tlTxn.transaction_id));

        if (existingTxn) continue;

        const isExpense =
          tlTxn.transaction_type === "DEBIT" || tlTxn.amount < 0;
        const amount = Math.abs(tlTxn.amount);
        const type = isExpense ? "expense" : "income";
        const description = tlTxn.description || "Bank transaction";

        // Pure rule match — no DB call, rules already fetched above
        const matchedCategoryId = matchAgainstRules(rules, description);
        const categoryId = matchedCategoryId ?? uncategorised?.id ?? null;

        await db.insert(transactionsTable).values({
          user_id: userId,
          account_id: localAccountId,
          category_id: categoryId,
          type,
          amount,
          description: encryptForUser(description, userKey),
          date: tlTxn.timestamp ? tlTxn.timestamp.split("T")[0] : to,
          is_recurring: false,
          truelayer_id: tlTxn.transaction_id,
        });

        transactionsImported++;
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

  return { accountsImported, transactionsImported };
}

// ---------------------------------------------------------------------------
// Auto-sync: only import if last sync was more than 1 hour ago
// ---------------------------------------------------------------------------

const SYNC_INTERVAL_MS = 60 * 60 * 1000;

export async function syncBankIfNeeded(): Promise<{
  synced: boolean;
  accountsImported: number;
  transactionsImported: number;
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
    return { synced: false, accountsImported: 0, transactionsImported: 0 };
  }

  const now = Date.now();
  const needsSync = connections.some(
    (c) =>
      !c.last_synced_at || now - c.last_synced_at.getTime() > SYNC_INTERVAL_MS,
  );

  if (!needsSync) {
    return { synced: false, accountsImported: 0, transactionsImported: 0 };
  }

  try {
    const result = await importFromTrueLayer();
    return { synced: true, ...result };
  } catch (err) {
    logger.error("truelayer.sync", "Auto-sync failed", err);
    return { synced: false, accountsImported: 0, transactionsImported: 0 };
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

  const linkedAccounts = await db
    .select({ id: accountsTable.id })
    .from(accountsTable)
    .where(
      and(
        eq(accountsTable.truelayer_connection_id, connectionId),
        eq(accountsTable.user_id, userId),
      ),
    );

  for (const account of linkedAccounts) {
    await db
      .delete(transactionsTable)
      .where(eq(transactionsTable.account_id, account.id));
  }

  await db
    .delete(accountsTable)
    .where(
      and(
        eq(accountsTable.truelayer_connection_id, connectionId),
        eq(accountsTable.user_id, userId),
      ),
    );

  await db
    .delete(truelayerConnectionsTable)
    .where(
      and(
        eq(truelayerConnectionsTable.id, connectionId),
        eq(truelayerConnectionsTable.user_id, userId),
      ),
    );

  revalidateDomains('accounts');
}
