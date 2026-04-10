import { cache } from "react";
import { createClient } from "@/lib/supabase/server";

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
