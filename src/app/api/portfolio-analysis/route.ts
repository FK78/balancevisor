import { withAiRoute } from "@/lib/ai-route";
import { getPortfolioSnapshot, formatPortfolioContext } from "@/lib/portfolio-data";
import { rateLimiters } from "@/lib/rate-limiter";

export const POST = withAiRoute({
  limiter: rateLimiters.portfolioAnalysis,
  event: "portfolio_analysis_requested",
  buildContext: async (userId) => {
    const snapshot = await getPortfolioSnapshot(userId);

    if (snapshot.holdings.length === 0) {
      return new Response(
        JSON.stringify({ analysis: "No holdings found. Add investments to get AI analysis." }),
        { headers: { "Content-Type": "application/json" } },
      );
    }

    const portfolioContext = formatPortfolioContext(snapshot);

    return {
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
    };
  },
});
