/**
 * CLI: delete a user and all their data.
 *
 * Usage: npm run db:delete-user <user_id>
 */
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
import { eq, inArray } from 'drizzle-orm';

async function run() {
  const userId = process.argv[2];
  if (!userId) {
    console.error('Usage: npm run db:delete-user <user_id>');
    process.exit(1);
  }

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
    await tx.delete(userKeysTable).where(eq(userKeysTable.user_id, userId));
  });

  console.log(`Deleted all data for user ${userId}`);
  process.exit(0);
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
