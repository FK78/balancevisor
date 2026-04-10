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
import { getMonthRange } from "@/lib/date";
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
import { calculateNetWorth } from "@/lib/net-worth";
import { getCompletedMonths, buildRetirementInputs } from "@/lib/retirement-inputs";
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";
import { detectMilestones } from "@/lib/milestones";
import { computeHealthScore } from "@/lib/financial-health-score";
import { getFunnyMilestones } from "@/lib/funny-milestones";
import { getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";

export default async function Home() {
  const userId = await getCurrentUserId();
  const thisMonth = getMonthRange(0);

  const supabase = await createClient();

  const disabledFeatures = await getDisabledFeatures(userId);
  const on = (id: FeatureId) => checkFeature(id, disabledFeatures);

  // Start independent queries that don't need results from the main batch.
  // These run in parallel with the first Promise.all and are awaited later.
  // Note: forecast is started after the main batch to reuse prefetched trend + currency.
  const anomaliesP = on("reports") ? getSpendingAnomalies(userId) : Promise.resolve([]);
  const zakatSettingsP = on("zakat") ? getZakatSettings(userId) : Promise.resolve(null);
  const latestZakatCalcP = on("zakat") ? getLatestZakatCalculation(userId) : Promise.resolve(null);
  const retirementProfileP = on("retirement") ? getRetirementProfile(userId) : Promise.resolve(null);
  const debtsSummaryP = getDebtsSummary(userId);
  const subsTotalsP = on("subscriptions") ? getActiveSubscriptionsTotals(userId) : Promise.resolve(null);

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
    snapshotNetWorthIfNeeded(userId, { prefetchedInvestmentValue: investmentValue, prefetchedAccounts: accounts }).catch(() => {});
  }

  const { totalAssets, totalLiabilities, netWorth } = calculateNetWorth(accounts, investmentValue);

  const user = claimsResult.data?.claims;

  const monthName = new Intl.DateTimeFormat("en-GB", {
    month: "long",
  }).format(new Date());

  const budgetsAtRisk = budgets.filter((b) => {
    const pct = b.budgetAmount > 0 ? (b.budgetSpent / b.budgetAmount) * 100 : 0;
    return pct >= 80;
  });

  // Await insights (depends on budgets + goals) alongside the pre-started independent queries.
  // Forecast receives prefetched trend + currency to avoid duplicate DB queries.
  const [insights, forecast, anomalies, zakatSettings, latestZakatCalc, retirementProfile, debtsSummary, subsTotals] = await Promise.all([
    getDashboardInsights(userId, budgets, goals),
    on("reports") ? getCashflowForecast(userId, { prefetchedTrend: monthlyTrend, prefetchedCurrency: baseCurrency }) : Promise.resolve(null),
    anomaliesP,
    zakatSettingsP,
    latestZakatCalcP,
    retirementProfileP,
    debtsSummaryP,
    subsTotalsP,
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

  // Detect shareable milestones from data already fetched
  const baseMilestones = detectMilestones({
    netWorthHistory,
    monthlyTrend,
    goals: goals.map((g) => ({ id: g.id, name: g.name, target_amount: g.target_amount, saved_amount: g.saved_amount })),
    debts: debtsSummary.debts.map((d) => ({ id: d.id, name: d.name, original_amount: d.original_amount, remaining_amount: d.remaining_amount })),
    budgets: budgets.map((b) => ({ id: b.id, spent: b.budgetSpent, limit: b.budgetAmount })),
    currency: baseCurrency,
  });

  // Fetch AI-generated funny milestone cards (non-blocking — falls back to empty)
  const funnyMilestones = await getFunnyMilestones(
    userId,
    baseCurrency,
    subsTotals ? { count: subsTotals.count, monthlyTotal: subsTotals.monthly } : null,
  ).catch(() => [] as const);

  const milestones = [...baseMilestones, ...funnyMilestones];

  // Compute financial health score from data already fetched
  const avgMonthlyExpense = monthlyTrend.length > 0
    ? monthlyTrend.reduce((s, m) => s + m.expenses, 0) / monthlyTrend.length
    : 0;
  const savingsRate = monthlyTrend.length > 0 && monthlyTrend.reduce((s, m) => s + m.income, 0) > 0
    ? ((monthlyTrend.reduce((s, m) => s + m.income, 0) - monthlyTrend.reduce((s, m) => s + m.expenses, 0)) / monthlyTrend.reduce((s, m) => s + m.income, 0)) * 100
    : 0;
  const nwFirst = netWorthHistory.length > 0 ? netWorthHistory[0].net_worth : 0;
  const nwLast = netWorthHistory.length > 0 ? netWorthHistory[netWorthHistory.length - 1].net_worth : 0;

  // Emergency fund: sum of completed goals named "emergency" (case-insensitive)
  const emergencyGoals = goals.filter((g) => /emergency/i.test(g.name));
  const emergencyFundSaved = emergencyGoals.reduce((s, g) => s + g.saved_amount, 0);

  const healthScore = computeHealthScore({
    savingsRate,
    netWorthPrevious: nwFirst,
    netWorthCurrent: nwLast,
    totalLiabilities,
    totalAssets,
    budgets: budgets.map((b) => ({ spent: b.budgetSpent, limit: b.budgetAmount })),
    emergencyFundSaved,
    monthlyExpenses: avgMonthlyExpense,
  });

  let retirementProjection = null;
  if (on("retirement") && retirementProfile && monthlyTrend.length > 0) {
    const completedMonths = getCompletedMonths(monthlyTrend);
    if (completedMonths.length > 0) {
      const inputs = buildRetirementInputs({
        profile: retirementProfile,
        currentNetWorth: netWorth,
        investmentValue,
        completedMonths,
        totalDebtRemaining: debtsSummary.totalRemaining,
      });
      retirementProjection = calculateRetirementProjection(inputs);
    }
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
      retirementEnabled={on("retirement")}
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
      milestones={milestones}
      healthScore={healthScore}
    />
  );
}
