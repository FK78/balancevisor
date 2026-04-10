"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowRightLeft } from "lucide-react";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatCurrency";
import { useReportsContext } from "@/components/reports/ReportsProvider";

/**
 * A simplified Sankey-style money flow visualisation using pure CSS/HTML.
 * Left column: Income sources → centre node → right column: expense categories.
 * Uses the data already available in the ReportsProvider context.
 */

interface FlowNode {
  readonly label: string;
  readonly amount: number;
  readonly color: string;
  readonly pct: number;
}

export function ReportsMoneyFlow() {
  const { filteredTrend, totalIncome, totalNet, categoryPieData, currency } =
    useReportsContext();

  const { savingsNode, expenseNodes } = useMemo(() => {
    const savings: FlowNode = {
      label: "Savings",
      amount: Math.max(0, totalNet),
      color: "hsl(142, 71%, 45%)",
      pct: totalIncome > 0 ? (Math.max(0, totalNet) / totalIncome) * 100 : 0,
    };

    const expenses: FlowNode[] = categoryPieData
      .filter((c) => c.total > 0)
      .map((c) => ({
        label: c.category,
        amount: c.total,
        color: c.fill,
        pct: totalIncome > 0 ? (c.total / totalIncome) * 100 : 0,
      }));

    return { savingsNode: savings, expenseNodes: expenses };
  }, [totalIncome, totalNet, categoryPieData]);

  if (filteredTrend.length === 0) return null;

  const allOutflows = [
    ...(savingsNode.amount > 0 ? [savingsNode] : []),
    ...expenseNodes,
  ];

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
            <ArrowRightLeft className="h-4 w-4 text-indigo-500" />
          </div>
          <div>
            <CardTitle className="text-base">Money Flow</CardTitle>
            <CardDescription className="text-xs">
              How income flows to savings &amp; spending categories
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="flex items-stretch gap-3">
          {/* Income (left) */}
          <div className="flex w-28 shrink-0 flex-col justify-center rounded-xl bg-emerald-500/10 p-3">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-600 dark:text-emerald-400">
              Income
            </span>
            <span className="text-lg font-bold tabular-nums text-emerald-600 dark:text-emerald-400">
              {formatCompactCurrency(totalIncome, currency)}
            </span>
          </div>

          {/* Flow lines (centre) */}
          <div className="flex flex-1 flex-col justify-center">
            <div className="relative py-2">
              {allOutflows.map((node) => (
                <div key={node.label} className="flex items-center gap-2 py-0.5">
                  <div
                    className="h-1 rounded-full"
                    style={{
                      width: `${Math.max(8, node.pct)}%`,
                      backgroundColor: node.color,
                      opacity: 0.7,
                    }}
                  />
                  <span className="text-[10px] text-muted-foreground whitespace-nowrap">
                    {node.pct.toFixed(0)}%
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Outflows (right) */}
          <div className="flex w-40 shrink-0 flex-col gap-1 overflow-y-auto max-h-56">
            {allOutflows.map((node) => (
              <div
                key={node.label}
                className="flex items-center gap-2 rounded-lg px-2 py-1"
              >
                <span
                  className="h-2 w-2 shrink-0 rounded-full"
                  style={{ backgroundColor: node.color }}
                />
                <div className="min-w-0 flex-1">
                  <span className="block truncate text-xs font-medium">
                    {node.label}
                  </span>
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {formatCurrency(node.amount, currency)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
