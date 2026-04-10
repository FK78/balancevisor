import type { Nudge } from "./types";
import type { BudgetPaceResult } from "@/lib/budget-pace";
import { formatCurrency } from "@/lib/formatCurrency";

export function generateBudgetNudges(
  paceResults: readonly BudgetPaceResult[],
  currency: string,
): Nudge[] {
  const nudges: Nudge[] = [];

  for (const pace of paceResults.slice(0, 3)) {
    const daysLeft = pace.daysInMonth - pace.daysElapsed;
    nudges.push({
      id: `budget-pace-${pace.budgetId}`,
      category: "watch",
      title: `${pace.category} is on track to overspend`,
      body: `At your current pace, you'll spend ${formatCurrency(pace.projectedSpend, currency)} against a ${formatCurrency(pace.limit, currency)} budget — ${formatCurrency(pace.projectedOverspend, currency)} over. You have ${daysLeft} days to adjust.`,
      actionUrl: "/dashboard/budgets",
      actionLabel: "View budget",
      priority: 80,
      icon: "target",
      dismissible: true,
    });
  }

  return nudges;
}
