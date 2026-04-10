import { getCurrentUserId } from "@/lib/auth";
import { isAiEnabled } from "@/db/queries/preferences";
import { env } from "@/lib/env";

/**
 * Checks whether AI features are enabled for the current user
 * AND that the server has a valid GROQ_API_KEY configured.
 * Returns a 403/503 Response if blocked, or null if everything is OK.
 * Usage in API routes:
 *   const blocked = await guardAiEnabled();
 *   if (blocked) return blocked;
 */
export async function guardAiEnabled(): Promise<Response | null> {
  if (!env().GROQ_API_KEY) {
    return new Response(
      JSON.stringify({ error: "AI is temporarily unavailable — API key not configured." }),
      { status: 503, headers: { "Content-Type": "application/json" } },
    );
  }

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
