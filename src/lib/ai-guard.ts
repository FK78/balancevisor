import { getCurrentUserId } from "@/lib/auth";
import { isAiEnabled } from "@/db/queries/preferences";

/**
 * Checks whether AI features are enabled for the current user.
 * Returns a 403 Response if disabled, or null if enabled.
 * Usage in API routes:
 *   const blocked = await guardAiEnabled();
 *   if (blocked) return blocked;
 */
export async function guardAiEnabled(): Promise<Response | null> {
  const userId = await getCurrentUserId();
  const enabled = await isAiEnabled(userId);

  if (!enabled) {
    return new Response(
      JSON.stringify({ error: "AI features are disabled. Enable them in Settings." }),
      { status: 403, headers: { "Content-Type": "application/json" } },
    );
  }

  return null;
}
