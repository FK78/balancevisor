"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { TrendingUp, Lightbulb, RefreshCw, Loader2 } from "lucide-react";
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
} from "@/components/ui/chart";
import { Bar, BarChart, CartesianGrid, XAxis, YAxis, ReferenceLine } from "recharts";
import { formatMonthLabel } from "@/lib/date";
import type { MonthlySavingsRate } from "@/lib/savings-rate";

type TipsState = {
  text: string;
  loading: boolean;
  error: string | null;
};

const chartConfig = {
  rate: { label: "Savings Rate", color: "var(--color-chart-2)" },
} satisfies ChartConfig;

export function SavingsRateCard({
  rates,
}: {
  rates: MonthlySavingsRate[];
}) {
  const [tips, setTips] = useState<TipsState>({
    text: "",
    loading: true,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const hasFetched = useRef(false);

  const fetchTips = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setTips({ text: "", loading: true, error: null });

    try {
      const res = await fetch("/api/savings-tips", {
        method: "POST",
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setTips({ text: data.tips, loading: false, error: null });
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setTips((prev) => ({ ...prev, text: accumulated }));
      }

      setTips({ text: accumulated, loading: false, error: null });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setTips((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load tips",
      }));
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchTips();
  }, [fetchTips]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const chartData = rates.map((r) => ({
    month: r.month,
    monthLabel: formatMonthLabel(r.month),
    rate: r.rate,
    fill: r.rate >= 0 ? "var(--color-chart-2)" : "var(--color-chart-1)",
  }));

  const avgRate = rates.length > 0
    ? Math.round((rates.reduce((s, r) => s + r.rate, 0) / rates.length) * 10) / 10
    : 0;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-500/10">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
            </div>
            <div>
              <CardTitle className="text-base">Savings Rate Trend</CardTitle>
              <CardDescription className="text-xs">
                Average: {avgRate}% · How much of your income you keep each month
              </CardDescription>
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Chart */}
        {chartData.length > 0 && (
          <ChartContainer config={chartConfig} className="h-[180px] w-full">
            <BarChart data={chartData} margin={{ top: 5, right: 5, bottom: 0, left: -20 }}>
              <CartesianGrid vertical={false} strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" tickLine={false} axisLine={false} fontSize={12} />
              <YAxis
                tickLine={false}
                axisLine={false}
                fontSize={12}
                tickFormatter={(v) => `${v}%`}
              />
              <ChartTooltip
                content={
                  <ChartTooltipContent
                    formatter={(value) => [`${Number(value).toFixed(1)}%`, "Savings Rate"]}
                  />
                }
              />
              <ReferenceLine y={0} stroke="hsl(var(--border))" strokeDasharray="3 3" />
              <Bar dataKey="rate" radius={[4, 4, 0, 0]}>
                {chartData.map((entry, i) => (
                  <rect key={i} fill={entry.fill} />
                ))}
              </Bar>
            </BarChart>
          </ChartContainer>
        )}

        {/* AI Tips */}
        <div className="rounded-lg border border-border/60 bg-muted/30 p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Lightbulb className="h-3.5 w-3.5 text-amber-500" />
              AI Savings Tips
            </div>
            <Button
              size="sm"
              variant="ghost"
              disabled={tips.loading}
              onClick={() => fetchTips()}
              className="h-7 w-7 p-0"
            >
              {tips.loading ? (
                <Loader2 className="h-3 w-3 animate-spin" />
              ) : (
                <RefreshCw className="h-3 w-3" />
              )}
            </Button>
          </div>
          {tips.error ? (
            <p className="text-xs text-destructive">{tips.error}</p>
          ) : tips.loading && !tips.text ? (
            <div className="space-y-1.5">
              <div className="h-3 w-full animate-pulse rounded bg-muted" />
              <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
            </div>
          ) : (
            <p className="text-sm leading-relaxed text-muted-foreground whitespace-pre-line">{tips.text}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
