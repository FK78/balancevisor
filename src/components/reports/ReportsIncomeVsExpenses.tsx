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
import { formatMonthLabel } from "@/lib/date";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis } from "recharts";
import { useReportsContext } from "@/components/reports/ReportsProvider";

const incomeExpenseConfig = {
  income: { label: "Income", color: "var(--color-chart-2)" },
  expenses: { label: "Expenses", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function ReportsIncomeVsExpenses() {
  const { filteredTrend, range, currency } = useReportsContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Income vs Expenses by Month</CardTitle>
        <CardDescription>
          Monthly comparison for the last {range} months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <ChartContainer config={incomeExpenseConfig} className="min-h-[280px] w-full">
          <BarChart
            data={filteredTrend.map((p) => ({ ...p, monthLabel: formatMonthLabel(p.month) }))}
            accessibilityLayer
            margin={{ left: 8, right: 8, top: 8 }}
          >
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
            <Bar dataKey="income" fill="var(--color-income)" radius={4} />
            <Bar dataKey="expenses" fill="var(--color-expenses)" radius={4} />
          </BarChart>
        </ChartContainer>
      </CardContent>
    </Card>
  );
}
