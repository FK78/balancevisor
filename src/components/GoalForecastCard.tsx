import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  TrendingUp,
  Calendar,
  Target,
  AlertTriangle,
  CheckCircle2,
  Clock,
} from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import type { GoalForecast, GoalForecastStatus } from "@/lib/goal-forecast";

const statusConfig: Record<
  GoalForecastStatus,
  { label: string; badgeClass: string; icon: typeof CheckCircle2 }
> = {
  on_track: {
    label: "On track",
    badgeClass: "border-emerald-200 text-emerald-600 bg-emerald-500/5",
    icon: CheckCircle2,
  },
  at_risk: {
    label: "At risk",
    badgeClass: "border-amber-200 text-amber-600 bg-amber-500/5",
    icon: AlertTriangle,
  },
  behind: {
    label: "Behind",
    badgeClass: "border-red-200 text-red-600 bg-red-500/5",
    icon: AlertTriangle,
  },
  completed: {
    label: "Completed",
    badgeClass: "border-emerald-200 text-emerald-600 bg-emerald-500/5",
    icon: CheckCircle2,
  },
  no_deadline: {
    label: "No deadline",
    badgeClass: "border-zinc-200 text-zinc-500 bg-zinc-500/5",
    icon: Clock,
  },
};

function formatDate(dateStr: string): string {
  return new Date(dateStr + "T00:00:00").toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
  });
}

function formatMonths(months: number): string {
  if (months < 1) return "< 1 month";
  if (months === 1) return "1 month";
  if (months < 12) return `${months} months`;
  const years = Math.floor(months / 12);
  const rem = months % 12;
  if (rem === 0) return `${years} year${years !== 1 ? "s" : ""}`;
  return `${years}y ${rem}mo`;
}

export function GoalForecastCard({
  forecasts,
  currency,
}: {
  forecasts: GoalForecast[];
  currency: string;
}) {
  const activeForecasts = forecasts.filter((f) => f.status !== "completed");

  if (activeForecasts.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-500/10">
            <TrendingUp className="h-4 w-4 text-indigo-600" />
          </div>
          <div>
            <CardTitle className="text-base">Goal Forecasting</CardTitle>
            <CardDescription className="text-xs">
              Projected completion based on your avg savings of{" "}
              {formatCurrency(activeForecasts[0]?.avgMonthlySavings ?? 0, currency)}/mo
            </CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {activeForecasts.map((forecast) => {
          const config = statusConfig[forecast.status];
          const StatusIcon = config.icon;

          return (
            <div
              key={forecast.goalId}
              className="rounded-lg border border-border/50 px-3 py-3 space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 min-w-0">
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
                    style={{ backgroundColor: forecast.goalColor + "15" }}
                  >
                    <Target
                      className="h-3.5 w-3.5"
                      style={{ color: forecast.goalColor }}
                    />
                  </div>
                  <span className="text-sm font-medium truncate">
                    {forecast.goalName}
                  </span>
                </div>
                <Badge
                  variant="outline"
                  className={`text-[10px] gap-1 shrink-0 ${config.badgeClass}`}
                >
                  <StatusIcon className="h-2.5 w-2.5" />
                  {config.label}
                </Badge>
              </div>

              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs sm:grid-cols-4">
                <div>
                  <span className="text-muted-foreground">Remaining</span>
                  <p className="font-medium tabular-nums">
                    {formatCurrency(forecast.remaining, currency)}
                  </p>
                </div>

                {forecast.estimatedMonths !== null && (
                  <div>
                    <span className="text-muted-foreground">Est. time</span>
                    <p className="font-medium tabular-nums">
                      {formatMonths(forecast.estimatedMonths)}
                    </p>
                  </div>
                )}

                {forecast.estimatedDate && (
                  <div>
                    <span className="text-muted-foreground flex items-center gap-1">
                      <Calendar className="h-2.5 w-2.5" />
                      Est. date
                    </span>
                    <p className="font-medium tabular-nums">
                      {formatDate(forecast.estimatedDate)}
                    </p>
                  </div>
                )}

                {forecast.targetDate && forecast.requiredMonthlySavings !== null && (
                  <div>
                    <span className="text-muted-foreground">Needed/mo</span>
                    <p
                      className={`font-medium tabular-nums ${
                        forecast.status === "behind"
                          ? "text-red-600"
                          : forecast.status === "at_risk"
                            ? "text-amber-600"
                            : ""
                      }`}
                    >
                      {formatCurrency(forecast.requiredMonthlySavings, currency)}
                    </p>
                  </div>
                )}
              </div>

              {forecast.targetDate && forecast.monthsUntilDeadline !== null && (
                <p className="text-[11px] text-muted-foreground">
                  Deadline: {formatDate(forecast.targetDate)} ({formatMonths(forecast.monthsUntilDeadline)} away)
                  {forecast.estimatedMonths !== null && forecast.estimatedMonths > forecast.monthsUntilDeadline && (
                    <span className="text-red-500 font-medium">
                      {" "}— at current rate you&apos;ll be ~{formatMonths(forecast.estimatedMonths - forecast.monthsUntilDeadline)} late
                    </span>
                  )}
                </p>
              )}

              {forecast.avgMonthlySavings <= 0 && (
                <p className="text-[11px] text-amber-600">
                  Your recent months show no net savings — start saving to see a projection.
                </p>
              )}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
