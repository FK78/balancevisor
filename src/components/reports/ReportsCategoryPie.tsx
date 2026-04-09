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
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { formatCurrency } from "@/lib/formatCurrency";
import { Cell, Pie, PieChart } from "recharts";
import { useReportsContext } from "@/components/reports/ReportsProvider";

const categoryConfig = {
  spend: { label: "Spend", color: "var(--color-chart-1)" },
} satisfies ChartConfig;

export function ReportsCategoryPie() {
  const { categoryPieData, categoryTotal, range, currency } = useReportsContext();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Spending by Category</CardTitle>
        <CardDescription>
          Expense breakdown for the last {range} months.
        </CardDescription>
      </CardHeader>
      <CardContent>
        {categoryPieData.length === 0 ? (
          <div className="text-muted-foreground flex min-h-[260px] items-center justify-center text-sm">
            No expense data in this range.
          </div>
        ) : (
          <>
            <ChartContainer config={categoryConfig} className="min-h-[260px] w-full">
              <PieChart accessibilityLayer>
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
                <Pie
                  data={categoryPieData}
                  dataKey="total"
                  nameKey="category"
                  innerRadius={55}
                  outerRadius={95}
                  strokeWidth={2}
                >
                  {categoryPieData.map((item) => (
                    <Cell key={item.category} fill={item.fill} />
                  ))}
                </Pie>
              </PieChart>
            </ChartContainer>
            <div className="mt-4 grid grid-cols-2 gap-x-6 gap-y-2">
              {categoryPieData.map((cat) => (
                <div key={cat.category} className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="inline-block h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: cat.fill }}
                    />
                    <span className="truncate text-muted-foreground">{cat.category}</span>
                  </div>
                  <div className="text-right shrink-0 ml-2">
                    <span className="tabular-nums font-medium">
                      {formatCurrency(cat.total, currency)}
                    </span>
                    <span className="text-muted-foreground text-xs ml-1">
                      ({categoryTotal > 0 ? ((cat.total / categoryTotal) * 100).toFixed(0) : 0}%)
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
