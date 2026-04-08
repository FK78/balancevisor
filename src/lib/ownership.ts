/**
 * Reusable ownership verification for server mutations.
 *
 * Eliminates the repeated 5-line "select user_id, compare, throw" pattern
 * across every edit/delete mutation. All mutations should use this instead
 * of hand-rolling ownership checks.
 */

import { getUserDb } from "@/db/rls-context";
import { eq } from "drizzle-orm";
import { UnauthorizedError } from "@/lib/errors";
import type { PgTable, PgColumn } from "drizzle-orm/pg-core";

type OwnedTable = PgTable & {
  id: PgColumn;
  user_id: PgColumn;
};

/**
 * Verify that a row in `table` with the given `id` belongs to `userId`.
 * Throws `UnauthorizedError` if not found or ownership doesn't match.
 *
 * @param table   - Drizzle table reference (must have `id` and `user_id` columns)
 * @param id      - Row primary key
 * @param userId  - Expected owner
 * @param label   - Human-readable resource name for the error message (e.g. "account")
 */
export async function requireOwnership(
  table: OwnedTable,
  id: string,
  userId: string,
  label: string,
): Promise<void> {
  const userDb = await getUserDb(userId);
  const [row] = await userDb
    .select({ user_id: table.user_id })
    .from(table)
    .where(eq(table.id, id));

  if (!row || row.user_id !== userId) {
    throw new UnauthorizedError(label);
  }
}
