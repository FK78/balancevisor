/**
 * Bearer token authentication for /api/v1/* routes.
 *
 * Mobile clients send `Authorization: Bearer <supabase-access-token>`.
 * This module verifies the token via Supabase's `auth.getUser()` using the
 * service-role admin client, returning the authenticated user identity.
 *
 * Also supports mock auth in development when MOCK_AUTH=true.
 */

import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";
import {
  isMockAuthEnabled,
  hasMockAuthHeader,
  getMockAuthIdentity,
  MOCK_AUTH_HEADER,
} from "@/lib/mock-auth";
import type { CurrentUserIdentity } from "@/lib/auth";

export type V1AuthResult =
  | { ok: true; user: CurrentUserIdentity }
  | { ok: false; status: number; message: string };

/**
 * Authenticate a request using Bearer token or mock auth.
 * Returns the user identity on success, or an error payload on failure.
 */
export async function authenticateV1Request(req: Request): Promise<V1AuthResult> {
  // Mock auth short-circuit
  if (isMockAuthEnabled()) {
    return { ok: true, user: getMockAuthIdentity() };
  }

  // Dev: allow mock auth via header
  if (process.env.NODE_ENV === "development" || process.env.NODE_ENV === "test") {
    if (hasMockAuthHeader(req.headers.get(MOCK_AUTH_HEADER))) {
      return { ok: true, user: getMockAuthIdentity() };
    }
  }

  // Extract Bearer token
  const authHeader = req.headers.get("authorization");
  if (!authHeader?.startsWith("Bearer ")) {
    return { ok: false, status: 401, message: "Missing or invalid Authorization header" };
  }

  const token = authHeader.slice(7).trim();
  if (!token) {
    return { ok: false, status: 401, message: "Empty bearer token" };
  }

  // Verify token with Supabase
  try {
    const { NEXT_PUBLIC_SUPABASE_URL: url, NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY: anonKey } = env();

    const supabase = createSupabaseClient(url, anonKey, {
      global: {
        headers: { Authorization: `Bearer ${token}` },
      },
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return { ok: false, status: 401, message: "Invalid or expired token" };
    }

    return {
      ok: true,
      user: {
        id: user.id,
        email: user.email ?? "",
        displayName: typeof user.user_metadata?.display_name === "string"
          ? user.user_metadata.display_name
          : "",
        fullName: typeof user.user_metadata?.full_name === "string"
          ? user.user_metadata.full_name
          : "",
      },
    };
  } catch {
    return { ok: false, status: 500, message: "Authentication service error" };
  }
}
