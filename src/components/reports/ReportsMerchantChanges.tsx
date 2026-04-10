import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowUpRight, ArrowDownRight, Minus } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { MerchantMonthOverMonth } from "@/db/queries/merchant-spend";

export function ReportsMerchantChanges({
  changes,
  currency,
}: {
  readonly changes: readonly MerchantMonthOverMonth[];
  readonly currency: string;
}) {
  if (changes.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Merchant Changes</CardTitle>
        <CardDescription>
          Biggest spend changes vs last month
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {changes.map((c) => {
            const isUp = c.change > 0;
            const isFlat = c.change === 0;

            return (
              <div
                key={c.merchant}
                className="flex items-center justify-between rounded-lg border px-3 py-2"
              >
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium truncate">{c.merchant}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(c.previousMonth, currency)} → {formatCurrency(c.currentMonth, currency)}
                  </p>
                </div>
                <div className="flex items-center gap-1.5 shrink-0 ml-3">
                  {isFlat ? (
                    <Minus className="h-3.5 w-3.5 text-muted-foreground" />
                  ) : isUp ? (
                    <ArrowUpRight className="h-3.5 w-3.5 text-red-500" />
                  ) : (
                    <ArrowDownRight className="h-3.5 w-3.5 text-emerald-500" />
                  )}
                  <span
                    className={`text-sm font-semibold tabular-nums ${
                      isFlat
                        ? "text-muted-foreground"
                        : isUp
                          ? "text-red-600"
                          : "text-emerald-600"
                    }`}
                  >
                    {isUp ? "+" : ""}{formatCurrency(c.change, currency)}
                  </span>
                  {c.changePercent !== 0 && (
                    <span className="text-xs text-muted-foreground">
                      ({isUp ? "+" : ""}{c.changePercent}%)
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
