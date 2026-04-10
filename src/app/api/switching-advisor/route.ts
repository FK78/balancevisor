import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getSwitchingAdvisorData } from "@/lib/switching-advisor-data";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.switchingAdvisor.consume(`switching-advisor:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "switching_advisor_requested" });

  const data = await getSwitchingAdvisorData(userId);

  if (!data.hasBills) {
    return new Response(
      JSON.stringify({ advice: "No active bills or subscriptions found. Add them to get switching advice." }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a UK-focused bill switching specialist. Analyse the user's household bills and subscriptions to find switching and negotiation opportunities.

Structure your response with these exact markdown sections:

## Bill Health Summary
A 2-3 sentence overview of their bill situation. Highlight any bills marked as "likely switchable" or flagged as having recent price increases.

## Switching Opportunities
For each switchable bill (energy, broadband, mobile, insurance, TV), suggest:
- Whether they should switch provider
- What kind of savings to expect (use realistic UK market averages)
- Any tips for the switching process (e.g. check contract end dates, use comparison sites)

## Negotiation Tactics
Bills that may not need switching but could be renegotiated:
- Calling retention departments
- Asking for loyalty discounts
- Threatening to leave (haggle scripts)

## Quick Wins
3-4 specific actions they can take this week, in priority order:
- Easiest savings first
- Include estimated savings per action where possible

## Annual Savings Estimate
A summary table of potential total annual savings broken down by bill.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Reference specific bill names and costs from the data
- Base suggestions on realistic UK market rates and switching savings
- Be practical — don't recommend switching if the bill is already competitive
- If a bill recently increased, make that a priority
- Mention specific comparison sites (Uswitch, CompareTheMarket, MoneySupermarket) where relevant
- Keep the total response under 600 words

${data.context}`,
    prompt: "Analyse my bills and suggest switching or negotiation opportunities to save money.",
    maxOutputTokens: 1200,
  });

  return result.toTextStreamResponse();
}
