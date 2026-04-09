import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getPortfolioSnapshot, formatPortfolioContext } from "@/lib/portfolio-data";
import { getCachedAnalysis, setCachedAnalysis, invalidateCachedAnalysis } from "@/lib/portfolio-analysis-cache";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.portfolioAnalysis.consume(`portfolio-analysis:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before re-analysing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const forceRefresh = body?.refresh === true;

  if (!forceRefresh) {
    const cached = getCachedAnalysis(userId);
    if (cached) {
      return new Response(JSON.stringify({ analysis: cached, cached: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    invalidateCachedAnalysis(userId);
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "portfolio_analysis_requested" });

  const snapshot = await getPortfolioSnapshot(userId);

  if (snapshot.holdings.length === 0) {
    return new Response(
      JSON.stringify({ analysis: "No holdings found. Add investments to get AI analysis.", cached: false }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const portfolioContext = formatPortfolioContext(snapshot);

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, an expert investment analyst. You have the user's full portfolio data below. Provide a concise, actionable portfolio analysis.

Structure your response with these exact markdown sections:
## Portfolio Summary
A 2-3 sentence overview of the portfolio's current state.

## Diversification Analysis
Assess concentration risk, sector/type spread, and geographic exposure where identifiable from tickers.

## Top Performers & Laggards
Highlight the best and worst performing holdings with brief commentary.

## Risk Assessment
Flag overweight positions (>20% of portfolio), high-loss holdings, and any concerning patterns.

## Actionable Recommendations
3-5 specific, actionable suggestions to improve the portfolio.

Rules:
- Use the user's currency (${snapshot.baseCurrency}) when referencing amounts
- Be data-driven — reference specific holdings, percentages, and values
- Be encouraging but honest about risks
- Keep the total response under 600 words
- Do NOT use generic advice — tailor everything to this specific portfolio

${portfolioContext}`,
    prompt: "Analyse my investment portfolio and provide personalised insights.",
    maxOutputTokens: 1024,
    onFinish: ({ text }) => {
      if (text) {
        setCachedAnalysis(userId, text);
      }
    },
  });

  return result.toTextStreamResponse();
}
