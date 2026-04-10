import { getMonthKey } from "@/lib/date";

interface TrendPoint {
  readonly month: string;
  readonly income: number;
  readonly expenses: number;
}

export interface RetirementSuggestions {
  readonly estimatedAnnualSalary: number;
  readonly suggestedAnnualSpending: number;
  readonly suggestedMonthlySavings: number;
  readonly avgMonthlyIncome: number;
  readonly avgMonthlyExpenses: number;
  readonly hasEnoughData: boolean;
}

/**
 * Compute smart defaults for retirement profile from transaction data.
 * Pure function — no DB calls.
 */
export function computeRetirementSuggestions(
  trend: readonly TrendPoint[],
): RetirementSuggestions {
  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const hasEnoughData = completedMonths.length >= 1;
  const monthCount = Math.max(completedMonths.length, 1);

  const avgMonthlyIncome =
    completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses =
    completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;

  return {
    estimatedAnnualSalary: Math.round(avgMonthlyIncome * 12),
    suggestedAnnualSpending: Math.round(avgMonthlyExpenses * 12),
    suggestedMonthlySavings: Math.round(avgMonthlyIncome - avgMonthlyExpenses),
    avgMonthlyIncome: Math.round(avgMonthlyIncome),
    avgMonthlyExpenses: Math.round(avgMonthlyExpenses),
    hasEnoughData,
  };
}
