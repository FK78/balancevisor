/**
 * Row Level Security database helpers.
 *
 * Provides `withRLS(userId, fn)` which sets the Postgres session variable
 * `app.current_user_id` inside a transaction so RLS policies filter rows
 * automatically.
 *
 * Also exports `adminDb` — a privileged connection that bypasses RLS
 * for cron jobs, migrations, and admin operations.
 */

import { db, adminDb } from '@/index';
import { sql } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';

export type RLSCallback<T> = (tx: PostgresJsDatabase) => Promise<T>;

/**
 * Execute a callback within a transaction that has RLS scoped to `userId`.
 *
 * Sets `SET LOCAL app.current_user_id = <userId>` which is automatically
 * reset when the transaction commits or rolls back.
 *
 * @example
 * ```ts
 * const accounts = await withRLS(userId, async (tx) => {
 *   return tx.select().from(accountsTable);
 *   // RLS ensures only this user's rows are returned
 * });
 * ```
 */
export async function withRLS<T>(
  userId: string,
  fn: RLSCallback<T>,
): Promise<T> {
  return db.transaction(async (tx) => {
    // SET LOCAL is transaction-scoped — automatically cleared on COMMIT/ROLLBACK
    await tx.execute(
      sql`SELECT set_config('app.current_user_id', ${userId}, true)`,
    );
    return fn(tx as unknown as PostgresJsDatabase);
  });
}

// Re-export adminDb for convenience
export { adminDb };
