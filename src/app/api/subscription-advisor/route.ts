import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getSubscriptionAdvisorData } from "@/lib/subscription-advisor-data";
import { getCachedSubscriptionAdvice, setCachedSubscriptionAdvice, invalidateCachedSubscriptionAdvice } from "@/lib/subscription-advisor-cache";
import { rateLimiters } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.subscriptionAdvisor.consume(`subscription-advisor:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const forceRefresh = body?.refresh === true;

  if (!forceRefresh) {
    const cached = getCachedSubscriptionAdvice(userId);
    if (cached) {
      return new Response(JSON.stringify({ advice: cached, cached: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    invalidateCachedSubscriptionAdvice(userId);
  }

  const data = await getSubscriptionAdvisorData(userId);

  if (!data.hasSubscriptions) {
    return new Response(
      JSON.stringify({ advice: "No active subscriptions found. Add subscriptions to get savings advice.", cached: false }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a subscription savings specialist. Analyse the user's subscriptions and find ways to save money.

Structure your response with these exact markdown sections:

## Subscription Summary
A 2-3 sentence overview: total cost, what percentage of expenses they represent, and whether this is reasonable.

## Overlap & Redundancy Check
Identify any categories with multiple subscriptions that may overlap (e.g. multiple streaming services, cloud storage, music). Suggest which to keep and which to consider dropping.

## Cost-to-Value Assessment
Flag the most expensive subscriptions and assess whether they seem high-value or worth reviewing. Consider the billing cycle — yearly subs represent a bigger commitment.

## Savings Opportunities
Specific, actionable recommendations:
- Subscriptions to cancel or downgrade
- Subscriptions that could switch billing cycle for savings (e.g. monthly → yearly)
- Estimated total monthly/yearly savings if recommendations are followed

## Quick Actions
2-3 things the user can do this week to start saving.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Reference specific subscription names and costs
- Be practical and empathetic — don't suggest cancelling everything
- Quantify savings wherever possible
- Keep the total response under 500 words

${data.context}`,
    prompt: "Analyse my subscriptions and suggest ways to save money.",
    maxOutputTokens: 1024,
    onFinish: ({ text }) => {
      if (text) {
        setCachedSubscriptionAdvice(userId, text);
      }
    },
  });

  return result.toTextStreamResponse();
}
