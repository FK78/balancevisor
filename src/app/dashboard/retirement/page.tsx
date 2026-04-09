import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getRetirementProfile } from "@/db/queries/retirement";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getInvestmentValue } from "@/lib/investment-value";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getDebtsSummary } from "@/db/queries/debts";
import { calculateRetirementProjection } from "@/lib/retirement-calculator";
import { RetirementPageClient } from "@/components/RetirementPageClient";
import { getMonthKey } from "@/lib/date";

export default async function RetirementPage() {
  const userId = await getCurrentUserId();

  const [profile, baseCurrency] = await Promise.all([
    getRetirementProfile(userId),
    getUserBaseCurrency(userId),
  ]);

  if (!profile) {
    return <RetirementPageClient profile={null} projection={null} baseCurrency={baseCurrency} />;
  }

  const [accounts, investmentValue, trend, debtsSummary] = await Promise.all([
    getAccountsWithDetails(userId),
    getInvestmentValue(userId),
    getMonthlyIncomeExpenseTrend(userId, 6),
    getDebtsSummary(userId),
  ]);

  const currentMonthKey = getMonthKey(new Date());
  const completedMonths = trend.filter((m) => m.month !== currentMonthKey);
  const monthCount = Math.max(completedMonths.length, 1);
  const avgMonthlyIncome = completedMonths.reduce((s, m) => s + m.income, 0) / monthCount;
  const avgMonthlyExpenses = completedMonths.reduce((s, m) => s + m.expenses, 0) / monthCount;
  const annualSavings = (avgMonthlyIncome - avgMonthlyExpenses) * 12;

  const liabilityTypes = new Set(["creditCard"]);
  const totalAssets = accounts
    .filter((a) => !liabilityTypes.has(a.type ?? ""))
    .reduce((sum, a) => sum + a.balance, 0);
  const totalLiabilities = accounts
    .filter((a) => liabilityTypes.has(a.type ?? ""))
    .reduce((sum, a) => sum + Math.abs(a.balance), 0);
  const netWorth = totalAssets - totalLiabilities + investmentValue;

  const projection = calculateRetirementProjection({
    profile,
    currentNetWorth: netWorth,
    investmentValue,
    annualSavings,
    totalDebtRemaining: debtsSummary.totalRemaining,
    avgMonthlyIncome,
    avgMonthlyExpenses,
  });

  return (
    <RetirementPageClient
      profile={profile}
      projection={projection}
      baseCurrency={baseCurrency}
    />
  );
}
