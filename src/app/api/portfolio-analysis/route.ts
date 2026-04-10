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

Write your response as a few short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Open with a 2-3 sentence overview of the portfolio's current state — total value, number of holdings, and overall performance. Then assess diversification: concentration risk, sector/type spread, and geographic exposure where identifiable from tickers. Follow with the best and worst performing holdings with brief commentary on each. Then flag any concerning patterns — overweight positions (>20% of portfolio), high-loss holdings, or lack of diversification. End with 3-5 specific, actionable suggestions to improve the portfolio.

Rules:
- Use the user's currency (${snapshot.baseCurrency}) when referencing amounts
- Be data-driven — reference specific holdings, percentages, and values
- Be encouraging but honest about risks
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 400 words
- Do NOT use generic advice — tailor everything to this specific portfolio

${portfolioContext}`,
      prompt: "Analyse my investment portfolio and provide personalised insights.",
      maxOutputTokens: 1024,
    };
  },
});
