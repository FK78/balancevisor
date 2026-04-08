import { getUserDb } from '@/db/rls-context';
import { netWorthSnapshotsTable } from '@/db/schema';
import { eq, and, desc } from 'drizzle-orm';
import { getCached, setCached, cacheKey } from '@/lib/cache';

export type NetWorthHistoryResult = Array<{
  date: string;
  net_worth: number;
  total_assets: number;
  total_liabilities: number;
  investment_value: number;
}>;

export async function getNetWorthHistory(userId: string, limit = 90): Promise<NetWorthHistoryResult> {
  const key = cacheKey('net-worth-history', userId, limit);
  const cached = getCached<NetWorthHistoryResult>(key);
  if (cached) {
    return cached;
  }

  const userDb = await getUserDb(userId);
  const result = await userDb
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

  setCached(key, result);
  return result;
}

export type NetWorthPoint = NetWorthHistoryResult[number];

export async function hasSnapshotForDate(userId: string, date: string): Promise<boolean> {
  const userDb = await getUserDb(userId);
  const [row] = await userDb
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
