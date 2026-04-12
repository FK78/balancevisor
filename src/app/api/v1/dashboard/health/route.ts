import { v1Handler, dataResponse } from "@/lib/api-v1";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getBudgets } from "@/db/queries/budgets";
import { getDebts } from "@/db/queries/debts";
import { getTotalsByType } from "@/db/queries/transaction-aggregations";
import { getNetWorthHistory } from "@/db/queries/net-worth";
import { computeHealthScore } from "@/lib/financial-health-score";

export const GET = v1Handler(async ({ userId }) => {
  const [accounts, budgets, debts, income, expenses, netWorth] = await Promise.all([
    getAccountsWithDetails(userId),
    getBudgets(userId),
    getDebts(userId),
    getTotalsByType(userId, "income"),
    getTotalsByType(userId, "expense"),
    getNetWorthHistory(userId, 30),
  ]);

  const totalBalance = accounts.reduce((s, a) => s + a.balance, 0);
  const activeDebts = debts.filter((d) => d.remaining_amount > 0);
  const totalLiabilities = activeDebts.reduce((s, d) => s + d.remaining_amount, 0);
  const savingsRate = income > 0 ? (income - expenses) / income : 0;
  const netWorthCurrent = netWorth.at(-1)?.net_worth ?? totalBalance - totalLiabilities;
  const netWorthPrevious = netWorth.at(-2)?.net_worth ?? netWorthCurrent;

  const savingsAccounts = accounts.filter((a) => a.type === "savings");
  const emergencyFundSaved = savingsAccounts.reduce((s, a) => s + a.balance, 0);

  const result = computeHealthScore({
    savingsRate,
    netWorthPrevious,
    netWorthCurrent,
    totalLiabilities,
    totalAssets: totalBalance,
    budgets: budgets.map((b) => ({ spent: b.budgetSpent, limit: b.budgetAmount })),
    emergencyFundSaved,
    monthlyExpenses: expenses,
  });

  return dataResponse(result);
});
