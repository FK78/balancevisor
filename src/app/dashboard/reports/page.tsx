import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import {
  getMonthlyIncomeExpenseTrend,
  getMonthlyCategorySpendTrend,
} from "@/db/queries/transactions";
import dynamic from "next/dynamic";

const ReportsClient = dynamic(
  () => import("@/components/ReportsClient").then((mod) => mod.ReportsClient),
  { loading: () => <div className="min-h-[400px]" /> }
);

export default async function ReportsPage() {
  const userId = await getCurrentUserId();

  const [monthlyTrend, monthlyCategorySpend, baseCurrency] = await Promise.all([
    getMonthlyIncomeExpenseTrend(userId, 12),
    getMonthlyCategorySpendTrend(userId, 12),
    getUserBaseCurrency(userId),
  ]);

  return (
    <ReportsClient
      monthlyTrend={monthlyTrend}
      monthlyCategorySpend={monthlyCategorySpend}
      currency={baseCurrency}
    />
  );
}
