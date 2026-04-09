"use client";

import { createContext, useContext, useState, useMemo, type ReactNode } from "react";
import type {
  MonthlyCashflowPoint,
  MonthlyCategorySpendPoint,
} from "@/db/queries/transactions";
import { formatMonthLabel } from "@/lib/date";

type RangeOption = 3 | 6 | 12;

interface CategoryPieItem {
  readonly category: string;
  readonly total: number;
  readonly fill: string;
}

interface ReportsContextValue {
  readonly range: RangeOption;
  readonly setRange: (r: RangeOption) => void;
  readonly currency: string;
  readonly filteredTrend: MonthlyCashflowPoint[];
  readonly totalIncome: number;
  readonly totalExpenses: number;
  readonly totalNet: number;
  readonly savingsRate: number;
  readonly avgMonthlyExpense: number;
  readonly categoryPieData: CategoryPieItem[];
  readonly categoryTotal: number;
  readonly monthlyCategoryStackData: Record<string, string | number>[];
  readonly stackedCategories: string[];
  readonly categoryColorMap: Map<string, string>;
  readonly cumulativeSavings: { month: string; monthLabel: string; net: number; cumulative: number }[];
}

const ReportsContext = createContext<ReportsContextValue | null>(null);

export function useReportsContext() {
  const ctx = useContext(ReportsContext);
  if (!ctx) throw new Error("useReportsContext must be used within ReportsProvider");
  return ctx;
}

export function ReportsProvider({
  monthlyTrend,
  monthlyCategorySpend,
  currency,
  children,
}: {
  monthlyTrend: MonthlyCashflowPoint[];
  monthlyCategorySpend: MonthlyCategorySpendPoint[];
  currency: string;
  children: ReactNode;
}) {
  const [range, setRange] = useState<RangeOption>(6);

  const filteredTrend = useMemo(
    () => monthlyTrend.slice(-range),
    [monthlyTrend, range],
  );

  const filteredMonthSet = useMemo(
    () => new Set(filteredTrend.map((p) => p.month)),
    [filteredTrend],
  );

  // KPIs
  const totalIncome = filteredTrend.reduce((s, p) => s + p.income, 0);
  const totalExpenses = filteredTrend.reduce((s, p) => s + p.expenses, 0);
  const totalNet = totalIncome - totalExpenses;
  const savingsRate = totalIncome > 0 ? (totalNet / totalIncome) * 100 : 0;
  const avgMonthlyExpense = filteredTrend.length > 0 ? totalExpenses / filteredTrend.length : 0;

  // Category pie data
  const categoryPieData = useMemo(() => {
    const totals = new Map<string, { total: number; color: string }>();
    for (const row of monthlyCategorySpend) {
      if (!filteredMonthSet.has(row.month)) continue;
      const existing = totals.get(row.category);
      if (existing) {
        existing.total += row.total;
      } else {
        totals.set(row.category, { total: row.total, color: row.color });
      }
    }

    const sorted = [...totals.entries()]
      .map(([category, v]) => ({ category, total: v.total, fill: v.color }))
      .sort((a, b) => b.total - a.total);

    if (sorted.length <= 8) return sorted;

    const top = sorted.slice(0, 7);
    const otherTotal = sorted.slice(7).reduce((s, i) => s + i.total, 0);
    return [...top, { category: "Other", total: otherTotal, fill: "var(--color-chart-5)" }];
  }, [monthlyCategorySpend, filteredMonthSet]);

  const categoryTotal = categoryPieData.reduce((s, c) => s + c.total, 0);

  // Category colors map for stacked chart
  const categoryColorMap = useMemo(() => {
    const map = new Map<string, string>();
    for (const row of monthlyCategorySpend) {
      if (!map.has(row.category)) map.set(row.category, row.color);
    }
    map.set("Other", "hsl(var(--muted-foreground))");
    return map;
  }, [monthlyCategorySpend]);

  // Monthly stacked category data
  const monthlyCategoryStackData = useMemo(() => {
    const months = [...filteredMonthSet].sort();
    const allCategories = new Set<string>();
    const byMonth = new Map<string, Record<string, number>>();

    for (const month of months) {
      byMonth.set(month, {});
    }

    for (const row of monthlyCategorySpend) {
      if (!filteredMonthSet.has(row.month)) continue;
      allCategories.add(row.category);
      const m = byMonth.get(row.month)!;
      m[row.category] = (m[row.category] ?? 0) + row.total;
    }

    // Get top 6 categories by total, rest as "Other"
    const catTotals = new Map<string, number>();
    for (const cat of allCategories) {
      let sum = 0;
      for (const m of byMonth.values()) sum += m[cat] ?? 0;
      catTotals.set(cat, sum);
    }
    const sortedCats = [...catTotals.entries()].sort((a, b) => b[1] - a[1]);
    const topCats = sortedCats.slice(0, 6).map(([c]) => c);
    const otherCats = new Set(sortedCats.slice(6).map(([c]) => c));

    return months.map((month) => {
      const m = byMonth.get(month) ?? {};
      const point: Record<string, string | number> = { month, monthLabel: formatMonthLabel(month) };
      for (const cat of topCats) {
        point[cat] = m[cat] ?? 0;
      }
      if (otherCats.size > 0) {
        let otherSum = 0;
        for (const cat of otherCats) otherSum += m[cat] ?? 0;
        point["Other"] = otherSum;
      }
      return point;
    });
  }, [monthlyCategorySpend, filteredMonthSet]);

  const stackedCategories = useMemo(() => {
    if (monthlyCategoryStackData.length === 0) return [];
    return Object.keys(monthlyCategoryStackData[0]).filter(
      (k) => k !== "month" && k !== "monthLabel",
    );
  }, [monthlyCategoryStackData]);

  // Cumulative net savings
  const cumulativeSavings = useMemo(() => {
    const result: { month: string; monthLabel: string; net: number; cumulative: number }[] = [];
    for (const p of filteredTrend) {
      const prev = result.length > 0 ? result[result.length - 1].cumulative : 0;
      result.push({
        month: p.month,
        monthLabel: formatMonthLabel(p.month),
        net: p.net,
        cumulative: prev + p.net,
      });
    }
    return result;
  }, [filteredTrend]);

  const value = useMemo<ReportsContextValue>(
    () => ({
      range,
      setRange,
      currency,
      filteredTrend,
      totalIncome,
      totalExpenses,
      totalNet,
      savingsRate,
      avgMonthlyExpense,
      categoryPieData,
      categoryTotal,
      monthlyCategoryStackData,
      stackedCategories,
      categoryColorMap,
      cumulativeSavings,
    }),
    [
      range,
      currency,
      filteredTrend,
      totalIncome,
      totalExpenses,
      totalNet,
      savingsRate,
      avgMonthlyExpense,
      categoryPieData,
      categoryTotal,
      monthlyCategoryStackData,
      stackedCategories,
      categoryColorMap,
      cumulativeSavings,
    ],
  );

  return (
    <ReportsContext.Provider value={value}>
      {children}
    </ReportsContext.Provider>
  );
}
