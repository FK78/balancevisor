"use client";

import { useMemo } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Flame } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { DailyCashflowPoint } from "@/db/queries/transactions";

const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

interface ReportsSpendingHeatmapProps {
  readonly dailyTrend: readonly DailyCashflowPoint[];
  readonly currency: string;
}

export function ReportsSpendingHeatmap({
  dailyTrend,
  currency,
}: ReportsSpendingHeatmapProps) {
  // Build grid: weeks (columns) × days-of-week (rows)
  const { grid, maxExpense } = useMemo(() => {
    // Group days into weeks (Mon-based)
    const weeks: { label: string; days: (DailyCashflowPoint | null)[] }[] = [];
    let currentWeek: (DailyCashflowPoint | null)[] = [];
    let weekLabel = "";

    for (const day of dailyTrend) {
      const d = new Date(day.day + "T00:00:00");
      const dow = (d.getDay() + 6) % 7; // Mon=0

      if (dow === 0 && currentWeek.length > 0) {
        weeks.push({ label: weekLabel, days: padWeek(currentWeek) });
        currentWeek = [];
      }

      if (currentWeek.length === 0) {
        weekLabel = d.toLocaleDateString("en-GB", { day: "numeric", month: "short" });
      }

      // Fill gaps
      while (currentWeek.length < dow) {
        currentWeek.push(null);
      }
      currentWeek.push(day);
    }

    if (currentWeek.length > 0) {
      weeks.push({ label: weekLabel, days: padWeek(currentWeek) });
    }

    const max = dailyTrend.reduce((m, d) => Math.max(m, d.expenses), 0);

    return {
      grid: weeks,
      maxExpense: max,
    };
  }, [dailyTrend]);

  if (dailyTrend.length === 0) {
    return null;
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-orange-500/10">
            <Flame className="h-4 w-4 text-orange-500" />
          </div>
          <div>
            <CardTitle className="text-base">Spending Heatmap</CardTitle>
            <CardDescription className="text-xs">
              Daily spending intensity over the last 90 days
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent>
        <div className="overflow-x-auto">
          <div className="inline-flex gap-0.5">
            {/* Day labels column */}
            <div className="flex flex-col gap-0.5 pr-1.5">
              {DAY_LABELS.map((label) => (
                <div
                  key={label}
                  className="flex h-4 w-7 items-center text-[10px] text-muted-foreground"
                >
                  {label}
                </div>
              ))}
            </div>

            {/* Week columns */}
            {grid.map((week, wi) => (
              <div key={wi} className="flex flex-col gap-0.5">
                {week.days.map((day, di) => (
                  <HeatCell
                    key={di}
                    day={day}
                    maxExpense={maxExpense}
                    currency={currency}
                  />
                ))}
              </div>
            ))}
          </div>
        </div>

        {/* Legend */}
        <div className="mt-3 flex items-center justify-between text-[10px] text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            {[0, 0.2, 0.4, 0.6, 0.8, 1].map((intensity) => (
              <div
                key={intensity}
                className="h-3 w-3 rounded-sm"
                style={{ backgroundColor: intensityToColor(intensity) }}
              />
            ))}
          </div>
          <span>More</span>
        </div>
      </CardContent>
    </Card>
  );
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function HeatCell({
  day,
  maxExpense,
  currency,
}: {
  day: DailyCashflowPoint | null;
  maxExpense: number;
  currency: string;
}) {
  if (!day) {
    return <div className="h-4 w-4 rounded-sm bg-muted/20" />;
  }

  const intensity = maxExpense > 0 ? day.expenses / maxExpense : 0;
  const bg = intensityToColor(intensity);

  const dateLabel = new Date(day.day + "T00:00:00").toLocaleDateString("en-GB", {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

  return (
    <div
      className="group relative h-4 w-4 rounded-sm cursor-default"
      style={{ backgroundColor: bg }}
    >
      <div className="pointer-events-none absolute bottom-full left-1/2 z-50 mb-1 hidden -translate-x-1/2 whitespace-nowrap rounded-md bg-popover px-2 py-1 text-[10px] text-popover-foreground shadow-md group-hover:block">
        <div className="font-medium">{dateLabel}</div>
        <div>Spent: {formatCurrency(day.expenses, currency)}</div>
      </div>
    </div>
  );
}

function intensityToColor(intensity: number): string {
  if (intensity === 0) return "hsl(var(--muted) / 0.15)";
  if (intensity < 0.25) return "hsl(142 71% 45% / 0.3)"; // green-light
  if (intensity < 0.5) return "hsl(142 71% 45% / 0.55)"; // green-mid
  if (intensity < 0.75) return "hsl(38 92% 50% / 0.6)";  // amber
  return "hsl(0 72% 51% / 0.7)"; // red
}

function padWeek(days: (DailyCashflowPoint | null)[]): (DailyCashflowPoint | null)[] {
  while (days.length < 7) {
    days.push(null);
  }
  return days;
}
