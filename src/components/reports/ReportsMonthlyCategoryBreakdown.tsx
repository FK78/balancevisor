"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  ChartConfig,
  ChartContainer,
  ChartLegend,
  ChartLegendContent,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatCurrency";
import { Area, AreaChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useMemo } from "react";
import { useReportsContext } from "@/components/reports/ReportsProvider";

export function ReportsMonthlyCategoryBreakdown() {
  const { monthlyCategoryStackData, stackedCategories, categoryColorMap, currency } =
    useReportsContext();

  const stackedConfig = useMemo(
    () =>
      Object.fromEntries(
        stackedCategories.map((cat) => [
          cat,
          { label: cat, color: categoryColorMap.get(cat) ?? "var(--color-chart-3)" },
        ]),
      ) as ChartConfig,
    [stackedCategories, categoryColorMap],
  );

  if (stackedCategories.length === 0) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Monthly Spending by Category</CardTitle>
        <CardDescription>
          How your category spending changes month-to-month.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={stackedConfig} className="min-h-[300px] w-full">
          <AreaChart data={monthlyCategoryStackData} accessibilityLayer margin={{ left: 8, right: 8, top: 8 }}>
            <CartesianGrid vertical={false} />
            <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} tickMargin={8} />
            <YAxis
              tickLine={false}
              axisLine={false}
              width={60}
              tickFormatter={(v) => formatCompactCurrency(Number(v), currency)}
            />
            <ChartTooltip
              cursor={false}
              content={
                <ChartTooltipContent
                  formatter={(value) => (
                    <span className="font-mono font-medium tabular-nums">
                      {formatCurrency(Number(value), currency)}
                    </span>
                  )}
                />
              }
            />
            <ChartLegend content={<ChartLegendContent />} />
            {stackedCategories.map((cat) => (
              <Area
                key={cat}
                type="monotone"
                dataKey={cat}
                stackId="1"
                fill={categoryColorMap.get(cat) ?? "var(--color-chart-3)"}
                stroke={categoryColorMap.get(cat) ?? "var(--color-chart-3)"}
                fillOpacity={0.6}
              />
            ))}
          </AreaChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
