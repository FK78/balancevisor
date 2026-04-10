import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getRecurringTransactions, toMonthlyEquivalent } from "@/db/queries/recurring";
import { getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getMonthKey } from "@/lib/date";

export type ForecastBreakdown = {
  label: string;
  amount: number;
  type: "income" | "expense";
};

export type CashflowForecast = {
  baseCurrency: string;
  /** Forecast period label, e.g. "May 2026" */
  periodLabel: string;
  /** Whether we're forecasting the remainder of the current month vs a full next month */
  isCurrentMonth: boolean;
  daysRemaining: number;
  daysInMonth: number;

  // Projected totals
  projectedIncome: number;
  projectedExpenses: number;
  projectedNet: number;

  // Current month actuals so far (only when isCurrentMonth)
  actualIncome: number;
  actualExpenses: number;

  // Components
  recurringIncome: number;
  recurringExpenses: number;
  subscriptionCost: number;

  // Historical averages used for non-recurring projection
  avgMonthlyIncome: number;
  avgMonthlyExpenses: number;

  // Confidence indicator based on data availability
  confidence: "high" | "medium" | "low";

  // Top expected items
  breakdown: ForecastBreakdown[];

  // Historical data for mini sparkline
  recentMonths: Array<{ month: string; income: number; expenses: number; net: number }>;
};

interface ForecastOptions {
  prefetchedTrend?: Awaited<ReturnType<typeof getMonthlyIncomeExpenseTrend>>;
  prefetchedCurrency?: string;
}

export async function getCashflowForecast(userId: string, opts: ForecastOptions = {}): Promise<CashflowForecast> {
  const [trend, recurring, subscriptions, baseCurrency] = await Promise.all([
    opts.prefetchedTrend ?? getMonthlyIncomeExpenseTrend(userId, 6),
    getRecurringTransactions(userId),
    getActiveSubscriptionsTotals(userId),
    opts.prefetchedCurrency ?? getUserBaseCurrency(userId),
  ]);

  const now = new Date();
  const currentMonthKey = getMonthKey(now);
  const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const dayOfMonth = now.getDate();
  const daysRemaining = daysInMonth - dayOfMonth;

  // Current month actuals
  const currentMonthData = trend.find((m) => m.month === currentMonthKey);
  const actualIncome = currentMonthData?.income ?? 0;
  const actualExpenses = currentMonthData?.expenses ?? 0;

  // Historical averages (exclude current month for cleaner average)
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome = completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses = completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;

  // Recurring transaction totals (monthly equivalent)
  const recurringIncome = recurring
    .filter((r) => r.type === "income")
    .reduce((s, r) => s + toMonthlyEquivalent(r.amount, r.recurring_pattern), 0);
  const recurringExpenses = recurring
    .filter((r) => r.type === "expense")
    .reduce((s, r) => s + toMonthlyEquivalent(r.amount, r.recurring_pattern), 0);

  // Project current month to end
  // Strategy: use actual data so far + pro-rate remaining days using the higher of
  // (recurring known amounts) or (historical daily average for the remaining portion)
  const fractionElapsed = dayOfMonth / daysInMonth;
  const fractionRemaining = 1 - fractionElapsed;

  // For income: if we have recurring income, use it as base; add historical non-recurring estimate
  const nonRecurringAvgIncome = Math.max(0, avgMonthlyIncome - recurringIncome);
  const expectedRemainingIncome = fractionRemaining * nonRecurringAvgIncome;
  const projectedIncome = actualIncome + expectedRemainingIncome +
    (fractionRemaining * recurringIncome);

  // For expenses: recurring + subscriptions are "known"; add historical non-recurring estimate
  const knownMonthlyExpenses = recurringExpenses + subscriptions.monthly;
  const nonRecurringAvgExpenses = Math.max(0, avgMonthlyExpenses - knownMonthlyExpenses);
  const expectedRemainingExpenses = fractionRemaining * nonRecurringAvgExpenses;
  const projectedExpenses = actualExpenses + expectedRemainingExpenses +
    (fractionRemaining * knownMonthlyExpenses);

  const projectedNet = projectedIncome - projectedExpenses;

  // Confidence based on data availability
  const confidence: "high" | "medium" | "low" =
    completedMonths.length >= 3 ? "high" :
    completedMonths.length >= 1 ? "medium" : "low";

  // Build breakdown of top expected items
  const breakdown: ForecastBreakdown[] = [];

  const incomeRecurring = recurring.filter((r) => r.type === "income");
  const expenseRecurring = recurring.filter((r) => r.type === "expense");

  for (const r of incomeRecurring.slice(0, 3)) {
    breakdown.push({
      label: r.description || "Recurring income",
      amount: toMonthlyEquivalent(r.amount, r.recurring_pattern),
      type: "income",
    });
  }

  for (const r of expenseRecurring.slice(0, 3)) {
    breakdown.push({
      label: r.description || "Recurring expense",
      amount: toMonthlyEquivalent(r.amount, r.recurring_pattern),
      type: "expense",
    });
  }

  if (subscriptions.monthly > 0) {
    breakdown.push({
      label: `Subscriptions (${subscriptions.count})`,
      amount: subscriptions.monthly,
      type: "expense",
    });
  }

  if (nonRecurringAvgExpenses > 0) {
    breakdown.push({
      label: "Variable spending (avg)",
      amount: nonRecurringAvgExpenses,
      type: "expense",
    });
  }

  // Sort breakdown by amount desc
  breakdown.sort((a, b) => b.amount - a.amount);

  const periodLabel = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(now);

  return {
    baseCurrency,
    periodLabel,
    isCurrentMonth: true,
    daysRemaining,
    daysInMonth,
    projectedIncome: Math.round(projectedIncome * 100) / 100,
    projectedExpenses: Math.round(projectedExpenses * 100) / 100,
    projectedNet: Math.round(projectedNet * 100) / 100,
    actualIncome,
    actualExpenses,
    recurringIncome: Math.round(recurringIncome * 100) / 100,
    recurringExpenses: Math.round(recurringExpenses * 100) / 100,
    subscriptionCost: subscriptions.monthly,
    avgMonthlyIncome: Math.round(avgMonthlyIncome * 100) / 100,
    avgMonthlyExpenses: Math.round(avgMonthlyExpenses * 100) / 100,
    confidence,
    breakdown: breakdown.slice(0, 8),
    recentMonths: trend.slice(-4),
  };
}
