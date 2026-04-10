import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import {
  getMonthlyIncomeExpenseTrend,
  getMonthlyCategorySpendTrend,
  getDailyIncomeExpenseTrend,
} from "@/db/queries/transactions";
import { MonthlyAIReport } from "@/components/MonthlyAIReport";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";
import { ReportsProvider } from "@/components/reports/ReportsProvider";
import { ReportsRangeFilter } from "@/components/reports/ReportsRangeFilter";
import { ReportsSavingsRate } from "@/components/reports/ReportsSavingsRate";
import { ReportsKPIStats } from "@/components/reports/ReportsKPIStats";
import { ReportsIncomeVsExpenses } from "@/components/reports/ReportsIncomeVsExpenses";
import { ReportsNetSavingsTrend } from "@/components/reports/ReportsNetSavingsTrend";
import { ReportsCategoryPie } from "@/components/reports/ReportsCategoryPie";
import { ReportsMonthlyCategoryBreakdown } from "@/components/reports/ReportsMonthlyCategoryBreakdown";
import { ReportsTopCategories } from "@/components/reports/ReportsTopCategories";
import { ReportsSpendingHeatmap } from "@/components/reports/ReportsSpendingHeatmap";
import { ReportsMoneyFlow } from "@/components/reports/ReportsMoneyFlow";

export default async function ReportsPage() {
  await requireFeature("reports");
  const userId = await getCurrentUserId();

  const [monthlyTrend, monthlyCategorySpend, baseCurrency, serverLayout, dailyTrend] = await Promise.all([
    getMonthlyIncomeExpenseTrend(userId, 12),
    getMonthlyCategorySpendTrend(userId, 12),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "reports"),
    getDailyIncomeExpenseTrend(userId, 90),
  ]);

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
      </div>
      <ReportsRangeFilter />
    </div>
  );

  return (
    <ReportsProvider
      monthlyTrend={monthlyTrend}
      monthlyCategorySpend={monthlyCategorySpend}
      currency={baseCurrency}
    >
      <PageWidgetWrapper pageId="reports" serverLayout={serverLayout} header={headerEl}>
        <DashboardWidget id="ai-monthly-report">
          <MonthlyAIReport />
        </DashboardWidget>

        <DashboardWidget id="savings-rate">
          <ReportsSavingsRate />
        </DashboardWidget>

        <DashboardWidget id="kpi-stats">
          <ReportsKPIStats />
        </DashboardWidget>

        <DashboardWidget id="income-vs-expenses">
          <ReportsIncomeVsExpenses />
        </DashboardWidget>

        <DashboardWidget id="net-savings-trend">
          <ReportsNetSavingsTrend />
        </DashboardWidget>

        <DashboardWidget id="spending-by-category">
          <ReportsCategoryPie />
        </DashboardWidget>

        <DashboardWidget id="monthly-category-breakdown">
          <ReportsMonthlyCategoryBreakdown />
        </DashboardWidget>

        <DashboardWidget id="top-categories">
          <ReportsTopCategories />
        </DashboardWidget>

        <DashboardWidget id="spending-heatmap">
          <ReportsSpendingHeatmap dailyTrend={dailyTrend} currency={baseCurrency} />
        </DashboardWidget>

        <DashboardWidget id="money-flow">
          <ReportsMoneyFlow />
        </DashboardWidget>
      </PageWidgetWrapper>
    </ReportsProvider>
  );
}
