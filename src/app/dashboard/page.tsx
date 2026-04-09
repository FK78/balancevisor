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
import { getCashflowForecast } from "@/lib/cashflow-forecast";
import { getSpendingAnomalies } from "@/lib/spending-anomalies";
import { snapshotNetWorthIfNeeded } from "@/lib/snapshot-net-worth";
import { getMonthRange, getMonthKey } from "@/lib/date";
import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getDisabledFeatures } from "@/db/queries/preferences";
import { isFeatureEnabled as checkFeature, type FeatureId } from "@/lib/features";
import { createClient } from "@/lib/supabase/server";
import { getPageLayout } from "@/db/queries/dashboard-layouts";
import { getZakatSettings, getLatestZakatCalculation } from "@/db/queries/zakat";
import { getRetirementProfile } from "@/db/queries/retirement";
import { calculateRetirementProjection } from "@/lib/retirement-calculator";
import { getDebtsSummary } from "@/db/queries/debts";
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";

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
    serverLayout,
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
    getPageLayout(userId, "dashboard"),
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

  const [insights, forecast, anomalies, zakatSettings, latestZakatCalc, retirementProfile, debtsSummary] = await Promise.all([
    getDashboardInsights(userId, budgets, goals),
    on("reports") ? getCashflowForecast(userId) : Promise.resolve(null),
    on("reports") ? getSpendingAnomalies(userId) : Promise.resolve([]),
    on("zakat") ? getZakatSettings(userId) : Promise.resolve(null),
    on("zakat") ? getLatestZakatCalculation(userId) : Promise.resolve(null),
    getRetirementProfile(userId),
    getDebtsSummary(userId),
  ]);

  let zakatData: { zakatDue: number; zakatableAmount: number; aboveNisab: boolean; daysUntil: number | null; hasSettings: boolean } | null = null;
  if (on("zakat")) {
    let daysUntil: number | null = null;
    if (zakatSettings) {
      const now = new Date();
      const anniv = new Date(zakatSettings.anniversary_date);
      const thisYear = new Date(now.getFullYear(), anniv.getMonth(), anniv.getDate());
      const todayMidnight = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      if (thisYear.getTime() < todayMidnight.getTime()) {
        thisYear.setFullYear(thisYear.getFullYear() + 1);
      }
      daysUntil = Math.round((thisYear.getTime() - todayMidnight.getTime()) / (1000 * 60 * 60 * 24));
    }
    zakatData = {
      zakatDue: latestZakatCalc ? Number(latestZakatCalc.zakat_due) : 0,
      zakatableAmount: latestZakatCalc ? Number(latestZakatCalc.zakatable_amount) : 0,
      aboveNisab: latestZakatCalc?.above_nisab ?? false,
      daysUntil,
      hasSettings: !!zakatSettings,
    };
  }

  let retirementProjection = null;
  if (retirementProfile && monthlyTrend.length > 0) {
    const currentMonthKey = getMonthKey(new Date());
    const completedMonths = monthlyTrend.filter((m: { month: string }) => m.month !== currentMonthKey);
    const monthCount = Math.max(completedMonths.length, 1);
    const avgMonthlyIncome = completedMonths.reduce((s: number, m: { income: number }) => s + m.income, 0) / monthCount;
    const avgMonthlyExpenses = completedMonths.reduce((s: number, m: { expenses: number }) => s + m.expenses, 0) / monthCount;
    const annualSavings = (avgMonthlyIncome - avgMonthlyExpenses) * 12;

    retirementProjection = calculateRetirementProjection({
      profile: retirementProfile,
      currentNetWorth: netWorth,
      investmentValue,
      annualSavings,
      totalDebtRemaining: debtsSummary.totalRemaining,
      avgMonthlyIncome,
      avgMonthlyExpenses,
    });
  }

  return (
    <DashboardPageClient
      serverLayout={serverLayout}
      displayName={user?.user_metadata?.display_name ?? ""}
      monthName={monthName}
      transactionsEnabled={on("transactions")}
      accountsEnabled={on("accounts")}
      investmentsEnabled={on("investments")}
      reportsEnabled={on("reports")}
      budgetsEnabled={on("budgets")}
      categoriesEnabled={on("categories")}
      subscriptionsEnabled={on("subscriptions")}
      zakatEnabled={on("zakat")}
      zakatData={zakatData}
      insights={insights}
      netWorth={netWorth}
      totalAssets={totalAssets}
      totalLiabilities={totalLiabilities}
      investmentValue={investmentValue}
      baseCurrency={baseCurrency}
      netWorthHistory={netWorthHistory}
      monthlyTrend={monthlyTrend}
      forecast={forecast}
      anomalies={anomalies}
      upcomingRenewals={upcomingRenewals}
      budgets={budgets}
      budgetsAtRisk={budgetsAtRisk}
      spendByCategory={spendByCategory}
      expenses={expenses}
      lastFiveTransactions={lastFiveTransactions}
      retirementProjection={retirementProjection}
      hasRetirementProfile={!!retirementProfile}
    />
  );
}
