import { cache } from "react";
import { headers } from "next/headers";
import { createClient } from "@/lib/supabase/server";
import {
  getMockAuthIdentity,
  hasMockAuthHeader,
  isMockAuthEnabled,
  MOCK_AUTH_HEADER,
} from "@/lib/mock-auth";
import { withRLS, type RLSCallback } from "@/lib/rls-db";

export interface CurrentUserIdentity {
  readonly id: string;
  readonly email: string;
  readonly displayName: string;
  readonly fullName: string;
}

function readString(value: unknown) {
  return typeof value === "string" ? value : "";
}

export const isCurrentRequestMockAuthEnabled = cache(async () => {
  if (isMockAuthEnabled()) {
    return true;
  }

  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    try {
      const requestHeaders = await headers();
      return hasMockAuthHeader(requestHeaders.get(MOCK_AUTH_HEADER));
    } catch {
      return false;
    }
  }

  return false;
});

/**
 * Request-scoped cached current user lookup.
 * In mock mode we short-circuit to a seeded development identity so
 * pages and tests do not depend on a live Supabase session.
 */
export const getCurrentUserIdentity = cache(async (): Promise<CurrentUserIdentity | null> => {
  if (await isCurrentRequestMockAuthEnabled()) {
    return getMockAuthIdentity();
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return {
    id: user.id,
    email: user.email ?? "",
    displayName: readString(user.user_metadata?.display_name),
    fullName: readString(user.user_metadata?.full_name),
  };
});

export async function getCurrentUserId(): Promise<string> {
  const user = await getCurrentUserIdentity();
  if (!user?.id) {
    throw new Error("User not authenticated");
  }
  return user.id;
}

export async function getCurrentUserEmail(): Promise<string> {
  const user = await getCurrentUserIdentity();
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
