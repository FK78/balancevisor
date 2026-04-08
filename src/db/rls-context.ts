import { db } from '@/index';
import { sql } from 'drizzle-orm';

export type UserDb = typeof db;

/**
 * Sets the RLS user context on the shared connection and returns the db instance.
 * Must be called at the start of each server action / API route.
 *
 * Uses set_config with `false` (session-wide) for simple reads.
 * For mutations that need atomicity, use withUserTransaction() instead.
 */
export async function getUserDb(userId: string): Promise<UserDb> {
  await db.execute(sql`SELECT set_config('app.user_id', ${userId}, false)`);
  return db;
}

/**
 * Wraps a callback in a Postgres transaction with RLS user context set.
 * Uses set_config with `true` (local to transaction) so the context is
 * automatically cleared when the transaction ends.
 */
export async function withUserTransaction<T>(
  userId: string,
  fn: (tx: Parameters<Parameters<typeof db.transaction>[0]>[0]) => Promise<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    await tx.execute(sql`SELECT set_config('app.user_id', ${userId}, true)`);
    return fn(tx);
  });
}

/**
 * Admin database instance — bypasses RLS.
 * Use only for: migrations, seed scripts, health checks, master key rotation,
 * and GDPR account deletion.
 */
export { db as adminDb };
