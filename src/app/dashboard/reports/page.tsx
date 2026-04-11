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
import { ReportsTopMerchants } from "@/components/reports/ReportsTopMerchants";
import { ReportsMerchantChanges } from "@/components/reports/ReportsMerchantChanges";
import { getTopMerchants, getMerchantMonthOverMonth } from "@/db/queries/merchant-spend";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

export default async function ReportsPage() {
  await requireFeature("reports");
  const userId = await getCurrentUserId();

  const [monthlyTrend, monthlyCategorySpend, baseCurrency, serverLayout, dailyTrend, topMerchants, merchantChanges] = await Promise.all([
    getMonthlyIncomeExpenseTrend(userId, 12),
    getMonthlyCategorySpendTrend(userId, 12),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "reports"),
    getDailyIncomeExpenseTrend(userId, 90),
    getTopMerchants(userId, 10),
    getMerchantMonthOverMonth(userId, 5),
  ]);

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Reports</h1>
      </div>
      <ReportsRangeFilter />
    </div>
  );
  const totalIncome = monthlyTrend.reduce((sum, month) => sum + month.income, 0);
  const totalNet = monthlyTrend.reduce((sum, month) => sum + month.net, 0);
  const savingsRate = totalIncome > 0 ? (totalNet / totalIncome) * 100 : 0;
  const latestMonth = monthlyTrend[monthlyTrend.length - 1] ?? null;
  const topCategory = latestMonth
    ? monthlyCategorySpend
        .filter((item) => item.month === latestMonth.month)
        .sort((left, right) => right.total - left.total)[0] ?? null
    : null;
  const introEl = (
    <SecondaryPageIntro
      heroEyebrow="Reports"
      heroTitle="Use trends to decide what to do next"
      heroDescription={monthlyTrend.length > 0
        ? "This cockpit keeps the overall savings direction, the latest month signal, and the strongest spend theme visible before you dig into the full chart stack."
        : "Once there is enough history, this page will surface the strongest trend first so the detailed charts feel easier to navigate."}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Net</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {totalNet >= 0 ? "+" : "−"}{Math.abs(totalNet).toLocaleString("en-GB", { maximumFractionDigits: 0 })}
            </p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Savings rate</p>
            <p className="mt-1 text-lg font-semibold text-white">{savingsRate.toFixed(1)}%</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Top category</p>
            <p className="mt-1 text-lg font-semibold text-white">{topCategory?.category ?? "Waiting"}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Next step"
      actionShelfTitle="Start with the shape of the money, then drill into why"
      actionShelfDescription="The KPI strip keeps the financial shape visible while the charts and AI summary below handle the deeper explanation."
      actionShelfContent={<ReportsKPIStats />}
      priorities={{
        eyebrow: "Priority stack",
        title: "Read the strongest signal before the chart wall begins",
        description: "These cards tell you which trend is most worth following up on first.",
        items: [
          {
            id: "latest-net",
            title: latestMonth
              ? `${latestMonth.net >= 0 ? "Positive" : "Negative"} net in ${latestMonth.month}`
              : "No monthly net trend yet",
            description: latestMonth
              ? `The latest month landed at ${latestMonth.net >= 0 ? "+" : "−"}${Math.abs(latestMonth.net).toLocaleString("en-GB", { maximumFractionDigits: 0 })}, which is the quickest clue about whether spending or income deserves the next look.`
              : "As monthly data arrives, this card becomes the fastest read on current direction.",
          },
          {
            id: "savings-rate",
            title: `${savingsRate.toFixed(1)}% savings rate across the current range`,
            description: totalIncome > 0
              ? "That rate turns the full reports stack into a simple question: is the recent trend supporting or eroding your margin?"
              : "Once income data is available, this card will translate the chart stack into a simple margin signal.",
          },
          {
            id: "top-category",
            title: topCategory
              ? `${topCategory.category} is the leading spend category this month`
              : "No top spend category is standing out yet",
            description: topCategory
              ? `It currently leads with ${topCategory.total.toLocaleString("en-GB", { maximumFractionDigits: 0 })}, so it is the clearest place to start when you move into the category charts.`
              : "The top category signal will appear here once the monthly breakdown fills out.",
          },
        ],
      }}
    />
  );

  return (
    <ReportsProvider
      monthlyTrend={monthlyTrend}
      monthlyCategorySpend={monthlyCategorySpend}
      currency={baseCurrency}
    >
      <PageWidgetWrapper pageId="reports" serverLayout={serverLayout} header={headerEl} intro={introEl}>
        <DashboardWidget id="ai-monthly-report">
          <MonthlyAIReport />
        </DashboardWidget>

        <DashboardWidget id="savings-rate">
          <ReportsSavingsRate />
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

        <DashboardWidget id="top-merchants">
          <ReportsTopMerchants merchants={topMerchants} currency={baseCurrency} />
        </DashboardWidget>

        <DashboardWidget id="merchant-changes">
          <ReportsMerchantChanges changes={merchantChanges} currency={baseCurrency} />
        </DashboardWidget>
      </PageWidgetWrapper>
    </ReportsProvider>
  );
}
