"use client";

import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import { useReportsContext } from "@/components/reports/ReportsProvider";

export function ReportsKPIStats() {
  const { totalIncome, totalExpenses, totalNet, savingsRate, avgMonthlyExpense, currency } =
    useReportsContext();

  return (
    <Card>
      <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-5 sm:divide-x sm:gap-0">
        <div className="px-3 text-center">
          <p className="text-xs text-muted-foreground">Income</p>
          <p className="text-lg font-semibold tabular-nums text-emerald-600">
            {formatCurrency(totalIncome, currency)}
          </p>
        </div>
        <div className="px-3 text-center">
          <p className="text-xs text-muted-foreground">Expenses</p>
          <p className="text-lg font-semibold tabular-nums text-red-600">
            {formatCurrency(totalExpenses, currency)}
          </p>
        </div>
        <div className="px-3 text-center">
          <p className="text-xs text-muted-foreground">Net Savings</p>
          <p
            className={`text-lg font-semibold tabular-nums ${totalNet >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {totalNet >= 0 ? "+" : "−"}
            {formatCurrency(Math.abs(totalNet), currency)}
          </p>
        </div>
        <div className="px-3 text-center">
          <p className="text-xs text-muted-foreground">Savings Rate</p>
          <p
            className={`text-lg font-semibold tabular-nums ${savingsRate >= 0 ? "text-emerald-600" : "text-red-600"}`}
          >
            {savingsRate.toFixed(1)}%
          </p>
        </div>
        <div className="px-3 text-center">
          <p className="text-xs text-muted-foreground">Avg/mo Spend</p>
          <p className="text-lg font-semibold tabular-nums">
            {formatCurrency(avgMonthlyExpense, currency)}
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
