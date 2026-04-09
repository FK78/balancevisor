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
import { CartesianGrid, Line, LineChart, XAxis, YAxis } from "recharts";
import { useReportsContext } from "@/components/reports/ReportsProvider";

const netConfig = {
  net: { label: "Net", color: "var(--color-chart-4)" },
  cumulative: { label: "Cumulative", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function ReportsNetSavingsTrend() {
  const { cumulativeSavings, currency } = useReportsContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Net Savings Trend</CardTitle>
        <CardDescription>
          Monthly net and cumulative savings over time.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={netConfig} className="min-h-[260px] w-full">
          <LineChart data={cumulativeSavings} accessibilityLayer margin={{ left: 8, right: 8, top: 8 }}>
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
            <Line dataKey="net" stroke="var(--color-net)" strokeWidth={2} dot={{ r: 3 }} />
            <Line dataKey="cumulative" stroke="var(--color-cumulative)" strokeWidth={2} dot={{ r: 3 }} strokeDasharray="6 3" />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
