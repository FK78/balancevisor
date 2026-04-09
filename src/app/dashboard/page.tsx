import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getLatestFiveTransactionsWithDetails,
  getTotalsByType,
  getTotalSpendByCategoryThisMonth,
  getMonthlyIncomeExpenseTrend,
} from "@/db/queries/transactions";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getBudgets } from "@/db/queries/budgets";
import { getUpcomingRenewals } from "@/db/queries/subscriptions";
import { getInvestmentValue } from "@/lib/investment-value";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { getGoals } from "@/db/queries/goals";
import { getDashboardInsights } from "@/db/queries/insights";
import { DashboardInsights } from "@/components/dashboard/DashboardInsights";
import { DashboardMonthlyReport } from "@/components/dashboard/DashboardMonthlyReport";
import { DashboardCashflowForecast } from "@/components/dashboard/DashboardCashflowForecast";
import { getCashflowForecast } from "@/lib/cashflow-forecast";
import { getSpendingAnomalies } from "@/lib/spending-anomalies";
import { DashboardAnomalies } from "@/components/dashboard/DashboardAnomalies";
import { DashboardWeeklyDigest } from "@/components/dashboard/DashboardWeeklyDigest";
import { snapshotNetWorthIfNeeded } from "@/lib/snapshot-net-worth";
import { getMonthRange } from "@/lib/date";
import { SpendCategoryRow } from "@/components/SpendCategoryRow";
import { DashboardNetWorth } from "@/components/dashboard/DashboardNetWorth";
import { DashboardBudgetProgress } from "@/components/dashboard/DashboardBudgetProgress";
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions";
import { DashboardUpcomingBills } from "@/components/dashboard/DashboardUpcomingBills";
import { getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getDisabledFeatures } from "@/db/queries/preferences";
import { isFeatureEnabled as checkFeature, type FeatureId } from "@/lib/features";
import dynamic from "next/dynamic";

const CashflowCharts = dynamic(
  () => import("@/components/CashflowCharts").then((mod) => mod.CashflowCharts),
  { loading: () => <div className="min-h-[300px]" /> }
);
const NetWorthChart = dynamic(
  () => import("@/components/NetWorthChart").then((mod) => mod.NetWorthChart),
  { loading: () => <div className="min-h-[260px]" /> }
);
import { QuickAddTransaction } from "@/components/QuickAddTransaction";
import { createClient } from "@/lib/supabase/server";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const userId = await getCurrentUserId();
  const thisMonth = getMonthRange(0);

  const supabase = await createClient();

  const disabledFeatures = await getDisabledFeatures(userId);
  const on = (id: FeatureId) => checkFeature(id, disabledFeatures);

  const [
    lastFiveTransactions,
    accounts,
    budgets,
    ,
    expenses,
    spendByCategory,
    monthlyTrend,
    baseCurrency,
    investmentValue,
    netWorthHistory,
    claimsResult,
    goals,
    upcomingRenewals,
    forecast,
    anomalies,
  ] = await Promise.all([
    on("transactions") ? getLatestFiveTransactionsWithDetails(userId) : Promise.resolve([]),
    on("accounts") ? getAccountsWithDetails(userId) : Promise.resolve([]),
    on("budgets") ? getBudgets(userId) : Promise.resolve([]),
    on("transactions") ? getTotalsByType(userId, "income", thisMonth.start, thisMonth.end) : Promise.resolve(0),
    on("transactions") ? getTotalsByType(userId, "expense", thisMonth.start, thisMonth.end) : Promise.resolve(0),
    on("categories") ? getTotalSpendByCategoryThisMonth(userId) : Promise.resolve([]),
    on("reports") ? getMonthlyIncomeExpenseTrend(userId, 6) : Promise.resolve([]),
    getUserBaseCurrency(userId),
    on("investments") ? getInvestmentValue(userId) : Promise.resolve(0),
    on("accounts") ? getNetWorthHistory(userId, 90) : Promise.resolve([]),
    supabase.auth.getClaims(),
    on("goals") ? getGoals(userId) : Promise.resolve([]),
    on("subscriptions") ? getUpcomingRenewals(userId, 7) : Promise.resolve([]),
  ]);

  // Fire-and-forget: snapshot uses the already-fetched investmentValue to avoid duplicate API calls
  if (on("accounts")) {
    snapshotNetWorthIfNeeded(userId, investmentValue).catch(() => {});
  }

  const liabilityTypes = new Set(["creditCard"]);
  const totalAssets = accounts
    .filter((a: { type: string | null }) => !liabilityTypes.has(a.type ?? ""))
    .reduce((sum: number, a: { balance: number }) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a: { type: string | null }) => liabilityTypes.has(a.type ?? ""))
    .reduce(
      (sum: number, a: { balance: number }) => sum + Math.abs(a.balance),
      0
    );
  const netWorth = totalAssets - totalLiabilities + investmentValue;

  const user = claimsResult.data?.claims;

  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
  }).format(new Date());

  const budgetsAtRisk = budgets.filter((b) => {
    const pct = b.budgetAmount > 0 ? (b.budgetSpent / b.budgetAmount) * 100 : 0;
    return pct >= 80;
  });

  const [insights, forecast, anomalies] = await Promise.all([
    getDashboardInsights(userId, budgets, goals),
    on("reports") ? getCashflowForecast(userId) : Promise.resolve(null),
    on("reports") ? getSpendingAnomalies(userId) : Promise.resolve([]),
  ]);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6 md:space-y-8 md:px-10 md:py-10">
      {/* Header */}
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">
            Welcome back{user?.user_metadata?.display_name ? `, ${user.user_metadata.display_name}` : ""}
          </h1>
          <p className="text-muted-foreground mt-0.5 text-sm">{monthName}</p>
        </div>
        {on("transactions") && (
          <div className="flex flex-wrap gap-2">
            <QuickAddTransaction />
            <Button asChild size="sm" variant="outline">
              <Link href="/dashboard/transactions">
                Transactions <ArrowRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>
        )}
      </div>

      {/* Insights */}
      {insights.length > 0 && <DashboardInsights insights={insights} />}

      {/* AI Monthly Report */}
      {on("reports") && <DashboardMonthlyReport />}

      {/* Net Worth */}
      {on("accounts") && accounts.length > 0 && (
        <DashboardNetWorth
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          investmentValue={on("investments") ? investmentValue : 0}
          currency={baseCurrency}
        />
      )}

      {/* Net Worth History */}
      {on("accounts") && netWorthHistory.length >= 2 && (
        <NetWorthChart data={netWorthHistory} currency={baseCurrency} />
      )}

      {/* Cashflow */}
      {on("reports") && <CashflowCharts data={monthlyTrend} currency={baseCurrency} />}

      {/* Cash Flow Forecast */}
      {on("reports") && forecast && <DashboardCashflowForecast forecast={forecast} />}

      {/* Spending Anomalies */}
      {on("reports") && anomalies.length > 0 && (
        <DashboardAnomalies anomalies={anomalies} currency={baseCurrency} />
      )}

      {/* Weekly Digest */}
      {on("reports") && <DashboardWeeklyDigest />}

      {/* Upcoming bills */}
      {on("subscriptions") && upcomingRenewals.length > 0 && (
        <DashboardUpcomingBills renewals={upcomingRenewals} currency={baseCurrency} />
      )}

      {/* Budget + Category spend */}
      {(on("budgets") || on("categories")) && (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          {on("budgets") && (
            <DashboardBudgetProgress
              budgets={budgets}
              budgetsAtRisk={budgetsAtRisk}
              currency={baseCurrency}
            />
          )}

          {on("categories") && (
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
        </div>
      )}

      {/* Recent transactions */}
      {on("transactions") && (
        <DashboardRecentTransactions transactions={lastFiveTransactions} currency={baseCurrency} />
      )}
    </div>
  );
}
