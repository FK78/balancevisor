import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { getMonthlyReportData, formatMonthlyReportContext } from "@/lib/monthly-report-data";
import { getCachedReport, setCachedReport, invalidateCachedReport } from "@/lib/monthly-report-cache";
import { rateLimiters } from "@/lib/rate-limiter";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const rateLimitResult = rateLimiters.monthlyReport.consume(`monthly-report:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before generating another report." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const monthsAgo = Math.max(0, Math.min(11, Math.floor(Number(body?.monthsAgo ?? 1))));
  const forceRefresh = body?.refresh === true;

  if (!forceRefresh) {
    const cached = getCachedReport(userId, monthsAgo);
    if (cached) {
      return new Response(JSON.stringify({ report: cached, cached: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    invalidateCachedReport(userId, monthsAgo);
  }

  const data = await getMonthlyReportData(userId, monthsAgo);
  const context = formatMonthlyReportContext(data);

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, an expert personal finance analyst. You have the user's complete financial data for ${data.monthLabel} below. Write a personalised monthly financial report.

Structure your response with these exact markdown sections:

## Month at a Glance
A concise overview with key numbers: income, expenses, net savings, savings rate. Use a mini comparison to last month where data exists.

## Income & Spending
Analyse income and expense totals, month-over-month changes, and highlight the top 3 spending categories. Note any unusual spikes or reductions.

## Budget Performance
For each budget, note whether it was on track, close to limit, or exceeded. Highlight the best-managed and most overspent budgets.

## Savings & Goals
Comment on the savings rate. For each goal, note progress and whether the user is on track to meet any deadlines.

## Debt & Subscriptions
Summarise debt payoff progress and subscription costs. Suggest optimisations if subscription spending seems high relative to income.

## Key Takeaways & Next Month Tips
3-4 specific, actionable recommendations based on the data. Be concrete — reference actual numbers and categories.

Rules:
- Use the user's currency (${data.baseCurrency}) when referencing amounts
- Be data-driven — reference specific categories, percentages, and values
- Be encouraging but honest about areas needing improvement
- Keep the total response under 700 words
- ${data.isCurrentMonth ? "This is the current month in progress — frame observations as 'so far' and project end-of-month where sensible" : "This is a completed month — use past tense"}
- Do NOT use generic advice — tailor everything to this specific data

${context}`,
    prompt: `Generate my ${data.monthLabel} financial report.`,
    maxOutputTokens: 1200,
    onFinish: ({ text }) => {
      if (text) {
        setCachedReport(userId, monthsAgo, text);
      }
    },
  });

  return result.toTextStreamResponse();
}
