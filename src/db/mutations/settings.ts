'use server';

import { db } from '@/index';
import {
  accountsTable,
  budgetAlertPreferencesTable,
  budgetNotificationsTable,
  budgetsTable,
  categoriesTable,
  categorisationRulesTable,
  merchantMappingsTable,
  goalsTable,
  manualHoldingsTable,
  subscriptionsTable,
  brokerConnectionsTable,
  transactionsTable,
  truelayerConnectionsTable,
  debtsTable,
  debtPaymentsTable,
  netWorthSnapshotsTable,
  userOnboardingTable,
  sharedAccessTable,
  investmentGroupsTable,
  holdingSalesTable,
  transactionSplitsTable,
  userPreferencesTable,
  zakatSettingsTable,
  zakatCalculationsTable,
  retirementProfilesTable,
  dashboardLayoutsTable,
  userKeysTable,
} from '@/db/schema';
import { EXPORT_VERSION } from '@/lib/types';
import type { ExportData } from '@/lib/types';
import { eq, or, inArray } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import { createClient } from '@/lib/supabase/server';
import { normalizeBaseCurrency } from '@/lib/currency';
import { sanitizeString } from '@/lib/sanitize';

export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const displayName = sanitizeString(formData.get('display_name') as string, 100);

  if (!displayName) return { error: 'Display name is required.' };

  const { error } = await supabase.auth.updateUser({
    data: { display_name: displayName },
  });

  if (error) return { error: error.message };

  revalidateDomains('settings');
  return { success: true };
}

export async function updateBaseCurrency(formData: FormData): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const baseCurrency = normalizeBaseCurrency(formData.get('base_currency') as string | null);

    await db.transaction(async (tx) => {
      await tx.update(userOnboardingTable)
        .set({ base_currency: baseCurrency })
        .where(eq(userOnboardingTable.user_id, userId));

      await tx.update(accountsTable)
        .set({ currency: baseCurrency })
        .where(eq(accountsTable.user_id, userId));
    });

    revalidateDomains('settings', 'accounts', 'transactions', 'budgets');
    return { success: true };
  } catch {
    return { error: 'Failed to update currency.' };
  }
}

/**
 * Delete all user data for GDPR compliance (Right to Erasure / Article 17).
 *
 * Deletion order respects foreign key constraints:
 * 1. Child records first (payments, splits, sales, etc.)
 * 2. Then parent records (debts, holdings, accounts, etc.)
 * 3. Finally user-level records (onboarding, connections, auth)
 */
export async function deleteAccount(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const userId = user.id;

  await db.transaction(async (tx) => {
    // Gather IDs inside the transaction to prevent concurrent inserts from being missed
    const userAccounts = await tx.select({ id: accountsTable.id })
      .from(accountsTable)
      .where(eq(accountsTable.user_id, userId));
    const accountIds = userAccounts.map(a => a.id);

    const userDebts = await tx.select({ id: debtsTable.id })
      .from(debtsTable)
      .where(eq(debtsTable.user_id, userId));
    const debtIds = userDebts.map(d => d.id);

    const userHoldings = await tx.select({ id: manualHoldingsTable.id })
      .from(manualHoldingsTable)
      .where(eq(manualHoldingsTable.user_id, userId));
    const holdingIds = userHoldings.map(h => h.id);

    // --- Leaf records (no children) ---

    // Debt payments (child of debts)
    if (debtIds.length > 0) {
      await tx.delete(debtPaymentsTable).where(inArray(debtPaymentsTable.debt_id, debtIds));
    }

    // Transaction splits (child of transactions) — cascade handles this, but be explicit
    if (accountIds.length > 0) {
      const txns = await tx.select({ id: transactionsTable.id })
        .from(transactionsTable)
        .where(inArray(transactionsTable.account_id, accountIds));
      const txnIds = txns.map(t => t.id);
      if (txnIds.length > 0) {
        await tx.delete(transactionSplitsTable).where(inArray(transactionSplitsTable.transaction_id, txnIds));
      }
    }

    // Holding sales (child of manual_holdings)
    if (holdingIds.length > 0) {
      await tx.delete(holdingSalesTable).where(inArray(holdingSalesTable.holding_id, holdingIds));
    }

    // --- Shared access (both as owner and recipient) ---
    await tx.delete(sharedAccessTable)
      .where(or(eq(sharedAccessTable.owner_id, userId), eq(sharedAccessTable.shared_with_id, userId)));

    // --- User-level records ---
    await tx.delete(netWorthSnapshotsTable).where(eq(netWorthSnapshotsTable.user_id, userId));
    await tx.delete(budgetNotificationsTable).where(eq(budgetNotificationsTable.user_id, userId));
    await tx.delete(budgetAlertPreferencesTable).where(eq(budgetAlertPreferencesTable.user_id, userId));
    await tx.delete(subscriptionsTable).where(eq(subscriptionsTable.user_id, userId));
    await tx.delete(goalsTable).where(eq(goalsTable.user_id, userId));
    await tx.delete(categorisationRulesTable).where(eq(categorisationRulesTable.user_id, userId));
    await tx.delete(merchantMappingsTable).where(eq(merchantMappingsTable.user_id, userId));
    await tx.delete(investmentGroupsTable).where(eq(investmentGroupsTable.user_id, userId));
    await tx.delete(manualHoldingsTable).where(eq(manualHoldingsTable.user_id, userId));
    await tx.delete(brokerConnectionsTable).where(eq(brokerConnectionsTable.user_id, userId));
    await tx.delete(zakatCalculationsTable).where(eq(zakatCalculationsTable.user_id, userId));
    await tx.delete(zakatSettingsTable).where(eq(zakatSettingsTable.user_id, userId));
    await tx.delete(debtsTable).where(eq(debtsTable.user_id, userId));
    await tx.delete(retirementProfilesTable).where(eq(retirementProfilesTable.user_id, userId));
    await tx.delete(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, userId));
    await tx.delete(userKeysTable).where(eq(userKeysTable.user_id, userId));

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

    // --- Retirement, dashboard layouts, and preferences ---
    await tx.delete(retirementProfilesTable).where(eq(retirementProfilesTable.user_id, userId));
    await tx.delete(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, userId));
    await tx.delete(userPreferencesTable).where(eq(userPreferencesTable.user_id, userId));
    await tx.delete(userOnboardingTable).where(eq(userOnboardingTable.user_id, userId));

    // --- Encryption keys (must be last, after all encrypted data is deleted) ---
    await tx.delete(userKeysTable).where(eq(userKeysTable.user_id, userId));
  });

  // Delete the Supabase auth user account itself using admin client
  // This removes the user from auth.users, completing the GDPR erasure
  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      // Fall back to signOut if admin deletion fails
      await supabase.auth.signOut();
      return { error: `Data deleted but auth account removal failed: ${authError.message}. Please contact support to complete account deletion.` };
    }
  } catch {
    // If admin client creation fails (e.g., missing service role key), sign out and warn
    await supabase.auth.signOut();
    return { error: 'Data deleted but auth account removal could not be completed. Please contact support to finalize account deletion.' };
  }

  return { success: true };
}

export async function exportUserData(): Promise<ExportData> {
  const userId = await getCurrentUserId();
  const userKey = await getUserKey(userId);

  const accounts = await db.select().from(accountsTable).where(eq(accountsTable.user_id, userId));
  const accountIds = accounts.map(a => a.id);

  const transactionsRaw = accountIds.length > 0
    ? await db.select().from(transactionsTable).where(inArray(transactionsTable.account_id, accountIds))
    : [];
  const transactionIds = transactionsRaw.map(t => t.id);

  const debtRows = await db.select().from(debtsTable).where(eq(debtsTable.user_id, userId));
  const debtIds = debtRows.map(d => d.id);

  const holdingRows = await db.select().from(manualHoldingsTable).where(eq(manualHoldingsTable.user_id, userId));
  const holdingIds = holdingRows.map(h => h.id);

  const budgetRows = await db.select().from(budgetsTable).where(eq(budgetsTable.user_id, userId));
  const budgetIds = budgetRows.map(b => b.id);

  const [
    categories,
    goals,
    subscriptions,
    categorisationRules,
    investmentGroups,
    netWorthSnapshots,
    transactionSplits,
    debtPayments,
    holdingSales,
    budgetAlertPreferences,
    zakatSettingsRows,
    zakatCalculationsRows,
    retirementProfileRows,
    dashboardLayoutRows,
  ] = await Promise.all([
    db.select().from(categoriesTable).where(eq(categoriesTable.user_id, userId)),
    db.select().from(goalsTable).where(eq(goalsTable.user_id, userId)),
    db.select().from(subscriptionsTable).where(eq(subscriptionsTable.user_id, userId)),
    db.select().from(categorisationRulesTable).where(eq(categorisationRulesTable.user_id, userId)),
    db.select().from(investmentGroupsTable).where(eq(investmentGroupsTable.user_id, userId)),
    db.select().from(netWorthSnapshotsTable).where(eq(netWorthSnapshotsTable.user_id, userId)),
    transactionIds.length > 0
      ? db.select().from(transactionSplitsTable).where(inArray(transactionSplitsTable.transaction_id, transactionIds))
      : Promise.resolve([]),
    debtIds.length > 0
      ? db.select().from(debtPaymentsTable).where(inArray(debtPaymentsTable.debt_id, debtIds))
      : Promise.resolve([]),
    holdingIds.length > 0
      ? db.select().from(holdingSalesTable).where(inArray(holdingSalesTable.holding_id, holdingIds))
      : Promise.resolve([]),
    budgetIds.length > 0
      ? db.select().from(budgetAlertPreferencesTable).where(inArray(budgetAlertPreferencesTable.budget_id, budgetIds))
      : Promise.resolve([]),
    db.select().from(zakatSettingsTable).where(eq(zakatSettingsTable.user_id, userId)),
    db.select().from(zakatCalculationsTable).where(eq(zakatCalculationsTable.user_id, userId)),
    db.select().from(retirementProfilesTable).where(eq(retirementProfilesTable.user_id, userId)),
    db.select().from(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, userId)),
  ]);

  // Decrypt encrypted fields so user receives readable data
  const decryptedAccounts = accounts.map(a => ({
    ...a,
    name: a.name ? decryptForUser(a.name, userKey) : a.name,
  }));
  const decryptedTransactions = transactionsRaw.map(t => ({
    ...t,
    description: t.description ? decryptForUser(t.description, userKey) : t.description,
  }));
  const decryptedSplits = transactionSplits.map(s => ({
    ...s,
    description: s.description ? decryptForUser(s.description, userKey) : s.description,
  }));

  return {
    version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    accounts: decryptedAccounts,
    categories,
    transactions: decryptedTransactions,
    transactionSplits: decryptedSplits,
    budgets: budgetRows,
    budgetAlertPreferences,
    goals,
    debts: debtRows,
    debtPayments,
    investmentGroups,
    manualHoldings: holdingRows,
    holdingSales,
    subscriptions,
    netWorthSnapshots,
    categorisationRules,
    zakatSettings: zakatSettingsRows,
    zakatCalculations: zakatCalculationsRows,
    retirementProfile: retirementProfileRows[0] ?? null,
    dashboardLayouts: dashboardLayoutRows,
  };
}
