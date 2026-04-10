"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Gauge } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { CashflowForecast } from "@/lib/cashflow-forecast";

interface DashboardExpenseVelocityProps {
  readonly forecast: CashflowForecast;
}

export function DashboardExpenseVelocity({
  forecast,
}: DashboardExpenseVelocityProps) {
  const {
    actualExpenses,
    projectedExpenses,
    avgMonthlyExpenses,
    daysRemaining,
    daysInMonth,
    baseCurrency,
  } = forecast;

  const dayOfMonth = daysInMonth - daysRemaining;
  const fractionElapsed = dayOfMonth / daysInMonth;

  // Expected expenses by this point based on average
  const expectedByNow = avgMonthlyExpenses * fractionElapsed;

  // Velocity: ratio of actual to expected. 1 = on pace, >1 = overspending
  const velocity = expectedByNow > 0 ? actualExpenses / expectedByNow : 0;
  const velocityPct = Math.min(velocity * 100, 200);

  // Determine status
  const status =
    velocity <= 0.85
      ? ("under" as const)
      : velocity <= 1.15
        ? ("on-pace" as const)
        : ("over" as const);

  const STATUS_CONFIG = {
    under: {
      label: "Under Budget Pace",
      color: "text-emerald-500",
      ring: "text-emerald-500",
      bg: "bg-emerald-500/10",
    },
    "on-pace": {
      label: "On Pace",
      color: "text-blue-500",
      ring: "text-blue-500",
      bg: "bg-blue-500/10",
    },
    over: {
      label: "Over Budget Pace",
      color: "text-red-500",
      ring: "text-red-500",
      bg: "bg-red-500/10",
    },
  };

  const cfg = STATUS_CONFIG[status];

  // Gauge arc: 180° semicircle
  const gaugeAngle = Math.min(180, (velocityPct / 200) * 180);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Gauge className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Expense Velocity</CardTitle>
            <CardDescription className="text-xs">
              Day {dayOfMonth} of {daysInMonth} — spending pace vs historical average
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Gauge */}
        <div className="flex justify-center">
          <div className="relative h-24 w-48">
            <svg viewBox="0 0 200 110" className="h-full w-full">
              {/* Background arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                stroke="currentColor"
                strokeWidth="12"
                strokeLinecap="round"
                className="text-muted/20"
              />
              {/* Filled arc */}
              <path
                d="M 10 100 A 90 90 0 0 1 190 100"
                fill="none"
                strokeWidth="12"
                strokeLinecap="round"
                strokeDasharray={`${(gaugeAngle / 180) * 283} 283`}
                className={cfg.ring}
              />
              {/* Centre labels */}
              <text
                x="100"
                y="85"
                textAnchor="middle"
                className={`fill-current text-2xl font-bold ${cfg.color}`}
                style={{ fontSize: "28px" }}
              >
                {(velocity * 100).toFixed(0)}%
              </text>
              <text
                x="100"
                y="102"
                textAnchor="middle"
                className="fill-current text-muted-foreground"
                style={{ fontSize: "11px" }}
              >
                of average pace
              </text>
            </svg>
          </div>
        </div>

        {/* Status badge */}
        <div className="flex justify-center">
          <span
            className={`rounded-full px-3 py-1 text-xs font-semibold ${cfg.bg} ${cfg.color}`}
          >
            {cfg.label}
          </span>
        </div>

        {/* Stats row */}
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-[10px] text-muted-foreground">Spent So Far</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(actualExpenses, baseCurrency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Expected By Now</p>
            <p className="text-sm font-semibold tabular-nums text-muted-foreground">
              {formatCurrency(expectedByNow, baseCurrency)}
            </p>
          </div>
          <div>
            <p className="text-[10px] text-muted-foreground">Projected Total</p>
            <p className="text-sm font-semibold tabular-nums">
              {formatCurrency(projectedExpenses, baseCurrency)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
