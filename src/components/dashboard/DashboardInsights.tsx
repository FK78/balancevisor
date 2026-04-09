"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  AlertTriangle,
  CalendarDays,
  PiggyBank,
  Tag,
  Target,
  X,
  Sparkles,
} from "lucide-react";
import type { Insight } from "@/db/queries/insights";

const iconMap = {
  "trending-up": TrendingUp,
  "alert-triangle": AlertTriangle,
  calendar: CalendarDays,
  "piggy-bank": PiggyBank,
  tag: Tag,
  target: Target,
} as const;

const variantStyles = {
  warning: "text-amber-600 dark:text-amber-400 bg-amber-500/10",
  info: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  success: "text-emerald-600 dark:text-emerald-400 bg-emerald-500/10",
} as const;

export function DashboardInsights({ insights }: { insights: Insight[] }) {
  const [dismissed, setDismissed] = useState<Set<string>>(new Set());

  const visible = insights.filter((i) => !dismissed.has(i.id));
  if (visible.length === 0) return null;

  function dismiss(id: string) {
    setDismissed((prev) => new Set(prev).add(id));
  }

  return (
    <Card>
      <CardContent className="py-4">
        <div className="mb-3 flex items-center gap-2">
          <Sparkles className="h-4 w-4 text-primary" />
          <span className="text-sm font-semibold">Insights</span>
        </div>
        <div className="space-y-2">
          {visible.map((insight) => {
            const Icon = iconMap[insight.icon];
            const style = variantStyles[insight.variant];
            return (
              <div
                key={insight.id}
                className="flex items-start gap-3 rounded-lg bg-secondary/40 px-3 py-2.5"
              >
                <div
                  className={`mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-md ${style}`}
                >
                  <Icon className="h-3.5 w-3.5" />
                </div>
                <div className="flex-1 min-w-0">
                  {insight.link ? (
                    <Link
                      href={insight.link}
                      className="text-sm hover:underline"
                    >
                      {insight.message}
                    </Link>
                  ) : (
                    <p className="text-sm">{insight.message}</p>
                  )}
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 shrink-0 text-muted-foreground hover:text-foreground"
                  onClick={() => dismiss(insight.id)}
                  aria-label="Dismiss insight"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
