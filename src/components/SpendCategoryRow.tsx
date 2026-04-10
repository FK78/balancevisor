import { formatCurrency } from "@/lib/formatCurrency";
import React from "react";

function SpendCategoryRowComponent({ category, total, color, totalExpenses, currency }: {
  category: string;
  total: string | null;
  color: string;
  totalExpenses: number;
  currency: string;
}) {
  const amount = Number(total) || 0;
  const pct = totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0;

  return (
    <div className="space-y-1.5">
      <div className="flex items-center justify-between gap-2 text-sm">
        <div className="flex items-center gap-2 min-w-0">
          <div className="h-2.5 w-2.5 shrink-0 rounded-full" style={{ backgroundColor: color }} />
          <span className="font-medium truncate" title={category}>{category}</span>
        </div>
        <span className="text-muted-foreground tabular-nums shrink-0">
          {formatCurrency(amount, currency)}
        </span>
      </div>
      <div className="bg-muted h-2 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export const SpendCategoryRow = React.memo(SpendCategoryRowComponent);
