import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { RotateCcw } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { RefundSummary } from "@/db/queries/refund-tracking";

export function RefundSummaryCard({
  summary,
  currency,
}: {
  readonly summary: RefundSummary;
  readonly currency: string;
}) {
  if (summary.refundCount === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <RotateCcw className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Refunds This Month</CardTitle>
              <CardDescription>
                {summary.refundCount} refund{summary.refundCount !== 1 ? "s" : ""} totalling{" "}
                <span className="font-semibold text-emerald-600">
                  {formatCurrency(summary.totalRefunds, currency)}
                </span>
              </CardDescription>
            </div>
          </div>
          <Badge variant="outline" className="border-emerald-300 text-emerald-600 tabular-nums">
            +{formatCurrency(summary.totalRefunds, currency)}
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {summary.recentRefunds.map((r) => (
            <div
              key={r.id}
              className="flex items-center justify-between rounded-lg border px-3 py-2"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium truncate">
                  {r.merchantName ?? r.description ?? "Refund"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(r.date + "T00:00:00").toLocaleDateString("en-GB", {
                    day: "numeric",
                    month: "short",
                  })}
                </p>
              </div>
              <span className="text-sm font-semibold tabular-nums text-emerald-600 ml-3">
                +{formatCurrency(r.amount, currency)}
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
