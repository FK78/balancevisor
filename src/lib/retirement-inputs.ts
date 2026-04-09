/**
 * Shared helper to build the inputs required by `calculateRetirementProjection`.
 *
 * Eliminates duplication across dashboard/page.tsx, retirement/page.tsx,
 * and retirement-planner/route.ts.
 */

import type { RetirementProfile } from "@/db/queries/retirement";
import type { RetirementInputs } from "@/lib/retirement-calculator";
import { getMonthKey } from "@/lib/date";

interface TrendMonth {
  readonly month: string;
  readonly income: number;
  readonly expenses: number;
}

/**
 * Build the `RetirementInputs` struct from raw financial data.
 */
export function buildRetirementInputs(opts: {
  readonly profile: RetirementProfile;
  readonly currentNetWorth: number;
  readonly investmentValue: number;
  readonly totalDebtRemaining: number;
  readonly trend: readonly TrendMonth[];
}): RetirementInputs {
  const { profile, currentNetWorth, investmentValue, totalDebtRemaining, trend } = opts;

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome =
    completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses =
    completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;
  const annualSavings = (avgMonthlyIncome - avgMonthlyExpenses) * 12;

  return {
    profile,
    currentNetWorth,
    investmentValue,
    annualSavings,
    totalDebtRemaining,
    avgMonthlyIncome,
    avgMonthlyExpenses,
  };
}

/**
 * Returns the completed months from a trend array (excludes current month).
 */
export function getCompletedMonths(trend: readonly TrendMonth[]): readonly TrendMonth[] {
  const currentMonthKey = getMonthKey(new Date());
  return trend.filter((m) => m.month !== currentMonthKey);
}
