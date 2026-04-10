import type { BudgetRow } from "@/db/queries/budgets";

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type BudgetPaceResult = {
  readonly budgetId: string;
  readonly category: string;
  readonly limit: number;
  readonly spent: number;
  readonly projectedSpend: number;
  readonly projectedOverspend: number;
  readonly daysElapsed: number;
  readonly daysInMonth: number;
  readonly dailyRate: number;
  readonly willOverspend: boolean;
  readonly pacePercent: number;
};

// ---------------------------------------------------------------------------
// Pure function: calculate budget pace
// ---------------------------------------------------------------------------

/**
 * For each budget, projects end-of-month spend based on daily average pace.
 * Returns budgets predicted to overspend, sorted by projected overspend descending.
 */
export function calculateBudgetPace(
  budgets: readonly BudgetRow[],
  now = new Date(),
): readonly BudgetPaceResult[] {
  const dayOfMonth = now.getDate();
  const year = now.getFullYear();
  const month = now.getMonth();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  if (dayOfMonth < 3) return [];

  const results: BudgetPaceResult[] = [];

  for (const b of budgets) {
    if (b.budgetAmount <= 0) continue;

    const spent = b.budgetSpent;
    const limit = b.budgetAmount;
    const dailyRate = spent / dayOfMonth;
    const projectedSpend = Math.round(dailyRate * daysInMonth * 100) / 100;
    const projectedOverspend = Math.round(Math.max(0, projectedSpend - limit) * 100) / 100;
    const willOverspend = projectedSpend > limit;

    const idealPace = (dayOfMonth / daysInMonth) * 100;
    const actualPace = (spent / limit) * 100;
    const pacePercent = Math.round(actualPace - idealPace);

    if (willOverspend && pacePercent > 10) {
      results.push({
        budgetId: b.id,
        category: b.budgetCategory,
        limit,
        spent,
        projectedSpend,
        projectedOverspend,
        daysElapsed: dayOfMonth,
        daysInMonth,
        dailyRate: Math.round(dailyRate * 100) / 100,
        willOverspend,
        pacePercent,
      });
    }
  }

  results.sort((a, b) => b.projectedOverspend - a.projectedOverspend);
  return results;
}
