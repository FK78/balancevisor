import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getDebtAdvisorData } from "@/lib/debt-advisor-data";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.debtAdvisor.consume(`debt-advisor:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before generating new advice." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "debt_advisor_requested" });

  const data = await getDebtAdvisorData(userId);

  if (!data.hasDebts) {
    return new Response(
      JSON.stringify({ advice: "No active debts found. You're debt free!" }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a personal debt strategist. You have the user's full debt data and financial context below. Provide concise, actionable debt payoff advice.

Write your response as a few short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Open with a brief overview of the user's debt situation — total owed, monthly burden, and how it relates to their income. Then recommend either the avalanche (highest interest first) or snowball (smallest balance first) method with a clear rationale, including the recommended payoff order. Follow with specific monthly payment allocations — how much to each debt, where to direct extra money, and how much free cash flow they could redirect. Then highlight the debts where extra payments would save the most interest, with quantified potential savings. End with 2-3 immediate steps they can take this week to accelerate payoff.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Be data-driven — reference specific debt names, balances, rates, and payments
- Be empathetic and encouraging, not judgemental
- Prioritise high-interest debt elimination
- Consider the user's available cash flow (savings minus minimums)
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 400 words
- Do NOT use generic advice — tailor everything to these specific debts

${data.context}`,
    prompt: "Analyse my debts and provide a personalised payoff strategy.",
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
