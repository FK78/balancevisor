import type { MonthlyCashflowPoint } from "@/db/queries/transactions";

export type MonthlySavingsRate = {
  month: string;
  income: number;
  expenses: number;
  net: number;
  rate: number; // percentage -100 to 100+
};

/**
 * Computes per-month savings rates from the cashflow trend.
 * Savings rate = (income - expenses) / income * 100.
 * Returns 0 rate when income is 0 for a month.
 */
export function computeMonthlySavingsRates(
  trend: MonthlyCashflowPoint[],
): MonthlySavingsRate[] {
  return trend.map((p) => ({
    month: p.month,
    income: p.income,
    expenses: p.expenses,
    net: p.net,
    rate: p.income > 0 ? Math.round(((p.income - p.expenses) / p.income) * 1000) / 10 : 0,
  }));
}
