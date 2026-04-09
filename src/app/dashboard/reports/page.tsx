import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import {
  getMonthlyIncomeExpenseTrend,
  getMonthlyCategorySpendTrend,
} from "@/db/queries/transactions";
import { ReportsClient } from "@/components/ReportsClient";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";

export default async function ReportsPage() {
  await requireFeature("reports");
  const userId = await getCurrentUserId();

  const [monthlyTrend, monthlyCategorySpend, baseCurrency, serverLayout] = await Promise.all([
    getMonthlyIncomeExpenseTrend(userId, 12),
    getMonthlyCategorySpendTrend(userId, 12),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "reports"),
  ]);

  return (
    <PageWidgetWrapper pageId="reports" serverLayout={serverLayout}>
      <DashboardWidget id="reports-client">
      <ReportsClient
        monthlyTrend={monthlyTrend}
        monthlyCategorySpend={monthlyCategorySpend}
        currency={baseCurrency}
      />
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
