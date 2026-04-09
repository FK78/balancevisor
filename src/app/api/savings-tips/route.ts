import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getMonthlyIncomeExpenseTrend, getTotalSpendByCategoryThisMonth } from "@/db/queries/transactions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getCachedSavingsTips, setCachedSavingsTips, invalidateCachedSavingsTips } from "@/lib/savings-tips-cache";
import { rateLimiters } from "@/lib/rate-limiter";
import { formatCurrency } from "@/lib/formatCurrency";
import { getMonthKey } from "@/lib/date";

export async function POST(req: Request) {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.savingsTips.consume(`savings-tips:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const body = await req.json().catch(() => ({}));
  const forceRefresh = body?.refresh === true;

  if (!forceRefresh) {
    const cached = getCachedSavingsTips(userId);
    if (cached) {
      return new Response(JSON.stringify({ tips: cached, cached: true }), {
        headers: { "Content-Type": "application/json" },
      });
    }
  } else {
    invalidateCachedSavingsTips(userId);
  }

  const [trend, spendByCategory, baseCurrency] = await Promise.all([
    getMonthlyIncomeExpenseTrend(userId, 6),
    getTotalSpendByCategoryThisMonth(userId),
    getUserBaseCurrency(userId),
  ]);

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);

  if (completedMonths.length === 0) {
    return new Response(
      JSON.stringify({ tips: "Not enough data yet. Keep tracking for personalised savings tips.", cached: false }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const trendLines = completedMonths.map((m) => {
    const rate = m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0;
    return `- ${m.month}: Income ${fmt(m.income)}, Expenses ${fmt(m.expenses)}, Savings rate ${rate}%`;
  });

  const categoryLines = spendByCategory.map((c) => `- ${c.category}: ${fmt(Number(c.total ?? 0))}`);

  const context = [
    `# Monthly Savings Rates`,
    ...trendLines,
    ``,
    `# Current Month Top Categories`,
    ...categoryLines,
  ].join("\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a savings optimisation coach. Analyse the user's savings rate trend and spending patterns.

Write exactly 3-4 concise, personalised micro-tips to improve their savings rate. Each tip should:
- Reference specific data (categories, amounts, trends)
- Be immediately actionable
- Include a rough estimate of monthly savings if followed

Rules:
- Use the user's currency (${baseCurrency})
- Format as a numbered list (1. 2. 3.)
- Each tip should be 1-2 sentences max
- Be specific — no generic "spend less" advice
- If the savings rate is already high (>30%), focus on maintaining it and optimising further
- Keep the ENTIRE response under 150 words

${context}`,
    prompt: "Give me personalised tips to improve my savings rate.",
    maxOutputTokens: 384,
    onFinish: ({ text }) => {
      if (text) {
        setCachedSavingsTips(userId, text);
      }
    },
  });

  return result.toTextStreamResponse();
}
