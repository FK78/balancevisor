import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { CalendarDays } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Subscription } from "@/db/queries/subscriptions";

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

function daysLabel(days: number): string {
  if (days === 0) return "Today";
  if (days === 1) return "Tomorrow";
  return `In ${days} days`;
}

export function DashboardUpcomingBills({
  renewals,
  currency,
}: {
  renewals: Subscription[];
  currency: string;
}) {
  if (renewals.length === 0) return null;

  const total = renewals.reduce((s, r) => s + r.amount, 0);

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CalendarDays className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-semibold">Upcoming Bills</span>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
        <div className="space-y-2">
          {renewals.map((r) => {
            const days = daysUntil(r.next_billing_date);
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
                  <span className="text-xs text-muted-foreground">
                    {daysLabel(days)}
                  </span>
                  <span className="text-sm font-medium tabular-nums">
                    {formatCurrency(r.amount, currency)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
        <div className="mt-2 flex justify-end">
          <span className="text-xs text-muted-foreground">
            Total: <span className="font-medium text-foreground">{formatCurrency(total, currency)}</span>
          </span>
        </div>
      </CardContent>
    </Card>
  );
}
