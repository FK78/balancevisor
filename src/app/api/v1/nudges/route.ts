import { v1Handler, dataResponse } from "@/lib/api-v1";
import { generateNudges } from "@/lib/nudges";
import { getSubscriptionHealthReport } from "@/lib/subscription-health";
import { getBudgets } from "@/db/queries/budgets";
import { getGoals } from "@/db/queries/goals";
import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getDismissedNudgeKeys } from "@/db/queries/nudge-dismissals";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getSpendingAnomalies } from "@/lib/spending-anomalies";

export const GET = v1Handler(async ({ userId }) => {
  const [budgets, goals, trend, subHealth, anomalies, dismissedNudgeKeys, currency] =
    await Promise.all([
      getBudgets(userId),
      getGoals(userId),
      getMonthlyIncomeExpenseTrend(userId, 6),
      getSubscriptionHealthReport(userId),
      getSpendingAnomalies(userId),
      getDismissedNudgeKeys(userId),
      getUserBaseCurrency(userId),
    ]);

  const nudges = generateNudges({
    subscriptionHealth: subHealth,
    anomalies,
    budgets,
    monthlyTrend: trend,
    goalsProgress: goals.map((g) => ({
      name: g.name,
      pct: g.target_amount > 0 ? (g.saved_amount / g.target_amount) * 100 : 0,
    })),
    currency,
    dismissedNudgeKeys,
  });

  return dataResponse(nudges);
});
