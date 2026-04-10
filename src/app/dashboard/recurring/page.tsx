import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getRecurringTransactionsSummary } from "@/db/queries/recurring";
import { formatCurrency } from "@/lib/formatCurrency";
import { RecurringClient } from "@/components/RecurringClient";
import { detectRecurringCandidates } from "@/lib/recurring-detection";
import { requireFeature } from "@/components/FeatureGate";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { PageWidgetWrapper } from "@/components/PageWidgetWrapper";
import { DashboardWidget } from "@/components/DashboardWidget";

export default async function RecurringPage() {
  await requireFeature("recurring");
  const userId = await getCurrentUserId();

  const [summary, baseCurrency, serverLayout, candidates] = await Promise.all([
    getRecurringTransactionsSummary(userId),
    getUserBaseCurrency(userId),
    getPageLayout(userId, "recurring"),
    detectRecurringCandidates(userId),
  ]);

  const {
    recurring,
    monthlyExpenses,
    monthlyIncome,
    upcomingCount,
  } = summary;

  const headerEl = (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
          Recurring Transactions
        </h1>
      </div>
    </div>
  );

  return (
    <PageWidgetWrapper pageId="recurring" serverLayout={serverLayout} header={headerEl}>
      <DashboardWidget id="stats">
      <Card>
        <CardContent className="grid grid-cols-2 gap-4 py-4 sm:grid-cols-4 sm:divide-x sm:gap-0">
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Expenses</p>
            <p className="text-lg font-semibold tabular-nums text-red-600">{formatCurrency(monthlyExpenses, baseCurrency)}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Income</p>
            <p className="text-lg font-semibold tabular-nums text-emerald-600">{formatCurrency(monthlyIncome, baseCurrency)}</p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Net</p>
            <p className={`text-lg font-semibold tabular-nums ${monthlyIncome - monthlyExpenses >= 0 ? "text-emerald-600" : "text-red-600"}`}>
              {monthlyIncome - monthlyExpenses >= 0 ? "+" : "−"}{formatCurrency(Math.abs(monthlyIncome - monthlyExpenses), baseCurrency)}
            </p>
          </div>
          <div className="px-4 text-center">
            <p className="text-xs text-muted-foreground">Due This Week</p>
            <p className="text-lg font-semibold tabular-nums">{upcomingCount}</p>
          </div>
        </CardContent>
      </Card>
      </DashboardWidget>

      <DashboardWidget id="recurring-list">
      <RecurringClient
        recurring={recurring}
        candidates={candidates}
        currency={baseCurrency}
      />
      </DashboardWidget>
    </PageWidgetWrapper>
  );
}
