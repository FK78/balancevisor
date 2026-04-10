import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  getBudgetDecisionSummary,
  getBudgetRiskScore,
  getBudgetUsagePercent,
  getBudgetUsagePercentRaw,
} from "@/components/dashboard/dashboard-decision";

type Budget = {
  id: string;
  budgetCategory: string;
  budgetAmount: number;
  budgetSpent: number;
};

type DashboardBudgetProgressProps = {
  budgets: Budget[];
  budgetsAtRisk: Budget[];
  currency: string;
};

export function DashboardBudgetProgress({
  budgets,
  budgetsAtRisk,
  currency,
}: DashboardBudgetProgressProps) {
  const summary = getBudgetDecisionSummary({ budgetsAtRisk, currency });
  const prioritisedBudgets = [...budgets].sort((left, right) => {
    const riskDifference = getBudgetRiskScore(right) - getBudgetRiskScore(left);
    if (riskDifference !== 0) return riskDifference;
    return left.budgetCategory.localeCompare(right.budgetCategory);
  });

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>{summary.title}</CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/budgets">{summary.actionLabel}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 ? (
          <DecisionEmptyState
            title="No budgets set"
            description="Create a budget to track your spending limits."
            action={
              <Button asChild size="sm" variant="outline">
                <Link href="/dashboard/budgets">Set up budgets</Link>
              </Button>
            }
          />
        ) : (
          <>
            <p className="text-sm text-muted-foreground">{summary.summary}</p>
            {prioritisedBudgets.slice(0, 5).map((budget) => {
              const pct = Math.min(getBudgetUsagePercent(budget), 100);
              const pctRaw = getBudgetUsagePercentRaw(budget);
              const isOver = budget.budgetSpent > budget.budgetAmount;
              const isWarning = pctRaw >= 80 && !isOver;
              return (
                <div
                  key={budget.id}
                  data-testid="budget-progress-row"
                  className="space-y-1.5"
                >
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">
                      {budget.budgetCategory}
                    </span>
                    <span
                      className={`text-xs tabular-nums ${
                        isOver
                          ? "text-red-600 font-semibold"
                          : isWarning
                            ? "text-amber-600"
                            : "text-muted-foreground"
                      }`}
                    >
                      {formatCurrency(budget.budgetSpent, currency)} /{" "}
                      {formatCurrency(budget.budgetAmount, currency)}
                    </span>
                  </div>
                  <div className="bg-muted h-2.5 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all ${
                        isOver
                          ? "bg-red-400"
                          : isWarning
                            ? "bg-amber-400"
                            : "bg-emerald-400"
                      }`}
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </>
        )}
      </CardContent>
    </Card>
  );
}
