import { v1Handler, dataResponse } from "@/lib/api-v1";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getBudgets } from "@/db/queries/budgets";
import { getGoals } from "@/db/queries/goals";
import { getDebts } from "@/db/queries/debts";
import { getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";
import { getTotalsByType } from "@/db/queries/transaction-aggregations";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { getOnboardingState } from "@/db/queries/onboarding";

export const GET = v1Handler(async ({ userId }) => {
  const [accounts, budgets, goals, debts, subscriptionTotals, income, expenses, netWorth, onboarding] =
    await Promise.all([
      getAccountsWithDetails(userId),
      getBudgets(userId),
      getGoals(userId),
      getDebts(userId),
      getActiveSubscriptionsTotals(userId),
      getTotalsByType(userId, "income"),
      getTotalsByType(userId, "expense"),
      getNetWorthHistory(userId, 30),
      getOnboardingState(userId),
    ]);

  return dataResponse({
    accounts,
    budgets,
    goals,
    debts,
    subscriptionTotals,
    totals: { income, expenses },
    netWorth,
    baseCurrency: onboarding?.base_currency ?? "GBP",
    onboardingCompleted: onboarding?.completed ?? false,
  });
});
