import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getSubscriptionAdvisorData } from "@/lib/subscription-advisor-data";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST() {
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

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "subscription_advisor_requested" });

  const data = await getSubscriptionAdvisorData(userId);

  if (!data.hasSubscriptions) {
    return new Response(
      JSON.stringify({ advice: "No active subscriptions found. Add subscriptions to get savings advice." }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a subscription savings specialist. Analyse the user's subscriptions and find ways to save money.

Write your response as a few short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Start with a brief overview of total subscription cost, what share of expenses it represents, and whether it seems reasonable. Then note any overlapping or redundant subscriptions (e.g. multiple streaming or cloud storage services) and which to consider dropping. Mention the most expensive subscriptions and whether they look high-value or worth reviewing — yearly billing commitments especially. Follow with specific savings recommendations: what to cancel, downgrade, or switch billing cycle on, with estimated savings. End with 2-3 quick actions for this week.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Reference specific subscription names and costs
- Be practical and empathetic — don't suggest cancelling everything
- Quantify savings wherever possible
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 300 words

${data.context}`,
    prompt: "Analyse my subscriptions and suggest ways to save money.",
    maxOutputTokens: 1024,
  });

  return result.toTextStreamResponse();
}
