import { getCurrentUserId } from "@/lib/auth";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getRetirementProfile } from "@/db/queries/retirement";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getInvestmentValue } from "@/lib/investment-value";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getDebtsSummary } from "@/db/queries/debts";
import { calculateRetirementProjection } from "@/lib/retirement-calculator";
import { calculateNetWorth } from "@/lib/net-worth";
import { getCompletedMonths, buildRetirementInputs } from "@/lib/retirement-inputs";
import { computeRetirementSuggestions } from "@/lib/retirement-suggestions";
import { RetirementPageClient } from "@/components/RetirementPageClient";

export default async function RetirementPage() {
  const userId = await getCurrentUserId();

  const [profile, baseCurrency, accounts, investmentValue, trend, debtsSummary] =
    await Promise.all([
      getRetirementProfile(userId),
      getUserBaseCurrency(userId),
      getAccountsWithDetails(userId),
      getInvestmentValue(userId),
      getMonthlyIncomeExpenseTrend(userId, 6),
      getDebtsSummary(userId),
    ]);

  const suggestions = computeRetirementSuggestions(trend);

  if (!profile) {
    return (
      <RetirementPageClient
        profile={null}
        projection={null}
        baseCurrency={baseCurrency}
        suggestions={suggestions}
      />
    );
  }

  const { netWorth } = calculateNetWorth(accounts, investmentValue);
  const completedMonths = getCompletedMonths(trend);
  const inputs = buildRetirementInputs({
    profile,
    currentNetWorth: netWorth,
    investmentValue,
    completedMonths,
    totalDebtRemaining: debtsSummary.totalRemaining,
  });
  const projection = calculateRetirementProjection(inputs);

  return (
    <RetirementPageClient
      profile={profile}
      projection={projection}
      baseCurrency={baseCurrency}
      suggestions={suggestions}
    />
  );
}
