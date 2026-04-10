import { cache } from "react";
import { createClient } from "@/lib/supabase/server";
import { withRLS, type RLSCallback } from "@/lib/rls-db";

/**
 * Request-scoped cached Supabase user fetch.
 * Deduplicates the 2-3 getUser() calls per server render into one.
 */
const getCurrentUser = cache(async () => {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  return user;
});

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("User not authenticated");
  }
  return user.id;
}

export async function getCurrentUserEmail(): Promise<string> {
  const user = await getCurrentUser();
  if (!user?.email) throw new Error("User email not available");
  return user.email;
}

/**
 * Run a database operation with RLS scoped to the current authenticated user.
 *
 * Sets `app.current_user_id` in the Postgres session so RLS policies
 * automatically filter rows. The session variable is transaction-scoped
 * and cleared on commit/rollback.
 *
 * @example
 * ```ts
 * const accounts = await withAuthRLS(async (tx) => {
 *   return tx.select().from(accountsTable);
 * });
 * ```
 */
export async function withAuthRLS<T>(fn: RLSCallback<T>): Promise<T> {
  const userId = await getCurrentUserId();
  return withRLS(userId, fn);
}
