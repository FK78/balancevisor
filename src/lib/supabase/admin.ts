import { createClient as createSupabaseClient } from "@supabase/supabase-js";
import { env } from "@/lib/env";

/**
 * Creates a Supabase admin client using the service role key.
 *
 * This client bypasses Row Level Security (RLS) policies and has
 * full access to the database and auth admin APIs.
 *
 * WARNING: Only use this in server-side code (Server Actions, API routes).
 * Never expose the service role key to the client.
 */
export function createAdminClient() {
  const { NEXT_PUBLIC_SUPABASE_URL: url, SUPABASE_SERVICE_ROLE_KEY: serviceKey } = env();

  if (!url || !serviceKey) {
    throw new Error(
      "Supabase admin client requires NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables."
    );
  }

  return createSupabaseClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
