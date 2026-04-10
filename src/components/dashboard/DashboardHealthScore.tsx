"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { HeartPulse } from "lucide-react";
import type { HealthScoreResult } from "@/lib/financial-health-score";

const GRADE_COLORS: Record<HealthScoreResult["grade"], string> = {
  A: "text-emerald-500",
  B: "text-blue-500",
  C: "text-amber-500",
  D: "text-orange-500",
  F: "text-red-500",
};

const GRADE_BG: Record<HealthScoreResult["grade"], string> = {
  A: "from-emerald-500",
  B: "from-blue-500",
  C: "from-amber-500",
  D: "from-orange-500",
  F: "from-red-500",
};

interface DashboardHealthScoreProps {
  readonly healthScore: HealthScoreResult;
}

export function DashboardHealthScore({ healthScore }: DashboardHealthScoreProps) {
  const { overall, grade, subScores } = healthScore;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <HeartPulse className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Financial Health</CardTitle>
            <CardDescription className="text-xs">
              Composite score based on 5 financial indicators
            </CardDescription>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Score ring */}
        <div className="flex items-center gap-5">
          <div className="relative flex h-20 w-20 shrink-0 items-center justify-center">
            <svg className="h-full w-full -rotate-90" viewBox="0 0 36 36">
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                className="text-muted/30"
              />
              <circle
                cx="18" cy="18" r="15.9"
                fill="none"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeDasharray={`${overall}, 100`}
                className={`${GRADE_COLORS[grade]}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className={`text-xl font-bold tabular-nums ${GRADE_COLORS[grade]}`}>
                {overall}
              </span>
              <span className="text-[10px] text-muted-foreground">/100</span>
            </div>
          </div>

          <div>
            <div className="flex items-baseline gap-2">
              <span className={`text-3xl font-bold ${GRADE_COLORS[grade]}`}>{grade}</span>
              <span className="text-sm text-muted-foreground">
                {grade === "A" ? "Excellent" : grade === "B" ? "Good" : grade === "C" ? "Fair" : grade === "D" ? "Needs Work" : "Critical"}
              </span>
            </div>
          </div>
        </div>

        {/* Sub-scores */}
        <div className="space-y-2.5">
          {subScores.map((sub) => {
            const pct = sub.maxScore > 0 ? (sub.score / sub.maxScore) * 100 : 0;
            return (
              <div key={sub.label} className="space-y-1">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-medium">{sub.label}</span>
                  <span className="text-muted-foreground">
                    {sub.score}/{sub.maxScore} — {sub.description}
                  </span>
                </div>
                <div className="h-1.5 w-full rounded-full bg-muted/40">
                  <div
                    className={`h-full rounded-full bg-gradient-to-r ${GRADE_BG[grade]} to-transparent`}
                    style={{ width: `${Math.min(100, pct)}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
