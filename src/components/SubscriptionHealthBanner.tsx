"use client";

import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  AlertTriangle,
  CircleDollarSign,
  Layers,
  Scissors,
  ShieldCheck,
  TrendingUp,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { SubscriptionHealthReport } from "@/lib/subscription-health";

export function SubscriptionHealthBanner({
  report,
  currency,
}: {
  readonly report: SubscriptionHealthReport;
  readonly currency: string;
}) {
  const { billIncreases, unusedSubscriptions, overlaps, potentialMonthlySavings } = report;
  const totalIssues = billIncreases.length + unusedSubscriptions.length + overlaps.length;

  if (totalIssues === 0) {
    return (
      <Card className="border-emerald-200/50 dark:border-emerald-800/50">
        <CardContent className="flex items-center gap-3 py-4">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-emerald-500/10">
            <ShieldCheck className="h-4 w-4 text-emerald-600" />
          </div>
          <div>
            <p className="text-sm font-medium">Subscriptions look healthy</p>
            <p className="text-xs text-muted-foreground">
              No price increases, unused services, or overlaps detected.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Subscription Health</CardTitle>
              <p className="text-xs text-muted-foreground">
                {totalIssues} issue{totalIssues !== 1 ? "s" : ""} found
                {potentialMonthlySavings > 0 && (
                  <> — save up to <span className="font-semibold text-emerald-600">{formatCurrency(potentialMonthlySavings, currency)}/mo</span></>
                )}
              </p>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {billIncreases.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <TrendingUp className="h-3.5 w-3.5 text-red-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-red-600">
                Price Increases ({billIncreases.length})
              </span>
            </div>
            {billIncreases.map((inc) => (
              <div
                key={inc.subscriptionId}
                className="flex items-center justify-between rounded-lg border border-red-200/50 bg-red-50/30 px-3 py-2 dark:border-red-800/30 dark:bg-red-900/10"
              >
                <div>
                  <p className="text-sm font-medium">{inc.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {formatCurrency(inc.previousAmount, currency)} → {formatCurrency(inc.currentAmount, currency)} / {inc.billingCycle}
                  </p>
                </div>
                <Badge variant="destructive" className="text-xs">
                  +{inc.increasePercent}%
                </Badge>
              </div>
            ))}
          </div>
        )}

        {unusedSubscriptions.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Scissors className="h-3.5 w-3.5 text-amber-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-amber-600">
                Potentially Unused ({unusedSubscriptions.length})
              </span>
            </div>
            {unusedSubscriptions.map((sub) => (
              <div
                key={sub.subscriptionId}
                className="flex items-center justify-between rounded-lg border border-amber-200/50 bg-amber-50/30 px-3 py-2 dark:border-amber-800/30 dark:bg-amber-900/10"
              >
                <div>
                  <p className="text-sm font-medium">{sub.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {sub.daysSinceLastTransaction === -1
                      ? "Never used"
                      : `Not used in ${sub.daysSinceLastTransaction} days`}
                  </p>
                </div>
                <div className="flex items-center gap-1.5">
                  <CircleDollarSign className="h-3.5 w-3.5 text-muted-foreground" />
                  <span className="text-sm font-medium">{formatCurrency(sub.monthlyAmount, currency)}/mo</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {overlaps.length > 0 && (
          <div className="space-y-2">
            <div className="flex items-center gap-1.5">
              <Layers className="h-3.5 w-3.5 text-blue-500" />
              <span className="text-xs font-semibold uppercase tracking-wider text-blue-600">
                Category Overlaps ({overlaps.length})
              </span>
            </div>
            {overlaps.map((overlap) => (
              <div
                key={overlap.category}
                className="flex items-center justify-between rounded-lg border border-blue-200/50 bg-blue-50/30 px-3 py-2 dark:border-blue-800/30 dark:bg-blue-900/10"
              >
                <div>
                  <p className="text-sm font-medium">{overlap.category}</p>
                  <p className="text-xs text-muted-foreground">
                    {overlap.subscriptions.map((s) => s.name).join(", ")}
                  </p>
                </div>
                <span className="text-sm font-medium">{formatCurrency(overlap.totalMonthly, currency)}/mo</span>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
