import { db } from '@/index';
import { netWorthSnapshotsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';

export async function getNetWorthHistory(userId: string, limit = 90) {
  return await db
    .select({
      date: netWorthSnapshotsTable.date,
      net_worth: netWorthSnapshotsTable.net_worth,
      total_assets: netWorthSnapshotsTable.total_assets,
      total_liabilities: netWorthSnapshotsTable.total_liabilities,
      investment_value: netWorthSnapshotsTable.investment_value,
    })
    .from(netWorthSnapshotsTable)
    .where(eq(netWorthSnapshotsTable.user_id, userId))
    .orderBy(desc(netWorthSnapshotsTable.date))
    .limit(limit)
    .then((rows) => rows.reverse());
}

export type NetWorthPoint = Awaited<ReturnType<typeof getNetWorthHistory>>[number];

export async function hasSnapshotForDate(userId: string, date: string): Promise<boolean> {
  const [row] = await db
    .select({ id: netWorthSnapshotsTable.id })
    .from(netWorthSnapshotsTable)
    .where(
      and(
        eq(netWorthSnapshotsTable.user_id, userId),
        eq(netWorthSnapshotsTable.date, date)
      )
    )
    .limit(1);
  return !!row;
}
