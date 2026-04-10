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

Write your response as a few short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Start with a brief overview of their bill situation, highlighting any bills flagged as likely switchable or with recent price increases. Then cover switching opportunities for energy, broadband, mobile, insurance, or TV — what to switch, realistic savings estimates, and tips like checking contract end dates or using comparison sites (Uswitch, CompareTheMarket, MoneySupermarket). Follow with negotiation tactics for bills that don't need switching but could be renegotiated — calling retention departments, loyalty discounts, haggle scripts. Then list 3-4 quick-win actions for this week in priority order with estimated savings. End with a brief annual savings estimate across all recommended changes.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Reference specific bill names and costs from the data
- Base suggestions on realistic UK market rates and switching savings
- Be practical — don't recommend switching if the bill is already competitive
- If a bill recently increased, make that a priority
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 400 words

${data.context}`,
    prompt: "Analyse my bills and suggest switching or negotiation opportunities to save money.",
    maxOutputTokens: 1200,
  });

  return result.toTextStreamResponse();
}
