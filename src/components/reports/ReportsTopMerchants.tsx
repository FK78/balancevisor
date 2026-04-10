import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Store } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { TopMerchant } from "@/db/queries/merchant-spend";

const COLORS = [
  "#6366f1", "#f43f5e", "#f59e0b", "#10b981", "#3b82f6",
  "#8b5cf6", "#ec4899", "#14b8a6", "#f97316", "#06b6d4",
];

export function ReportsTopMerchants({
  merchants,
  currency,
}: {
  readonly merchants: readonly TopMerchant[];
  readonly currency: string;
}) {
  if (merchants.length === 0) return null;

  const maxTotal = merchants[0]?.total ?? 1;

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
            <Store className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base">Top Merchants</CardTitle>
            <CardDescription>Where you spend the most this month</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {merchants.map((m, i) => {
            const pct = maxTotal > 0 ? (m.total / maxTotal) * 100 : 0;
            const color = COLORS[i % COLORS.length];
            return (
              <div key={m.merchant} className="flex items-center gap-3">
                <span className="text-muted-foreground text-sm font-medium w-5 text-right">
                  {i + 1}
                </span>
                <span
                  className="inline-block h-3 w-3 shrink-0 rounded-full"
                  style={{ backgroundColor: color }}
                />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm font-medium truncate">{m.merchant}</span>
                    <div className="flex items-center gap-2 ml-2">
                      <span className="text-xs text-muted-foreground">{m.txnCount} txn{m.txnCount !== 1 ? "s" : ""}</span>
                      <span className="text-sm font-semibold tabular-nums">
                        {formatCurrency(m.total, currency)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-muted h-1.5 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: color }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
