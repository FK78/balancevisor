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
import { CreditCard } from "lucide-react";

type DebtItem = {
  id: string;
  name: string;
  original_amount: number;
  remaining_amount: number;
  color: string;
};

type DebtSummary = {
  activeCount: number;
  totalRemaining: number;
  totalMinimumPayment: number;
  overallPct: number;
  active: DebtItem[];
};

type DashboardDebtSummaryProps = {
  debtSummary: DebtSummary;
  currency: string;
};

export function DashboardDebtSummary({
  debtSummary,
  currency,
}: DashboardDebtSummaryProps) {
  if (debtSummary.activeCount === 0) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-4 w-4" />
              Debt Tracker
            </CardTitle>
            <CardDescription>
              {formatCurrency(debtSummary.totalRemaining, currency)} remaining · {debtSummary.activeCount} active debt{debtSummary.activeCount !== 1 ? "s" : ""}
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/debts">View all</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {debtSummary.active.slice(0, 4).map((debt) => {
          const paid = debt.original_amount - debt.remaining_amount;
          const pct = debt.original_amount > 0 ? Math.min(Math.round((paid / debt.original_amount) * 100), 100) : 0;
          return (
            <div key={debt.id} className="space-y-1.5">
              <div className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl"
                    style={{ backgroundColor: debt.color + "18" }}
                  >
                    <CreditCard className="h-3.5 w-3.5" style={{ color: debt.color }} />
                  </div>
                  <span className="font-medium truncate">{debt.name}</span>
                </div>
                <span className="font-semibold tabular-nums text-red-600">
                  {formatCurrency(debt.remaining_amount, currency)}
                </span>
              </div>
              <div className="bg-muted h-1.5 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all"
                  style={{ width: `${pct}%`, backgroundColor: debt.color }}
                />
              </div>
            </div>
          );
        })}
        <div className="flex items-center justify-between pt-2 border-t text-xs text-muted-foreground">
          <span>{debtSummary.overallPct}% paid off overall</span>
          {debtSummary.totalMinimumPayment > 0 && (
            <span>{formatCurrency(debtSummary.totalMinimumPayment, currency)}/mo minimum</span>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
