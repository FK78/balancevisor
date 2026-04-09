import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getWeeklyDigestData } from "@/lib/weekly-digest-data";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.weeklyDigest.consume(`weekly-digest:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "weekly_digest_requested" });

  const data = await getWeeklyDigestData(userId);

  if (!data.hasData) {
    return new Response(
      JSON.stringify({ digest: "No transactions recorded in the last 7 days.", cached: false }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a personal finance assistant. Generate a brief, conversational weekly spending digest for the user.

Write exactly 3-4 short sentences covering:
1. Total spending this week and how it compares to last week
2. The top 1-2 spending categories that stood out
3. One notable large transaction if there is one
4. A single practical, actionable tip based on the data

Rules:
- Use the user's currency (${data.baseCurrency}) for all amounts
- Be conversational and warm, not robotic
- Reference specific categories and amounts from the data
- Keep the ENTIRE response under 100 words — brevity is key
- Do NOT use markdown headings or bullet points — write in flowing prose
- Do NOT use generic advice — be specific to this week's data

${data.context}`,
    prompt: "Write my weekly spending digest.",
    maxOutputTokens: 256,
  });

  return result.toTextStreamResponse();
}
