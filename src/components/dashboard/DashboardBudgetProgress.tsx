import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { formatCurrency } from "@/lib/formatCurrency";

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
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Budget Progress</CardTitle>
            <CardDescription>
              How your budgets are tracking this period.
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/budgets">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {budgets.length === 0 ? (
          <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-6 text-center">
            <p className="text-sm font-medium text-foreground">
              No budgets set
            </p>
            <p className="text-xs">
              Create a budget to track your spending limits.
            </p>
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/budgets">Set up budgets</Link>
            </Button>
          </div>
        ) : (
          budgets.slice(0, 5).map((budget) => {
            const pct =
              budget.budgetAmount > 0
                ? Math.min(
                    (budget.budgetSpent / budget.budgetAmount) * 100,
                    100
                  )
                : 0;
            const isOver = budget.budgetSpent > budget.budgetAmount;
            const isWarning = pct >= 80 && !isOver;
            return (
              <div key={budget.id} className="space-y-1.5">
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
          })
        )}
        {budgetsAtRisk.length > 0 && (
          <p className="text-xs text-amber-600 pt-1 font-medium">
            {budgetsAtRisk.length} budget
            {budgetsAtRisk.length > 1 ? "s" : ""} at or over 80% spent
          </p>
        )}
      </CardContent>
    </Card>
  );
}
