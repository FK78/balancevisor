import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import {
  getDaysLabel,
  getDaysUntil,
  getUpcomingBillsDecisionSummary,
} from "@/components/dashboard/dashboard-decision";
import type { Subscription } from "@/db/queries/subscriptions";

export function DashboardUpcomingBills({
  renewals,
  currency,
}: {
  renewals: Subscription[];
  currency: string;
}) {
  if (renewals.length === 0) return null;

  const total = renewals.reduce((s, r) => s + r.amount, 0);
  const summary = getUpcomingBillsDecisionSummary({ renewals, currency });

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <CalendarDays className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm font-semibold">Upcoming Bills</span>
            </div>
            <p className="text-base font-semibold tracking-tight">{summary.title}</p>
            <p className="text-sm text-muted-foreground">{summary.summary}</p>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
          >
            {summary.actionLabel}
          </Link>
        </div>
        <div className="space-y-2">
          {renewals.map((r) => {
            const days = getDaysUntil(r.next_billing_date);
            return (
              <div
                key={r.id}
                className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2.5"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  {r.color && (
                    <span
                      className="h-2 w-2 shrink-0 rounded-full"
                      style={{ backgroundColor: r.color }}
                    />
                  )}
                  <span className="text-sm truncate">{r.name}</span>
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  <span
                    className={`text-xs ${
                      days <= 0
                        ? "font-semibold text-rose-600"
                        : "text-muted-foreground"
                    }`}
                  >
                    {getDaysLabel(days)}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {formatCurrency(r.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-3 flex justify-end">
          <span className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(total, currency)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
