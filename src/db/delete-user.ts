/**
 * CLI script to delete ALL data for a single user by UID.
 *
 * Usage:
 *   npx tsx src/db/delete-user.ts <user-uuid>
 *
 * Requires DATABASE_URL in env (or .env.local loaded by dotenv).
 */
import "dotenv/config";
import { eq, or, inArray } from "drizzle-orm";
import { adminDb as db } from "@/index";
import {
  accountsTable,
  budgetAlertPreferencesTable,
  budgetNotificationsTable,
  budgetsTable,
  brokerConnectionsTable,
  categoriesTable,
  categorisationRulesTable,
  dashboardLayoutsTable,
  debtPaymentsTable,
  debtsTable,
  goalsTable,
  holdingSalesTable,
  investmentGroupsTable,
  manualHoldingsTable,
  mfaBackupCodesTable,
  netWorthSnapshotsTable,
  retirementProfilesTable,
  sharedAccessTable,
  subscriptionsTable,
  transactionReviewFlagsTable,
  transactionsTable,
  transactionSplitsTable,
  truelayerConnectionsTable,
  userKeysTable,
  userOnboardingTable,
  userPreferencesTable,
  zakatCalculationsTable,
  zakatSettingsTable,
  otherAssetsTable,
  nudgeDismissalsTable,
} from "@/db/schema";

async function deleteUser(userId: string) {
  // Validate UUID format
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  if (!uuidRegex.test(userId)) {
    throw new Error(`Invalid UUID: ${userId}`);
  }

  await db.transaction(async (tx) => {
    // Gather IDs inside the transaction to prevent concurrent inserts from being missed
    const userAccounts = await tx
      .select({ id: accountsTable.id })
      .from(accountsTable)
      .where(eq(accountsTable.user_id, userId));
    const accountIds = userAccounts.map((a) => a.id);

    const userDebts = await tx
      .select({ id: debtsTable.id })
      .from(debtsTable)
      .where(eq(debtsTable.user_id, userId));
    const debtIds = userDebts.map((d) => d.id);

    const userHoldings = await tx
      .select({ id: manualHoldingsTable.id })
      .from(manualHoldingsTable)
      .where(eq(manualHoldingsTable.user_id, userId));
    const holdingIds = userHoldings.map((h) => h.id);

    // --- Leaf / child records first ---

    // Transaction review flags
    await tx.delete(transactionReviewFlagsTable).where(eq(transactionReviewFlagsTable.user_id, userId));

    // Debt payments (child of debts)
    if (debtIds.length > 0) {
      await tx.delete(debtPaymentsTable).where(inArray(debtPaymentsTable.debt_id, debtIds));
    }

    // Transaction splits (child of transactions)
    if (accountIds.length > 0) {
      const txns = await tx
        .select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(inArray(transactionsTable.account_id, accountIds));
      const txnIds = txns.map((t) => t.id);
      if (txnIds.length > 0) {
        await tx.delete(transactionSplitsTable).where(inArray(transactionSplitsTable.transaction_id, txnIds));
      }
    }

    // Holding sales (child of manual_holdings)
    if (holdingIds.length > 0) {
      await tx.delete(holdingSalesTable).where(inArray(holdingSalesTable.holding_id, holdingIds));
    }

    // --- Shared access (both as owner and recipient) ---
    await tx.delete(sharedAccessTable).where(
      or(eq(sharedAccessTable.owner_id, userId), eq(sharedAccessTable.shared_with_id, userId))
    );

    // --- User-level records ---
    await tx.delete(netWorthSnapshotsTable).where(eq(netWorthSnapshotsTable.user_id, userId));
    await tx.delete(budgetNotificationsTable).where(eq(budgetNotificationsTable.user_id, userId));
    await tx.delete(budgetAlertPreferencesTable).where(eq(budgetAlertPreferencesTable.user_id, userId));
    await tx.delete(subscriptionsTable).where(eq(subscriptionsTable.user_id, userId));
    await tx.delete(goalsTable).where(eq(goalsTable.user_id, userId));
    await tx.delete(categorisationRulesTable).where(eq(categorisationRulesTable.user_id, userId));
    await tx.delete(investmentGroupsTable).where(eq(investmentGroupsTable.user_id, userId));
    await tx.delete(manualHoldingsTable).where(eq(manualHoldingsTable.user_id, userId));
    await tx.delete(brokerConnectionsTable).where(eq(brokerConnectionsTable.user_id, userId));
    await tx.delete(zakatCalculationsTable).where(eq(zakatCalculationsTable.user_id, userId));
    await tx.delete(zakatSettingsTable).where(eq(zakatSettingsTable.user_id, userId));
    await tx.delete(otherAssetsTable).where(eq(otherAssetsTable.user_id, userId));
    await tx.delete(debtsTable).where(eq(debtsTable.user_id, userId));
    await tx.delete(retirementProfilesTable).where(eq(retirementProfilesTable.user_id, userId));
    await tx.delete(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, userId));
    await tx.delete(nudgeDismissalsTable).where(eq(nudgeDismissalsTable.user_id, userId));
    await tx.delete(mfaBackupCodesTable).where(eq(mfaBackupCodesTable.user_id, userId));

    // --- Transactions (linked to accounts) ---
    if (accountIds.length > 0) {
      await tx.delete(transactionsTable).where(inArray(transactionsTable.account_id, accountIds));
    }

    // --- Budgets and categories ---
    await tx.delete(budgetsTable).where(eq(budgetsTable.user_id, userId));
    await tx.delete(categoriesTable).where(eq(categoriesTable.user_id, userId));

    // --- Accounts and bank connections ---
    await tx.delete(accountsTable).where(eq(accountsTable.user_id, userId));
    await tx.delete(truelayerConnectionsTable).where(eq(truelayerConnectionsTable.user_id, userId));

    // --- Preferences, onboarding ---
    await tx.delete(userPreferencesTable).where(eq(userPreferencesTable.user_id, userId));
    await tx.delete(userOnboardingTable).where(eq(userOnboardingTable.user_id, userId));

    // --- Encryption keys (last, after all encrypted data is gone) ---
    await tx.delete(userKeysTable).where(eq(userKeysTable.user_id, userId));
  });
}

// ── CLI entry point ──────────────────────────────────────────────
async function main() {
  const userId = process.argv[2];
  if (!userId) {
    console.error("Usage: npx tsx src/db/delete-user.ts <user-uuid>");
    process.exit(1);
  }

  console.log(`⚠️  About to delete ALL data for user: ${userId}`);
  console.log("   Press Ctrl+C within 5 seconds to abort...");

  await new Promise((resolve) => setTimeout(resolve, 5000));

  console.log("🗑  Deleting user data...");
  await deleteUser(userId);
  console.log("✅ All data for user deleted successfully.");

  process.exit(0);
}

main().catch((err) => {
  console.error("❌ Failed to delete user data:", err);
  process.exit(1);
});
