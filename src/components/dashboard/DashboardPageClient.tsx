"use client";

import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { DashboardMonthlyReport } from "@/components/dashboard/DashboardMonthlyReport";
import { DashboardCashflowForecast } from "@/components/dashboard/DashboardCashflowForecast";
import { DashboardAnomalies } from "@/components/dashboard/DashboardAnomalies";
import { DashboardWeeklyDigest } from "@/components/dashboard/DashboardWeeklyDigest";
import { DashboardNetWorth } from "@/components/dashboard/DashboardNetWorth";
import { DashboardBudgetProgress } from "@/components/dashboard/DashboardBudgetProgress";
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions";
import { DashboardUpcomingBills } from "@/components/dashboard/DashboardUpcomingBills";
import { SpendCategoryRow } from "@/components/SpendCategoryRow";
import { DashboardRetirement } from "@/components/dashboard/DashboardRetirement";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { WidgetGrid } from "@/components/WidgetGrid";
import { DashboardWidget } from "@/components/DashboardWidget";
import { CustomiseDrawer } from "@/components/CustomiseDrawer";
import { EditLayoutToggle } from "@/components/EditLayoutToggle";
import type { WidgetLayoutItem } from "@/lib/widget-registry";
import dynamic from "next/dynamic";

const CashflowCharts = dynamic(
  () => import("@/components/CashflowCharts").then((mod) => mod.CashflowCharts),
  { loading: () => <div className="min-h-[300px]" /> }
);
const NetWorthChart = dynamic(
  () => import("@/components/NetWorthChart").then((mod) => mod.NetWorthChart),
  { loading: () => <div className="min-h-[260px]" /> }
);

/* eslint-disable @typescript-eslint/no-explicit-any */
interface DashboardPageClientProps {
  readonly serverLayout: readonly WidgetLayoutItem[];
  readonly displayName: string;
  readonly monthName: string;
  readonly transactionsEnabled: boolean;
  readonly accountsEnabled: boolean;
  readonly investmentsEnabled: boolean;
  readonly reportsEnabled: boolean;
  readonly budgetsEnabled: boolean;
  readonly categoriesEnabled: boolean;
  readonly subscriptionsEnabled: boolean;
  readonly insights: any[];
  readonly netWorth: number;
  readonly totalAssets: number;
  readonly totalLiabilities: number;
  readonly investmentValue: number;
  readonly baseCurrency: string;
  readonly netWorthHistory: any[];
  readonly monthlyTrend: any[];
  readonly forecast: any;
  readonly anomalies: any[];
  readonly upcomingRenewals: any[];
  readonly budgets: any[];
  readonly budgetsAtRisk: any[];
  readonly spendByCategory: any[];
  readonly expenses: number;
  readonly lastFiveTransactions: any[];
  readonly retirementProjection: any;
  readonly hasRetirementProfile: boolean;
}

export function DashboardPageClient(props: DashboardPageClientProps) {
  const {
    serverLayout,
    displayName,
    monthName,
    transactionsEnabled,
    accountsEnabled,
    investmentsEnabled,
    reportsEnabled,
    budgetsEnabled,
    categoriesEnabled,
    subscriptionsEnabled,
    insights,
    netWorth,
    totalAssets,
    totalLiabilities,
    investmentValue,
    baseCurrency,
    netWorthHistory,
    monthlyTrend,
    forecast,
    anomalies,
    upcomingRenewals,
    budgets,
    budgetsAtRisk,
    spendByCategory,
    expenses,
    lastFiveTransactions,
    retirementProjection,
    hasRetirementProfile,
  } = props;

  return (
    <WidgetLayoutProvider pageId="dashboard" serverLayout={serverLayout}>
      <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
        {/* Header — always visible, not a widget */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
          <div>
            <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
              Welcome back{displayName ? `, ${displayName}` : ""}
            </h1>
            <p className="text-muted-foreground mt-0.5 text-sm">{monthName}</p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            {transactionsEnabled && (
              <>
                <QuickAddTransaction />
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/transactions">
                    Transactions <ArrowRight className="ml-1 h-3.5 w-3.5" />
                  </Link>
                </Button>
              </>
            )}
            <EditLayoutToggle />
            <CustomiseDrawer />
          </div>
        </div>

        <WidgetGrid>
          <DashboardWidget id="insights">
            {insights.length > 0 && <DashboardInsights insights={insights} />}
          </DashboardWidget>

          <DashboardWidget id="monthly-report">
            {reportsEnabled && <DashboardMonthlyReport />}
          </DashboardWidget>

          <DashboardWidget id="net-worth">
            {accountsEnabled && (
              <DashboardNetWorth
                netWorth={netWorth}
                totalAssets={totalAssets}
                totalLiabilities={totalLiabilities}
                investmentValue={investmentsEnabled ? investmentValue : 0}
                currency={baseCurrency}
              />
            )}
          </DashboardWidget>

          <DashboardWidget id="net-worth-history">
            {accountsEnabled && netWorthHistory.length >= 2 && (
              <NetWorthChart data={netWorthHistory} currency={baseCurrency} />
            )}
          </DashboardWidget>

          <DashboardWidget id="cashflow">
            {reportsEnabled && <CashflowCharts data={monthlyTrend} currency={baseCurrency} />}
          </DashboardWidget>

          <DashboardWidget id="cashflow-forecast">
            {reportsEnabled && forecast && <DashboardCashflowForecast forecast={forecast} />}
          </DashboardWidget>

          <DashboardWidget id="anomalies">
            {reportsEnabled && anomalies.length > 0 && (
              <DashboardAnomalies anomalies={anomalies} currency={baseCurrency} />
            )}
          </DashboardWidget>

          <DashboardWidget id="weekly-digest">
            {reportsEnabled && <DashboardWeeklyDigest />}
          </DashboardWidget>

          <DashboardWidget id="upcoming-bills">
            {subscriptionsEnabled && upcomingRenewals.length > 0 && (
              <DashboardUpcomingBills renewals={upcomingRenewals} currency={baseCurrency} />
            )}
          </DashboardWidget>

          <DashboardWidget id="budget-progress">
            {budgetsEnabled && (
              <DashboardBudgetProgress
                budgets={budgets}
                budgetsAtRisk={budgetsAtRisk}
                currency={baseCurrency}
              />
            )}
          </DashboardWidget>

          <DashboardWidget id="category-spend">
            {categoriesEnabled && (
              <Card>
                <CardHeader>
                  <CardTitle>Spending by Category</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {spendByCategory.length === 0 ? (
                    <p className="text-muted-foreground py-6 text-center text-sm">No spend data yet.</p>
                  ) : (
                    spendByCategory.map((cat) => (
                      <SpendCategoryRow
                        key={cat.category}
                        category={cat.category}
                        total={cat.total}
                        color={cat.color}
                        totalExpenses={expenses}
                        currency={baseCurrency}
                      />
                    ))
                  )}
                </CardContent>
              </Card>
            )}
          </DashboardWidget>

          <DashboardWidget id="retirement">
            <DashboardRetirement
              projection={retirementProjection}
              hasProfile={hasRetirementProfile}
              baseCurrency={baseCurrency}
            />
          </DashboardWidget>

          <DashboardWidget id="recent-transactions">
            {transactionsEnabled && (
              <DashboardRecentTransactions transactions={lastFiveTransactions} currency={baseCurrency} />
            )}
          </DashboardWidget>
        </WidgetGrid>
      </div>
    </WidgetLayoutProvider>
  );
}
