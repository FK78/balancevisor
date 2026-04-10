import { getMonthlyCategorySpendTrend, type MonthlyCategorySpendPoint } from "@/db/queries/transactions";
import { getMonthKey } from "@/lib/date";

export type BudgetSuggestionType = "new" | "increase" | "decrease";

export type BudgetSuggestion = {
  type: BudgetSuggestionType;
  categoryId: string;
  categoryName: string;
  categoryColor: string;
  /** Suggested monthly budget amount */
  suggestedAmount: number;
  /** Current budget amount (only for increase/decrease) */
  currentAmount: number | null;
  /** Average monthly spend over analysis window */
  avgMonthlySpend: number;
  /** Reason for the suggestion */
  reason: string;
  /** Budget ID (only for increase/decrease) */
  budgetId: string | null;
};

type ExistingBudget = {
  id: string;
  category_id: string | null;
  budgetCategory: string;
  budgetColor: string;
  budgetAmount: number;
  budgetSpent: number;
};

export async function getSmartBudgetSuggestions(
  userId: string,
  existingBudgets: ExistingBudget[],
  prefetchedCategoryTrend?: MonthlyCategorySpendPoint[],
): Promise<BudgetSuggestion[]> {
  const categoryTrend = prefetchedCategoryTrend ?? await getMonthlyCategorySpendTrend(userId, 6);

  const currentMonthKey = getMonthKey(new Date());

  // Calculate average monthly spend per category (exclude current month for accuracy)
  const completedMonthData = categoryTrend.filter((r) => r.month !== currentMonthKey);
  const completedMonths = new Set(completedMonthData.map((r) => r.month));
  const monthCount = Math.max(completedMonths.size, 1);

  const categoryStats = new Map<
    string,
    { categoryId: string; totalSpend: number; monthsWithSpend: number; color: string; monthlyAmounts: number[] }
  >();

  for (const row of completedMonthData) {
    const existing = categoryStats.get(row.category);
    if (existing) {
      existing.totalSpend += row.total;
      existing.monthsWithSpend += 1;
      existing.monthlyAmounts.push(row.total);
    } else {
      categoryStats.set(row.category, {
        categoryId: row.category_id,
        totalSpend: row.total,
        monthsWithSpend: 1,
        color: row.color,
        monthlyAmounts: [row.total],
      });
    }
  }

  const budgetedCategoryNames = new Set(
    existingBudgets.map((b) => b.budgetCategory),
  );

  const suggestions: BudgetSuggestion[] = [];

  // 1. Suggest NEW budgets for uncovered categories with significant spend
  for (const [categoryName, stats] of categoryStats) {
    if (budgetedCategoryNames.has(categoryName)) continue;

    const avgSpend = stats.totalSpend / stats.monthsWithSpend;
    // Only suggest if avg spend is meaningful (>5/month) and consistent (appears in 2+ months)
    if (avgSpend < 5 || stats.monthsWithSpend < 2) continue;

    // Add 15% buffer to the average for the suggestion
    const suggestedAmount = Math.ceil(avgSpend * 1.15);

    suggestions.push({
      type: "new",
      categoryId: stats.categoryId,
      categoryName,
      categoryColor: stats.color,
      suggestedAmount,
      currentAmount: null,
      avgMonthlySpend: Math.round(avgSpend * 100) / 100,
      reason: `You spend ~${formatRound(avgSpend)}/mo on ${categoryName} across ${stats.monthsWithSpend} of the last ${monthCount} months, but have no budget set.`,
      budgetId: null,
    });
  }

  // 2. Suggest ADJUSTMENTS for existing budgets
  for (const budget of existingBudgets) {
    const stats = categoryStats.get(budget.budgetCategory);
    if (!stats || stats.monthsWithSpend < 2) continue;

    const avgSpend = stats.totalSpend / stats.monthsWithSpend;
    const maxMonthly = Math.max(...stats.monthlyAmounts);
    const currentAmount = budget.budgetAmount;

    // Suggest INCREASE if consistently overspending (avg > 90% of budget)
    if (avgSpend > currentAmount * 0.9) {
      const suggestedAmount = Math.ceil(avgSpend * 1.15);
      if (suggestedAmount > currentAmount * 1.05) {
        suggestions.push({
          type: "increase",
          categoryId: budget.category_id ?? "",
          categoryName: budget.budgetCategory,
          categoryColor: budget.budgetColor,
          suggestedAmount,
          currentAmount,
          avgMonthlySpend: Math.round(avgSpend * 100) / 100,
          reason: `Average spend of ${formatRound(avgSpend)}/mo is close to or exceeds your ${formatRound(currentAmount)} budget. Peak month was ${formatRound(maxMonthly)}.`,
          budgetId: budget.id,
        });
      }
    }

    // Suggest DECREASE if consistently underspending (avg < 50% of budget)
    if (avgSpend < currentAmount * 0.5 && currentAmount > 10) {
      const suggestedAmount = Math.ceil(avgSpend * 1.2);
      if (suggestedAmount < currentAmount * 0.85) {
        suggestions.push({
          type: "decrease",
          categoryId: budget.category_id ?? "",
          categoryName: budget.budgetCategory,
          categoryColor: budget.budgetColor,
          suggestedAmount: Math.max(suggestedAmount, 5),
          currentAmount,
          avgMonthlySpend: Math.round(avgSpend * 100) / 100,
          reason: `You typically spend only ${formatRound(avgSpend)}/mo — well under your ${formatRound(currentAmount)} budget. Tightening it could improve tracking accuracy.`,
          budgetId: budget.id,
        });
      }
    }
  }

  // Sort: new budgets first (by avg spend desc), then increases, then decreases
  const typeOrder: Record<BudgetSuggestionType, number> = { new: 0, increase: 1, decrease: 2 };
  suggestions.sort((a, b) => {
    const orderDiff = typeOrder[a.type] - typeOrder[b.type];
    if (orderDiff !== 0) return orderDiff;
    return b.avgMonthlySpend - a.avgMonthlySpend;
  });

  return suggestions.slice(0, 8);
}

function formatRound(amount: number): string {
  return amount >= 1000
    ? `${(amount / 1000).toFixed(1)}k`
    : amount.toFixed(0);
}
