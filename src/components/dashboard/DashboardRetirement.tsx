"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Timer, ArrowRight, CheckCircle2, AlertTriangle } from "lucide-react";
import { formatCompactCurrency } from "@/lib/formatCurrency";
import { getRetirementTakeaway } from "@/components/dashboard/dashboard-decision";
import type { RetirementProjection } from "@/lib/retirement-calculator";

interface DashboardRetirementProps {
  readonly projection: RetirementProjection | null;
  readonly hasProfile: boolean;
  readonly baseCurrency: string;
}

export function DashboardRetirement({
  projection,
  hasProfile,
  baseCurrency,
}: DashboardRetirementProps) {
  const fmt = (n: number) => formatCompactCurrency(n, baseCurrency);

  if (!hasProfile || !projection) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Timer className="h-4 w-4 text-primary" />
            </div>
            <CardTitle className="text-lg">Retirement Planner</CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-sm text-muted-foreground">
            Estimate when you can retire based on your savings, investments, and spending trends.
          </p>
          <Button asChild size="sm" className="gap-1.5">
            <Link href="/dashboard/retirement">
              Set Up Plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="space-y-2">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
                <Timer className="h-4 w-4 text-primary" />
              </div>
              <CardTitle className="text-lg">Retirement</CardTitle>
            </div>
            <CardDescription className="max-w-md text-sm text-muted-foreground">
              {getRetirementTakeaway(projection, baseCurrency)}
            </CardDescription>
          </div>
          <Button asChild size="sm" variant="ghost" className="gap-1">
            <Link href="/dashboard/retirement">
              See retirement plan <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-10 w-10 items-center justify-center rounded-xl ${
            projection.canRetireOnTarget ? "bg-green-500/10" : "bg-amber-500/10"
          }`}>
            {projection.canRetireOnTarget ? (
              <CheckCircle2 className="h-5 w-5 text-green-600" />
            ) : (
              <AlertTriangle className="h-5 w-5 text-amber-600" />
            )}
          </div>
          <div>
            <p className="text-2xl font-bold">Age {projection.estimatedRetirementAge}</p>
            <p className="text-xs text-muted-foreground">
              {projection.yearsToRetirement} years to go
              {projection.canRetireOnTarget ? " — on track" : " — needs attention"}
            </p>
            <p className="mt-1 text-xs font-medium text-foreground">
              Target age {projection.targetRetirementAge}
            </p>
          </div>
        </div>

        {/* Progress bar */}
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">
              {fmt(projection.projectedFundAtTarget)} / {fmt(projection.requiredFundAtTarget)}
            </span>
            <span className="font-medium">{projection.fundProgress}%</span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
            <div
              className={`h-full rounded-full transition-all ${
                projection.fundProgress >= 100
                  ? "bg-green-500"
                  : projection.fundProgress >= 60
                    ? "bg-amber-500"
                    : "bg-red-500"
              }`}
              style={{ width: `${Math.min(100, projection.fundProgress)}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
            <p className="text-sm font-semibold">{fmt(projection.monthlySavings)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Savings Rate</p>
            <p className="text-sm font-semibold">{projection.savingsRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
