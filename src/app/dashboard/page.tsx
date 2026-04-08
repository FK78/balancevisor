import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  getLatestFiveTransactionsWithDetails,
  getTotalsByType,
  getSavingsDepositTotal,
  getTotalSpendByCategoryThisMonth,
  getMonthlyIncomeExpenseTrend,
  getMonthlyCategorySpendTrend,
} from "@/db/queries/transactions";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getBudgets } from "@/db/queries/budgets";
import { getGoals } from "@/db/queries/goals";
import { getInvestmentValue } from "@/lib/investment-value";
import { getUpcomingRenewals, getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";
import { getDebtsSummary } from "@/db/queries/debts";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { snapshotNetWorthIfNeeded } from "@/lib/snapshot-net-worth";
import { getMonthRange } from "@/lib/date";
import { getSummaryCards } from "@/lib/summaryCards";
import { generateInsights } from "@/lib/insights";
import { SummaryCard } from "@/components/SummaryCard";
import { SpendCategoryRow } from "@/components/SpendCategoryRow";
import { SpendingInsights } from "@/components/SpendingInsights";
import { DashboardNetWorth } from "@/components/dashboard/DashboardNetWorth";
import { DashboardBudgetProgress } from "@/components/dashboard/DashboardBudgetProgress";
import { DashboardGoalsSummary } from "@/components/dashboard/DashboardGoalsSummary";
import { DashboardSubscriptions } from "@/components/dashboard/DashboardSubscriptions";
import { DashboardDebtSummary } from "@/components/dashboard/DashboardDebtSummary";
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions";
import { DashboardAccounts } from "@/components/dashboard/DashboardAccounts";
import { getCurrentUserId } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
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
import { formatCurrency } from "@/lib/formatCurrency";
import { BlurFade } from "@/components/ui/blur-fade";
import { ArrowRight } from "lucide-react";

export default async function Home() {
  const userId = await getCurrentUserId();
  const thisMonth = getMonthRange(0);
  const lastMonth = getMonthRange(1);

  const supabase = await createClient();

  const [
    lastFiveTransactions,
    accounts,
    budgets,
    goals,
    income,
    expenses,
    lastMonthIncome,
    lastMonthExpenses,
    savingsThisMonth,
    spendByCategory,
    monthlyTrend,
    categoryTrend,
    baseCurrency,
    investmentValue,
    upcomingRenewals,
    subscriptionTotals,
    netWorthHistory,
    debtSummary,
    claimsResult,
  ] = await Promise.all([
    getLatestFiveTransactionsWithDetails(userId),
    getAccountsWithDetails(userId),
    getBudgets(userId),
    getGoals(userId),
    getTotalsByType(userId, "income", thisMonth.start, thisMonth.end),
    getTotalsByType(userId, "expense", thisMonth.start, thisMonth.end),
    getTotalsByType(userId, "income", lastMonth.start, lastMonth.end),
    getTotalsByType(userId, "expense", lastMonth.start, lastMonth.end),
    getSavingsDepositTotal(userId, thisMonth.start, thisMonth.end),
    getTotalSpendByCategoryThisMonth(userId),
    getMonthlyIncomeExpenseTrend(userId, 6),
    getMonthlyCategorySpendTrend(userId, 4),
    getUserBaseCurrency(userId),
    getInvestmentValue(userId),
    getUpcomingRenewals(userId, 14),
    getActiveSubscriptionsTotals(userId),
    getNetWorthHistory(userId, 90),
    getDebtsSummary(userId),
    supabase.auth.getClaims(),
  ]);

  // Fire-and-forget: snapshot uses the already-fetched investmentValue to avoid duplicate API calls
  snapshotNetWorthIfNeeded(userId, investmentValue).catch(() => {});

  const savingsBalance = accounts
    .filter((a: { type: string | null }) => a.type === "savings")
    .reduce((sum: number, a: { balance: number }) => sum + a.balance, 0);

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

  const summaryCards = getSummaryCards(
    income,
    expenses,
    lastMonthIncome,
    lastMonthExpenses,
    savingsBalance,
    savingsThisMonth,
    baseCurrency
  );

  const user = claimsResult.data?.claims;

  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
    year: "numeric",
  }).format(new Date());
  const dayOfMonth = new Date().getDate();
  const daysInMonth = new Date(
    new Date().getFullYear(),
    new Date().getMonth() + 1,
    0
  ).getDate();
  const monthProgress = Math.round((dayOfMonth / daysInMonth) * 100);

  const spendingInsights = generateInsights(monthlyTrend, categoryTrend, baseCurrency);

  const budgetsAtRisk = budgets.filter((b) => {
    const pct = b.budgetAmount > 0 ? (b.budgetSpent / b.budgetAmount) * 100 : 0;
    return pct >= 80;
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 p-6 md:p-10">
      {/* Header with greeting and quick actions */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between page-header-gradient">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground mt-1.5 text-sm">
            Welcome back,{" "}
            <span className="font-semibold text-foreground">
              {user?.user_metadata?.display_name ||
                user?.user_metadata?.full_name ||
                user?.email}
            </span>
            . Here&apos;s your overview for {monthName}.
          </p>
        </div>
        <div className="flex gap-2">
          <QuickAddTransaction />
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/transactions">
              Transactions <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
          <Button asChild size="sm" variant="outline">
            <Link href="/dashboard/budgets">
              Budgets <ArrowRight className="ml-1 h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      </div>

      {/* Net Worth banner */}
      {accounts.length > 0 && (
        <DashboardNetWorth
          netWorth={netWorth}
          totalAssets={totalAssets}
          totalLiabilities={totalLiabilities}
          investmentValue={investmentValue}
          currency={baseCurrency}
        />
      )}

      {/* Net Worth History Chart */}
      {netWorthHistory.length >= 2 && (
        <NetWorthChart data={netWorthHistory} currency={baseCurrency} />
      )}

      {/* Month progress + Summary cards */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span className="font-medium">Month progress</span>
          <span>
            Day {dayOfMonth} of {daysInMonth} ({monthProgress}%)
          </span>
        </div>
        <div className="bg-muted h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-indigo-500 to-cyan-400 h-full rounded-full transition-all"
            style={{ width: `${monthProgress}%` }}
          />
        </div>
      </div>

      <BlurFade delay={0.05} inView>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {summaryCards.map((card) => (
            <SummaryCard key={card.title} {...card} />
          ))}
        </div>
      </BlurFade>

      {/* Spending Insights + Charts */}
      {spendingInsights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Spending Insights</CardTitle>
            <CardDescription>Notable patterns and anomalies based on your recent activity.</CardDescription>
          </CardHeader>
          <CardContent>
            <SpendingInsights insights={spendingInsights} />
          </CardContent>
        </Card>
      )}

      <CashflowCharts data={monthlyTrend} currency={baseCurrency} />

      {/* Budget progress + Spending by category */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DashboardBudgetProgress
          budgets={budgets}
          budgetsAtRisk={budgetsAtRisk}
          currency={baseCurrency}
        />

        <Card>
          <CardHeader>
            <CardTitle>Spending by Category</CardTitle>
            <CardDescription>
              This month&apos;s expense breakdown (
              {formatCurrency(expenses, baseCurrency)} total).
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {spendByCategory.length === 0 ? (
              <div className="text-muted-foreground flex flex-col items-center justify-center gap-3 py-6 text-center">
                <p className="text-sm font-medium text-foreground">
                  No category spend yet
                </p>
                <p className="text-xs">
                  Your expense breakdown appears once transactions are added.
                </p>
                <Button asChild size="sm" variant="outline">
                  <Link href="/dashboard/transactions">Add transaction</Link>
                </Button>
              </div>
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
      </div>

      {/* Goals summary */}
      <DashboardGoalsSummary goals={goals} currency={baseCurrency} />

      {/* Upcoming Subscriptions */}
      <DashboardSubscriptions
        upcomingRenewals={upcomingRenewals}
        subscriptionTotals={subscriptionTotals}
        currency={baseCurrency}
      />

      {/* Debt Summary */}
      <DashboardDebtSummary debtSummary={debtSummary} currency={baseCurrency} />

      {/* Recent transactions + Accounts */}
      <div className="space-y-6">
        <DashboardRecentTransactions transactions={lastFiveTransactions} currency={baseCurrency} />
        <DashboardAccounts accounts={accounts} currency={baseCurrency} />
      </div>
    </div>
  );
}
