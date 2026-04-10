/**
 * Shared middleware for AI streaming routes.
 *
 * Handles: auth → AI guard → rate limiting → PostHog capture → context building → streaming.
 *
 * Usage:
 *   export const POST = withAiRoute({
 *     limiter: rateLimiters.savingsTips,
 *     event: "savings_tips_requested",
 *     buildContext: async (userId) => ({ system: "...", prompt: "...", maxOutputTokens: 384 }),
 *   });
 */

import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import type { RateLimiter } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export type AiRouteContext = {
  system: string;
  prompt: string;
  maxOutputTokens?: number;
};

export type AiRouteConfig = {
  limiter: RateLimiter;
  event: string;
  buildContext: (userId: string, req: Request) => Promise<AiRouteContext | Response>;
};

export function withAiRoute(config: AiRouteConfig) {
  return async function POST(req: Request): Promise<Response> {
    const userId = await getCurrentUserId();

    const aiBlocked = await guardAiEnabled();
    if (aiBlocked) return aiBlocked;

    const rateLimitResult = config.limiter.consume(`${config.event}:${userId}`);
    if (!rateLimitResult.allowed) {
      return new Response(
        JSON.stringify({ error: "Too many requests. Please wait before trying again." }),
        {
          status: 429,
          headers: {
            "Content-Type": "application/json",
            "Retry-After": String(rateLimitResult.retryAfter),
          },
        },
      );
    }

    const posthog = getPostHogClient();
    posthog.capture({ distinctId: userId, event: config.event });

    const contextOrResponse = await config.buildContext(userId, req);

    // Allow buildContext to return an early Response (e.g. "not enough data")
    if (contextOrResponse instanceof Response) {
      return contextOrResponse;
    }

    const { system, prompt, maxOutputTokens } = contextOrResponse;

    const result = streamText({
      model: groq("llama-3.3-70b-versatile"),
      system,
      prompt,
      maxOutputTokens: maxOutputTokens ?? 512,
    });

    return result.toTextStreamResponse();
  };
}
