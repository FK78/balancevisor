import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { TrendingUp, TrendingDown, ArrowRight, Calendar } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { CashflowForecast } from "@/lib/cashflow-forecast";
import Link from "next/link";

const confidenceLabel = {
  high: { text: "High confidence", className: "border-emerald-200 text-emerald-600" },
  medium: { text: "Medium confidence", className: "border-amber-200 text-amber-600" },
  low: { text: "Low — needs more data", className: "border-red-200 text-red-600" },
} as const;

export function DashboardCashflowForecast({ forecast }: { forecast: CashflowForecast }) {
  const c = forecast.baseCurrency;
  const conf = confidenceLabel[forecast.confidence];
  const netPositive = forecast.projectedNet >= 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10">
              <Calendar className="h-4 w-4 text-sky-600" />
            </div>
            <div>
              <CardTitle className="text-base">Cash Flow Forecast</CardTitle>
              <CardDescription className="text-xs">
                {forecast.periodLabel} — {forecast.daysRemaining} day{forecast.daysRemaining !== 1 ? "s" : ""} remaining
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className={`text-[10px] ${conf.className}`}>
            {conf.text}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Projected totals */}
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-lg border px-3 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Income</p>
            <p className="text-lg font-bold tabular-nums text-emerald-600">
              {formatCurrency(forecast.projectedIncome, c)}
            </p>
            {forecast.actualIncome > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {formatCurrency(forecast.actualIncome, c)} so far
              </p>
            )}
          </div>
          <div className="rounded-lg border px-3 py-2.5 text-center">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expenses</p>
            <p className="text-lg font-bold tabular-nums text-red-600">
              {formatCurrency(forecast.projectedExpenses, c)}
            </p>
            {forecast.actualExpenses > 0 && (
              <p className="text-[10px] text-muted-foreground">
                {formatCurrency(forecast.actualExpenses, c)} so far
              </p>
            )}
          </div>
          <div className={`rounded-lg border px-3 py-2.5 text-center ${netPositive ? "bg-emerald-500/5 border-emerald-200" : "bg-red-500/5 border-red-200"}`}>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Net</p>
            <p className={`text-lg font-bold tabular-nums ${netPositive ? "text-emerald-600" : "text-red-600"}`}>
              {netPositive ? "+" : "−"}{formatCurrency(Math.abs(forecast.projectedNet), c)}
            </p>
          </div>
        </div>

        {/* Breakdown */}
        {forecast.breakdown.length > 0 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Expected Components</p>
            {forecast.breakdown.slice(0, 6).map((item) => (
              <div key={item.label} className="flex items-center justify-between text-sm">
                <div className="flex items-center gap-2 min-w-0">
                  {item.type === "income" ? (
                    <TrendingUp className="h-3 w-3 shrink-0 text-emerald-500" />
                  ) : (
                    <TrendingDown className="h-3 w-3 shrink-0 text-red-500" />
                  )}
                  <span className="truncate text-muted-foreground">{item.label}</span>
                </div>
                <span className={`tabular-nums font-medium shrink-0 ml-2 ${item.type === "income" ? "text-emerald-600" : "text-red-600"}`}>
                  {item.type === "income" ? "+" : "−"}{formatCurrency(item.amount, c)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Recent months mini comparison */}
        {forecast.recentMonths.length > 1 && (
          <div className="space-y-1.5">
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">Recent Months</p>
            <div className="grid grid-cols-4 gap-2">
              {forecast.recentMonths.map((m) => {
                const label = new Intl.DateTimeFormat("en-GB", { month: "short" }).format(
                  new Date(m.month + "-01T00:00:00"),
                );
                return (
                  <div key={m.month} className="text-center">
                    <p className="text-[10px] text-muted-foreground">{label}</p>
                    <p className={`text-xs font-semibold tabular-nums ${m.net >= 0 ? "text-emerald-600" : "text-red-600"}`}>
                      {m.net >= 0 ? "+" : "−"}{formatCurrency(Math.abs(m.net), c)}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        <Link
          href="/dashboard/recurring"
          className="flex items-center justify-center gap-1 text-xs font-medium text-primary hover:underline pt-1"
        >
          View recurring transactions <ArrowRight className="h-3 w-3" />
        </Link>
      </CardContent>
    </Card>
  );
}
