import { withAiRoute } from "@/lib/ai-route";
import { getMonthlyReportData, formatMonthlyReportContext } from "@/lib/monthly-report-data";
import { rateLimiters } from "@/lib/rate-limiter";
import { z } from "zod";

export const POST = withAiRoute({
  limiter: rateLimiters.monthlyReport,
  event: "monthly_report_generated",
  buildContext: async (userId, req) => {
    const bodySchema = z.object({ monthsAgo: z.number().int().min(0).max(11).default(1) });
    const raw = await req.json().catch(() => ({}));
    const { monthsAgo } = bodySchema.parse(raw);

    const data = await getMonthlyReportData(userId, monthsAgo);
    const context = formatMonthlyReportContext(data);

    return {
      system: `You are BalanceVisor AI, an expert personal finance analyst. You have the user's complete financial data for ${data.monthLabel} below. Write a personalised monthly financial report.

Write your response as a series of short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Open with a concise overview of the month: income, expenses, net savings, savings rate, and a brief comparison to last month where data exists. Then analyse income and spending — totals, month-over-month changes, top 3 spending categories, and any unusual spikes or reductions. Follow with budget performance — which budgets were on track, close to limit, or exceeded, highlighting the best-managed and most overspent. Then cover savings and goals — savings rate, progress on each goal, and whether the user is on track for any deadlines. Briefly summarise debt payoff progress and subscription costs, suggesting optimisations if subscription spending seems high. End with 3-4 specific, actionable recommendations that reference actual numbers and categories.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Be data-driven — reference specific categories, percentages, and values
- Be encouraging but honest about areas needing improvement
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 500 words
- ${data.isCurrentMonth ? "This is the current month in progress — frame observations as 'so far' and project end-of-month where sensible" : "This is a completed month — use past tense"}
- Do NOT use generic advice — tailor everything to this specific data

${context}`,
      prompt: `Generate my ${data.monthLabel} financial report.`,
      maxOutputTokens: 1200,
    };
  },
});
