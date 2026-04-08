import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { getDebtAdvisorData } from "@/lib/debt-advisor-data";
import { getCachedAdvice, setCachedAdvice, invalidateCachedAdvice } from "@/lib/debt-advisor-cache";
import { rateLimiters } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const rateLimitResult = rateLimiters.debtAdvisor.consume(`debt-advisor:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before generating new advice." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const forceRefresh = body?.refresh === true;

  if (!forceRefresh) {
    const cached = getCachedAdvice(userId);
    if (cached) {
      return new Response(JSON.stringify({ advice: cached, cached: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    invalidateCachedAdvice(userId);
  }

  const data = await getDebtAdvisorData(userId);

  if (!data.hasDebts) {
    return new Response(
      JSON.stringify({ advice: "No active debts found. You're debt free!", cached: false }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a personal debt strategist. You have the user's full debt data and financial context below. Provide concise, actionable debt payoff advice.

Structure your response with these exact markdown sections:

## Debt Snapshot
A 2-3 sentence overview of the user's current debt situation — total owed, monthly burden, and how it relates to their income.

## Recommended Payoff Strategy
Recommend either the avalanche (highest interest first) or snowball (smallest balance first) method with a clear rationale for this specific user. Show the recommended payoff order.

## Monthly Action Plan
Specific monthly payment allocations: how much to each debt, where to direct extra money, and how much free cash flow they could redirect.

## Interest Savings Opportunities
Identify debts where extra payments would save the most interest. Quantify the potential savings where possible.

## Quick Wins
2-3 immediate, actionable steps the user can take this week to accelerate their debt payoff.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Be data-driven — reference specific debt names, balances, rates, and payments
- Be empathetic and encouraging, not judgemental
- Prioritise high-interest debt elimination
- Consider the user's available cash flow (savings minus minimums)
- Keep the total response under 600 words
- Do NOT use generic advice — tailor everything to these specific debts

${data.context}`,
    prompt: "Analyse my debts and provide a personalised payoff strategy.",
    maxOutputTokens: 1024,
    onFinish: ({ text }) => {
      if (text) {
        setCachedAdvice(userId, text);
      }
    },
  });

  return result.toTextStreamResponse();
}
