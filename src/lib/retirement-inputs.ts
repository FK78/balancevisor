/**
 * Shared helpers to build retirement projection inputs from financial data.
 */

import type { RetirementInputs } from "@/lib/retirement-calculator";
import type { RetirementProfile } from "@/db/queries/retirement";
import { getMonthKey } from "@/lib/date";

interface TrendPoint {
  readonly month: string;
  readonly income: number;
  readonly expenses: number;
}

export function getCompletedMonths(trend: readonly TrendPoint[]): readonly TrendPoint[] {
  const currentMonthKey = getMonthKey(new Date());
  return trend.filter((m) => m.month !== currentMonthKey);
}

export function buildRetirementInputs(opts: {
  profile: RetirementProfile;
  currentNetWorth: number;
  investmentValue: number;
  completedMonths: readonly TrendPoint[];
  totalDebtRemaining: number;
}): RetirementInputs {
  const { profile, currentNetWorth, investmentValue, completedMonths, totalDebtRemaining } = opts;
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome = completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses = completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;
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
