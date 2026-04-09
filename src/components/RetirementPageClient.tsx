"use client";

import { useState, useTransition } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Timer,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  Target,
  Pencil,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Area,
  AreaChart,
  CartesianGrid,
  XAxis,
  YAxis,
  ReferenceLine,
} from "recharts";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { upsertRetirementProfile } from "@/db/mutations/retirement";
import { RetirementAIAdvisor } from "@/components/RetirementAIAdvisor";
import { formatCompactCurrency } from "@/lib/formatCurrency";
import type { RetirementProfile } from "@/db/queries/retirement";
import type { RetirementProjection } from "@/lib/retirement-calculator";

const chartConfig = {
  projectedFund: { label: "Projected Fund", color: "var(--color-chart-1)" },
  requiredFund: { label: "Required Fund", color: "var(--color-chart-4)" },
} satisfies ChartConfig;

interface RetirementPageClientProps {
  readonly profile: RetirementProfile | null;
  readonly projection: RetirementProjection | null;
  readonly baseCurrency: string;
}

function RetirementProfileForm({
  profile,
  onClose,
}: {
  profile: RetirementProfile | null;
  onClose?: () => void;
}) {
  const [isPending, startTransition] = useTransition();

  return (
    <form
      action={(formData) => {
        startTransition(async () => {
          await upsertRetirementProfile(formData);
          onClose?.();
        });
      }}
      className="space-y-4"
    >
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="current_age">Current Age</Label>
          <Input
            id="current_age"
            name="current_age"
            type="number"
            min={16}
            max={100}
            required
            defaultValue={profile?.current_age ?? ""}
            placeholder="30"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="target_retirement_age">Target Retirement Age</Label>
          <Input
            id="target_retirement_age"
            name="target_retirement_age"
            type="number"
            min={17}
            max={120}
            required
            defaultValue={profile?.target_retirement_age ?? 65}
            placeholder="65"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="desired_annual_spending">
            Desired Annual Spending in Retirement
          </Label>
          <Input
            id="desired_annual_spending"
            name="desired_annual_spending"
            type="number"
            min={0}
            step="100"
            required
            defaultValue={profile?.desired_annual_spending ?? ""}
            placeholder="30000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_pension_annual">
            Expected Pension (Annual)
          </Label>
          <Input
            id="expected_pension_annual"
            name="expected_pension_annual"
            type="number"
            min={0}
            step="100"
            defaultValue={profile?.expected_pension_annual ?? 0}
            placeholder="10000"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="expected_investment_return">
            Expected Return (%)
          </Label>
          <Input
            id="expected_investment_return"
            name="expected_investment_return"
            type="number"
            min={-10}
            max={30}
            step="0.1"
            defaultValue={profile?.expected_investment_return ?? 5.0}
            placeholder="5.0"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="inflation_rate">Inflation Rate (%)</Label>
          <Input
            id="inflation_rate"
            name="inflation_rate"
            type="number"
            min={0}
            max={20}
            step="0.1"
            defaultValue={profile?.inflation_rate ?? 2.5}
            placeholder="2.5"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="life_expectancy">Life Expectancy</Label>
          <Input
            id="life_expectancy"
            name="life_expectancy"
            type="number"
            min={50}
            max={120}
            defaultValue={profile?.life_expectancy ?? 90}
            placeholder="90"
          />
        </div>
      </div>
      <div className="flex justify-end gap-2 pt-2">
        <Button type="submit" disabled={isPending}>
          {isPending ? "Saving..." : profile ? "Update Profile" : "Create Profile"}
        </Button>
      </div>
    </form>
  );
}

function RetirementCountdown({
  projection,
  baseCurrency,
}: {
  projection: RetirementProjection;
  baseCurrency: string;
}) {
  const fmt = (n: number) => formatCompactCurrency(n, baseCurrency);

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-primary/10">
              <Timer className="h-5 w-5 text-primary" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Estimated Retirement</p>
              <p className="text-2xl font-bold">Age {projection.estimatedRetirementAge}</p>
              <p className="text-xs text-muted-foreground">
                {projection.yearsToRetirement} years from now
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
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
              <p className="text-sm text-muted-foreground">Target Age {projection.targetRetirementAge}</p>
              <p className="text-2xl font-bold">
                {projection.canRetireOnTarget ? "On Track" : "Off Track"}
              </p>
              <p className="text-xs text-muted-foreground">
                {projection.fundProgress}% funded
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-1/10">
              <TrendingUp className="h-5 w-5 text-chart-1" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Projected Fund</p>
              <p className="text-2xl font-bold">{fmt(projection.projectedFundAtTarget)}</p>
              <p className="text-xs text-muted-foreground">
                at age {projection.targetRetirementAge}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-chart-4/10">
              <Target className="h-5 w-5 text-chart-4" />
            </div>
            <div>
              <p className="text-sm text-muted-foreground">Required Fund</p>
              <p className="text-2xl font-bold">{fmt(projection.requiredFundAtTarget)}</p>
              <p className="text-xs text-muted-foreground">
                {projection.fundGap > 0
                  ? `${fmt(projection.fundGap)} shortfall`
                  : "Fully funded"}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

function RetirementProjectionChart({
  projection,
  baseCurrency,
}: {
  projection: RetirementProjection;
  baseCurrency: string;
}) {
  const fmt = (n: number) => formatCompactCurrency(n, baseCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Worth Projection</CardTitle>
        <CardDescription>
          Projected fund growth vs required retirement fund over time
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={chartConfig} className="h-[300px] w-full">
          <AreaChart
            data={projection.yearlyProjection as unknown as Record<string, unknown>[]}
            margin={{ top: 10, right: 10, left: 0, bottom: 0 }}
          >
            <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
            <XAxis
              dataKey="age"
              tickLine={false}
              axisLine={false}
              className="text-xs"
              tickFormatter={(v) => `${v}`}
            />
            <YAxis
              tickLine={false}
              axisLine={false}
              className="text-xs"
              tickFormatter={(v) => fmt(v)}
              width={70}
            />
            <ChartTooltip
              content={
                <ChartTooltipContent
                  formatter={(value) => fmt(Number(value))}
                />
              }
            />
            <ReferenceLine
              x={projection.targetRetirementAge}
              stroke="var(--color-chart-5)"
              strokeDasharray="4 4"
              label={{ value: "Target", position: "top", fontSize: 11 }}
            />
            <Area
              type="monotone"
              dataKey="projectedFund"
              stroke="var(--color-chart-1)"
              fill="var(--color-chart-1)"
              fillOpacity={0.15}
              strokeWidth={2}
              name="Projected Fund"
            />
            <Area
              type="monotone"
              dataKey="requiredFund"
              stroke="var(--color-chart-4)"
              fill="var(--color-chart-4)"
              fillOpacity={0.08}
              strokeWidth={2}
              strokeDasharray="4 4"
              name="Required Fund"
            />
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}

function RetirementScenarios({
  projection,
}: {
  projection: RetirementProjection;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>What-If Scenarios</CardTitle>
        <CardDescription>
          See how changes affect your retirement timeline
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          {projection.scenarios.map((scenario) => {
            const diff = projection.estimatedRetirementAge - scenario.estimatedRetirementAge;
            return (
              <div
                key={scenario.label}
                className="rounded-lg border p-4 space-y-2"
              >
                <p className="font-medium text-sm">{scenario.label}</p>
                <p className="text-xs text-muted-foreground">
                  {scenario.description}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">
                    Age {scenario.estimatedRetirementAge}
                  </span>
                  {diff > 0 && (
                    <span className="rounded-full bg-green-500/10 px-2 py-0.5 text-xs font-medium text-green-600">
                      {diff}y earlier
                    </span>
                  )}
                  {diff < 0 && (
                    <span className="rounded-full bg-red-500/10 px-2 py-0.5 text-xs font-medium text-red-600">
                      {Math.abs(diff)}y later
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}

function FinancialSnapshot({
  projection,
  baseCurrency,
}: {
  projection: RetirementProjection;
  baseCurrency: string;
}) {
  const fmt = (n: number) => formatCompactCurrency(n, baseCurrency);

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Financial Snapshot</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <p className="text-xs text-muted-foreground">Net Worth</p>
            <p className="text-lg font-semibold">{fmt(projection.currentNetWorth)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Monthly Savings</p>
            <p className="text-lg font-semibold">{fmt(projection.monthlySavings)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Annual Savings</p>
            <p className="text-lg font-semibold">{fmt(projection.annualSavings)}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Savings Rate</p>
            <p className="text-lg font-semibold">{projection.savingsRate}%</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function SetupView() {
  return (
    <div className="mx-auto max-w-2xl space-y-6 px-4 py-6 md:px-10 md:py-10">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Retirement Planner
        </h1>
        <p className="text-muted-foreground mt-0.5 text-sm">
          Set up your retirement profile to get started
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Your Retirement Profile</CardTitle>
          <CardDescription>
            Tell us about your retirement goals so we can estimate when you can retire
            and what changes would help.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <RetirementProfileForm profile={null} />
        </CardContent>
      </Card>
    </div>
  );
}

export function RetirementPageClient({
  profile,
  projection,
  baseCurrency,
}: RetirementPageClientProps) {
  const [editOpen, setEditOpen] = useState(false);

  if (!profile || !projection) {
    return <SetupView />;
  }

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Retirement Planner
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">
            Estimate when you can retire based on your financial data
          </p>
        </div>
        <Dialog open={editOpen} onOpenChange={setEditOpen}>
          <DialogTrigger asChild>
            <Button size="sm" variant="outline" className="gap-1.5">
              <Pencil className="h-3.5 w-3.5" />
              Edit Profile
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>Edit Retirement Profile</DialogTitle>
            </DialogHeader>
            <RetirementProfileForm
              profile={profile}
              onClose={() => setEditOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>

      <RetirementCountdown projection={projection} baseCurrency={baseCurrency} />

      {/* Progress bar */}
      <Card>
        <CardContent className="pt-6">
          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="text-muted-foreground">Fund progress at target age</span>
              <span className="font-medium">{projection.fundProgress}%</span>
            </div>
            <div className="h-3 w-full overflow-hidden rounded-full bg-muted">
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
        </CardContent>
      </Card>

      <FinancialSnapshot projection={projection} baseCurrency={baseCurrency} />

      <RetirementProjectionChart projection={projection} baseCurrency={baseCurrency} />

      <RetirementScenarios projection={projection} />

      <RetirementAIAdvisor />
    </div>
  );
}
