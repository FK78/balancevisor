"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { formatCurrency } from "@/lib/formatCurrency";
import { useReportsContext } from "@/components/reports/ReportsProvider";

export function ReportsTopCategories() {
  const { categoryPieData, categoryTotal, range, currency } = useReportsContext();

  if (categoryPieData.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Spending Categories</CardTitle>
        <CardDescription>
          Ranked by total spend over the last {range} months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {categoryPieData.map((cat, i) => {
            const pct = categoryTotal > 0 ? (cat.total / categoryTotal) * 100 : 0;
            return (
              <div key={cat.category} className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-medium w-5 text-right">
                  {i + 1}
                </span>
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: cat.fill }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{cat.category}</span>
                    <span className="text-sm font-semibold tabular-nums ml-2">
                      {formatCurrency(cat.total, currency)}
                    </span>
                  </div>
                  <div className="bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(pct, 100)}%`,
                        backgroundColor: cat.fill,
                      }}
                    />
                  </div>
                </div>
                <span className="text-xs text-muted-foreground tabular-nums w-10 text-right">
                  {pct.toFixed(0)}%
                </span>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
