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
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium">{category}</span>
        <span className="text-muted-foreground">
          {formatCurrency(amount, currency)}
        </span>
      </div>
      <div className="bg-muted h-2.5 rounded-full overflow-hidden">
        <div
          className="h-full rounded-full transition-all"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

export const SpendCategoryRow = React.memo(SpendCategoryRowComponent);
