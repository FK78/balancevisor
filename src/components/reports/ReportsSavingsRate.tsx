"use client";

import { useMemo } from "react";
import { SavingsRateCard } from "@/components/SavingsRateCard";
import { computeMonthlySavingsRates } from "@/lib/savings-rate";
import { useReportsContext } from "@/components/reports/ReportsProvider";

export function ReportsSavingsRate() {
  const { filteredTrend } = useReportsContext();
  const rates = useMemo(() => computeMonthlySavingsRates(filteredTrend), [filteredTrend]);
  return <SavingsRateCard rates={rates} />;
}
