import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getAccountHealthData } from "@/lib/account-health-data";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.accountHealth.consume(`account-health:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "account_health_requested" });

  const data = await getAccountHealthData(userId);

  if (!data.hasAccounts) {
    return new Response(
      JSON.stringify({ advice: "No accounts found. Add an account to get a health check." }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, an account health analyst. Review the user's accounts and provide a concise health assessment.

Write your response as a few short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Open with a 2-3 sentence summary of the account structure — balance distribution, number of accounts, and overall health. Then briefly assess each account's status inline, noting any that are healthy, need attention (low balance, dormant), or are concerning (overdrawn). Follow with 2-3 specific, actionable suggestions: emergency fund adequacy, account consolidation opportunities, dormant accounts to close, or rebalancing between account types.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Reference specific account names and balances
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 250 words

${data.context}`,
    prompt: "Assess the health of my accounts and suggest improvements.",
    maxOutputTokens: 768,
  });

  return result.toTextStreamResponse();
}
