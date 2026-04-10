import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { AlertTriangle, TrendingUp } from "lucide-react";
import { formatCurrency } from "@/lib/formatCurrency";
import { getAnomalyDecisionSummary } from "@/components/dashboard/dashboard-decision";
import type { SpendingAnomaly } from "@/lib/spending-anomalies";

export function DashboardAnomalies({
  anomalies,
  currency,
}: {
  anomalies: SpendingAnomaly[];
  currency: string;
}) {
  if (anomalies.length === 0) return null;

  const summary = getAnomalyDecisionSummary({ anomalies, currency });

  return (
    <Card className="border-amber-500/20">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-500/10">
              <AlertTriangle className="h-4 w-4 text-amber-600" />
            </div>
            <div>
              <CardTitle className="text-base">Spending Warnings</CardTitle>
              <CardDescription className="text-xs">
                {summary.title}
              </CardDescription>
              <p className="mt-2 text-sm text-muted-foreground">{summary.summary}</p>
            </div>
          </div>
          <Button asChild size="sm" variant="ghost">
            <Link href="/dashboard/categories">{summary.actionLabel}</Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-2.5">
        {anomalies.map((a) => (
          <div
            key={a.category}
            className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5"
          >
            <div
              className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg"
              style={{ backgroundColor: a.color + "15" }}
            >
              <span
                className="inline-block h-3 w-3 rounded-full"
                style={{ backgroundColor: a.color }}
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-medium truncate">{a.category}</span>
                <Badge
                  variant="outline"
                  className="text-[10px] gap-1 shrink-0 border-amber-200 text-amber-600 bg-amber-500/5"
                >
                  <TrendingUp className="h-2.5 w-2.5" />
                  +{a.pctAbove}%
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground">
                {formatCurrency(a.currentSpend, currency)} this month vs {formatCurrency(a.avgSpend, currency)} avg
                <span className="font-medium text-amber-600">
                  {" "}(+{formatCurrency(a.increaseAmount, currency)})
                </span>
              </p>
            </div>
            <Link
              href="/dashboard/categories"
              className="shrink-0 text-xs font-medium text-amber-700 transition-colors hover:text-amber-800"
            >
              Review now
            </Link>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
