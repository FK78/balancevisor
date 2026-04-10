"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { CalendarClock } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { Subscription } from "@/db/queries/subscriptions";

interface DashboardBillTimelineProps {
  readonly renewals: Subscription[];
  readonly currency: string;
}

function daysUntil(dateStr: string): number {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const target = new Date(dateStr + "T00:00:00");
  return Math.ceil((target.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
}

interface DayGroup {
  readonly label: string;
  readonly sublabel: string;
  readonly items: Subscription[];
  readonly accent: string;
}

function groupByTimeWindow(renewals: Subscription[]): DayGroup[] {
  const today: Subscription[] = [];
  const tomorrow: Subscription[] = [];
  const thisWeek: Subscription[] = [];
  const later: Subscription[] = [];

  for (const r of renewals) {
    const days = daysUntil(r.next_billing_date);
    if (days <= 0) today.push(r);
    else if (days === 1) tomorrow.push(r);
    else if (days <= 7) thisWeek.push(r);
    else later.push(r);
  }

  const groups: DayGroup[] = [];

  if (today.length > 0) {
    groups.push({ label: "Today", sublabel: "Due now", items: today, accent: "bg-red-500" });
  }
  if (tomorrow.length > 0) {
    groups.push({ label: "Tomorrow", sublabel: "Due in 1 day", items: tomorrow, accent: "bg-amber-500" });
  }
  if (thisWeek.length > 0) {
    groups.push({ label: "This Week", sublabel: "2–7 days", items: thisWeek, accent: "bg-blue-500" });
  }
  if (later.length > 0) {
    groups.push({ label: "Later", sublabel: "8+ days", items: later, accent: "bg-muted-foreground" });
  }

  return groups;
}

export function DashboardBillTimeline({
  renewals,
  currency,
}: DashboardBillTimelineProps) {
  if (renewals.length === 0) return null;

  const groups = groupByTimeWindow(renewals);
  const total = renewals.reduce((s, r) => s + r.amount, 0);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <CalendarClock className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Bill Timeline</CardTitle>
              <CardDescription className="text-xs">
                {renewals.length} bill{renewals.length !== 1 ? "s" : ""} upcoming · {formatCurrency(total, currency)} total
              </CardDescription>
            </div>
          </div>
          <Link
            href="/dashboard/subscriptions"
            className="text-xs text-muted-foreground hover:text-foreground transition-colors"
          >
            View all
          </Link>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {groups.map((group) => (
          <div key={group.label} className="space-y-1.5">
            {/* Group header */}
            <div className="flex items-center gap-2">
              <span className={`h-2 w-2 rounded-full ${group.accent}`} />
              <span className="text-xs font-semibold">{group.label}</span>
              <span className="text-[10px] text-muted-foreground">{group.sublabel}</span>
            </div>

            {/* Timeline items */}
            <div className="ml-1 border-l-2 border-muted/40 pl-4 space-y-1">
              {group.items.map((item) => {
                const dateLabel = new Date(item.next_billing_date + "T00:00:00").toLocaleDateString(
                  "en-GB",
                  { weekday: "short", day: "numeric", month: "short" },
                );

                return (
                  <div
                    key={item.id}
                    className="flex items-center justify-between rounded-lg bg-secondary/40 px-3 py-2"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      {item.color && (
                        <span
                          className="h-2 w-2 shrink-0 rounded-full"
                          style={{ backgroundColor: item.color }}
                        />
                      )}
                      <span className="text-sm truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <span className="text-[10px] text-muted-foreground">
                        {dateLabel}
                      </span>
                      <span className="text-sm font-medium tabular-nums">
                        {formatCurrency(item.amount, currency)}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
