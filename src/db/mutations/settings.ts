'use server';

import { db } from '@/index';
import {
  accountsTable,
  manualHoldingsTable,
  brokerConnectionsTable,
  truelayerConnectionsTable,
  netWorthSnapshotsTable,
  userOnboardingTable,
  investmentGroupsTable,
  holdingSalesTable,
  userPreferencesTable,
  zakatSettingsTable,
  zakatCalculationsTable,
  otherAssetsTable,
  dashboardLayoutsTable,
  userKeysTable,
} from '@/db/schema';
import { EXPORT_VERSION } from '@/lib/types';
import type { ExportData } from '@/lib/types';
import { eq, inArray } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { decryptForUser, getUserKey } from '@/lib/encryption';
import { createClient } from '@/lib/supabase/server';
import { normalizeBaseCurrency } from '@/lib/currency';
import { z } from 'zod';
import { parseFormData, zRequiredString } from '@/lib/form-schema';

export async function updateDisplayName(formData: FormData) {
  const supabase = await createClient();
  const { display_name: displayName } = parseFormData(
    z.object({ display_name: zRequiredString(100) }),
    formData,
  );

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

    revalidateDomains('settings', 'accounts');
    return { success: true };
  } catch {
    return { error: 'Failed to update currency.' };
  }
}

/**
 * Delete all user data for GDPR compliance.
 */
export async function deleteAccount(): Promise<{ success?: boolean; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { error: 'Not authenticated.' };

  const userId = user.id;

  await db.transaction(async (tx) => {
    const userHoldings = await tx.select({ id: manualHoldingsTable.id })
      .from(manualHoldingsTable)
      .where(eq(manualHoldingsTable.user_id, userId));
    const holdingIds = userHoldings.map(h => h.id);

    if (holdingIds.length > 0) {
      await tx.delete(holdingSalesTable).where(inArray(holdingSalesTable.holding_id, holdingIds));
    }

    await tx.delete(netWorthSnapshotsTable).where(eq(netWorthSnapshotsTable.user_id, userId));
    await tx.delete(investmentGroupsTable).where(eq(investmentGroupsTable.user_id, userId));
    await tx.delete(manualHoldingsTable).where(eq(manualHoldingsTable.user_id, userId));
    await tx.delete(brokerConnectionsTable).where(eq(brokerConnectionsTable.user_id, userId));
    await tx.delete(zakatCalculationsTable).where(eq(zakatCalculationsTable.user_id, userId));
    await tx.delete(zakatSettingsTable).where(eq(zakatSettingsTable.user_id, userId));
    await tx.delete(otherAssetsTable).where(eq(otherAssetsTable.user_id, userId));

    await tx.delete(accountsTable).where(eq(accountsTable.user_id, userId));
    await tx.delete(truelayerConnectionsTable).where(eq(truelayerConnectionsTable.user_id, userId));

    await tx.delete(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, userId));
    await tx.delete(userPreferencesTable).where(eq(userPreferencesTable.user_id, userId));
    await tx.delete(userOnboardingTable).where(eq(userOnboardingTable.user_id, userId));

    // Encryption keys last
    await tx.delete(userKeysTable).where(eq(userKeysTable.user_id, userId));
  });

  try {
    const { createAdminClient } = await import('@/lib/supabase/admin');
    const adminClient = createAdminClient();
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId);

    if (authError) {
      await supabase.auth.signOut();
      return { error: `Data deleted but auth account removal failed: ${authError.message}. Please contact support to complete account deletion.` };
    }
  } catch {
    await supabase.auth.signOut();
    return { error: 'Data deleted but auth account removal could not be completed. Please contact support to finalize account deletion.' };
  }

  return { success: true };
}

export async function exportUserData(): Promise<ExportData> {
  const userId = await getCurrentUserId();
  const userKey = await getUserKey(userId);

  const accounts = await db.select().from(accountsTable).where(eq(accountsTable.user_id, userId));

  const holdingRows = await db.select().from(manualHoldingsTable).where(eq(manualHoldingsTable.user_id, userId));
  const holdingIds = holdingRows.map(h => h.id);

  const [
    investmentGroups,
    netWorthSnapshots,
    holdingSales,
    zakatSettingsRows,
    zakatCalculationsRows,
    otherAssets,
    dashboardLayoutRows,
  ] = await Promise.all([
    db.select().from(investmentGroupsTable).where(eq(investmentGroupsTable.user_id, userId)),
    db.select().from(netWorthSnapshotsTable).where(eq(netWorthSnapshotsTable.user_id, userId)),
    holdingIds.length > 0
      ? db.select().from(holdingSalesTable).where(inArray(holdingSalesTable.holding_id, holdingIds))
      : Promise.resolve([]),
    db.select().from(zakatSettingsTable).where(eq(zakatSettingsTable.user_id, userId)),
    db.select().from(zakatCalculationsTable).where(eq(zakatCalculationsTable.user_id, userId)),
    db.select().from(otherAssetsTable).where(eq(otherAssetsTable.user_id, userId)),
    db.select().from(dashboardLayoutsTable).where(eq(dashboardLayoutsTable.user_id, userId)),
  ]);

  const decryptedAccounts = accounts.map(a => ({
    ...a,
    name: a.name ? decryptForUser(a.name, userKey) : a.name,
  }));

  return {
    version: EXPORT_VERSION,
    exported_at: new Date().toISOString(),
    accounts: decryptedAccounts,
    investmentGroups,
    manualHoldings: holdingRows,
    holdingSales,
    netWorthSnapshots,
    zakatSettings: zakatSettingsRows,
    zakatCalculations: zakatCalculationsRows,
    otherAssets,
    dashboardLayouts: dashboardLayoutRows,
  };
}
