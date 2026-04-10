import { groq } from "@ai-sdk/groq";
import { streamText } from "ai";
import { getCurrentUserId } from "@/lib/auth";
import { guardAiEnabled } from "@/lib/ai-guard";
import { getRetirementProfile } from "@/db/queries/retirement";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { getDebtsSummary } from "@/db/queries/debts";
import { getInvestmentValue } from "@/lib/investment-value";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { rateLimiters } from "@/lib/rate-limiter";
import { getPostHogClient } from "@/lib/posthog-server";
import { formatCurrency } from "@/lib/formatCurrency";
import { calculateNetWorth } from "@/lib/net-worth";
import { getCompletedMonths, buildRetirementInputs } from "@/lib/retirement-inputs";
import { calculateRetirementProjection } from "@/lib/retirement-calculator";

export async function POST() {
  const userId = await getCurrentUserId();

  const aiBlocked = await guardAiEnabled();
  if (aiBlocked) return aiBlocked;

  const rateLimitResult = rateLimiters.retirementPlanner.consume(`retirement-planner:${userId}`);
  if (!rateLimitResult.allowed) {
    return new Response(
      JSON.stringify({ error: "Too many requests. Please wait before refreshing." }),
      { status: 429, headers: { "Content-Type": "application/json", "Retry-After": String(rateLimitResult.retryAfter) } },
    );
  }

  const posthog = getPostHogClient();
  posthog.capture({ distinctId: userId, event: "retirement_analysis_requested" });

  const profile = await getRetirementProfile(userId);
  if (!profile) {
    return new Response(
      JSON.stringify({ advice: "Set up your retirement profile to get personalised AI advice." }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const [trend, accounts, investmentValue, debtsSummary, netWorthHistory, baseCurrency] = await Promise.all([
    getMonthlyIncomeExpenseTrend(userId, 6),
    getAccountsWithDetails(userId),
    getInvestmentValue(userId),
    getDebtsSummary(userId),
    getNetWorthHistory(userId, 90),
    getUserBaseCurrency(userId),
  ]);

  const completedMonths = getCompletedMonths(trend);

  if (completedMonths.length === 0) {
    return new Response(
      JSON.stringify({ advice: "Not enough transaction history yet. Keep tracking for at least one month to get retirement insights." }),
      { headers: { "Content-Type": "application/json" } },
    );
  }

  const { netWorth } = calculateNetWorth(accounts, investmentValue);
  const inputs = buildRetirementInputs({
    profile,
    currentNetWorth: netWorth,
    investmentValue,
    completedMonths,
    totalDebtRemaining: debtsSummary.totalRemaining,
  });
  const projection = calculateRetirementProjection(inputs);

  const fmt = (n: number) => formatCurrency(n, baseCurrency);

  const trendLines = completedMonths.map((m) => {
    const rate = m.income > 0 ? Math.round(((m.income - m.expenses) / m.income) * 100) : 0;
    return `- ${m.month}: Income ${fmt(m.income)}, Expenses ${fmt(m.expenses)}, Savings rate ${rate}%`;
  });

  const netWorthTrendLine = netWorthHistory.length >= 2
    ? `Net worth trend: ${fmt(netWorthHistory[0].net_worth)} → ${fmt(netWorthHistory[netWorthHistory.length - 1].net_worth)} over ${netWorthHistory.length} days`
    : "";

  const debtLines = debtsSummary.active.length > 0
    ? debtsSummary.active.map((d) => `- ${d.name}: ${fmt(d.remaining_amount)} remaining at ${d.interest_rate}% APR`)
    : ["- No active debts"];

  const context = [
    `# Retirement Profile`,
    `- Current age: ${profile.current_age}`,
    `- Target retirement age: ${profile.target_retirement_age}`,
    `- Desired annual spending: ${fmt(profile.desired_annual_spending)}`,
    `- Expected pension: ${fmt(profile.expected_pension_annual)}/year`,
    `- Assumed real return: ${profile.expected_investment_return}%`,
    `- Assumed inflation: ${profile.inflation_rate}%`,
    `- Life expectancy: ${profile.life_expectancy}`,
    ``,
    `# Financial Snapshot`,
    `- Current net worth: ${fmt(projection.currentNetWorth)}`,
    `- Investment portfolio: ${fmt(investmentValue)}`,
    `- Annual savings: ${fmt(projection.annualSavings)} (${projection.savingsRate}% savings rate)`,
    `- Monthly savings: ${fmt(projection.monthlySavings)}`,
    netWorthTrendLine,
    ``,
    `# Projection Results`,
    `- Estimated retirement age: ${projection.estimatedRetirementAge}`,
    `- Can retire on target (${profile.target_retirement_age}): ${projection.canRetireOnTarget ? "YES" : "NO"}`,
    `- Required fund at ${profile.target_retirement_age}: ${fmt(projection.requiredFundAtTarget)}`,
    `- Projected fund at ${profile.target_retirement_age}: ${fmt(projection.projectedFundAtTarget)}`,
    `- Fund gap: ${projection.fundGap > 0 ? fmt(projection.fundGap) + " shortfall" : "On track"}`,
    `- Progress: ${projection.fundProgress}%`,
    ``,
    `# Monthly Trends`,
    ...trendLines,
    ``,
    `# Active Debts`,
    ...debtLines,
    ``,
    `# What-If Scenarios`,
    ...projection.scenarios.map((s) => `- ${s.label}: Retire at ${s.estimatedRetirementAge} (${s.description})`),
  ].join("\n");

  const result = streamText({
    model: groq("llama-3.3-70b-versatile"),
    system: `You are BalanceVisor AI, a retirement planning specialist. Analyse the user's complete financial picture and retirement goals.

Write your response as a few short, focused paragraphs — no headings, no markdown headers, no bullet-point lists. Use bold text sparingly to highlight key names or numbers inline.

Open with a one-sentence readiness assessment (e.g. "On Track", "Needs Work", "At Risk") and a brief justification. Then cover timeline analysis — when they can realistically retire based on current trajectory versus their target age, with specific numbers. Follow with the biggest risks to their plan: debt burden, low savings rate, investment gaps, inflation, or spending trends. Then give 3-5 specific, data-driven recommendations with expected impact, prioritised by urgency. End with 2-3 quick wins they can act on this month.

Rules:
- Use the user's currency (${baseCurrency}) when referencing amounts
- Reference specific numbers from their data
- Be encouraging but honest about gaps
- Do NOT use markdown headings (##) or bullet-point lists
- Keep paragraphs short (3-4 sentences each)
- Keep the total response under 400 words
- Do NOT use generic advice — tailor everything to this specific user's data

${context}`,
    prompt: "Analyse my retirement readiness and give me a personalised plan.",
    maxOutputTokens: 1200,
  });

  return result.toTextStreamResponse();
}
