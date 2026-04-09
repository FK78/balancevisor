import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getAccountHealthData } from "@/lib/account-health-data";
import { getCachedAccountHealth, setCachedAccountHealth, invalidateCachedAccountHealth } from "@/lib/account-health-cache";
import { rateLimiters } from "@/lib/rate-limiter";

export async function POST(req: Request) {
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

  const body = await req.json().catch(() => ({}));
  const forceRefresh = body?.refresh === true;

  if (!forceRefresh) {
    const cached = getCachedAccountHealth(userId);
    if (cached) {
      return new Response(JSON.stringify({ advice: cached, cached: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    invalidateCachedAccountHealth(userId);
  }

  const data = await getAccountHealthData(userId);

  if (!data.hasAccounts) {
    return new Response(
      JSON.stringify({ advice: "No accounts found. Add an account to get a health check.", cached: false }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, an account health analyst. Review the user's accounts and provide a concise health assessment.

Structure your response with these exact markdown sections:

## Overall Health
A 2-3 sentence summary of the account structure — balance distribution, number of accounts, and overall health.

## Account-by-Account Assessment
For each account, a one-line health status with an emoji indicator:
- ✅ for healthy
- ⚠️ for needs attention
- 🔴 for concerning
Include the reason (e.g. low balance, overdrawn, dormant).

## Recommendations
2-3 specific, actionable suggestions to improve account health. Consider:
- Emergency fund adequacy (3-6 months expenses in savings)
- Account consolidation if too many similar accounts
- Dormant accounts that could be closed
- Rebalancing between account types

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Reference specific account names and balances
- Be concise — each section should be 2-4 lines
- Keep the total response under 350 words

${data.context}`,
    prompt: "Assess the health of my accounts and suggest improvements.",
    maxOutputTokens: 768,
    onFinish: ({ text }) => {
      if (text) {
        setCachedAccountHealth(userId, text);
      }
    },
  });

  return result.toTextStreamResponse();
}
