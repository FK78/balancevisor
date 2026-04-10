import { db } from "@/index";
import { budgetsTable } from "@/db/schema";
import { getBudgets } from "@/db/queries/budgets";
import { getSmartBudgetSuggestions } from "@/lib/budget-suggestions";
import { logger } from "@/lib/logger";
import { revalidateDomains } from "@/lib/revalidate";

export type AutoBudgetResult = {
  budgetsCreated: number;
};

/**
 * Auto-applies "new" budget suggestions when there is sufficient data.
 * Only creates budgets for categories that have meaningful spend (≥3 months
 * of data and ≥£10/mo average). Never auto-adjusts existing budgets.
 */
export async function autoApplyBudgetSuggestions(
  userId: string,
): Promise<AutoBudgetResult> {
  try {
    const ownedBudgets = await getBudgets(userId);
    const suggestions = await getSmartBudgetSuggestions(userId, ownedBudgets);

    // Only auto-create "new" budgets — adjustments stay manual
    const newSuggestions = suggestions.filter(
      (s) => s.type === "new" && s.avgMonthlySpend >= 10,
    );

    if (newSuggestions.length === 0) return { budgetsCreated: 0 };

    const today = new Date().toISOString().split("T")[0];

    // Batch insert all new budgets in one query
    await db.insert(budgetsTable).values(
      newSuggestions.map((s) => ({
        user_id: userId,
        category_id: s.categoryId,
        amount: s.suggestedAmount,
        period: "monthly" as const,
        start_date: today,
      })),
    );

    for (const s of newSuggestions) {
      logger.info(
        "budget-auto-apply",
        `Auto-created £${s.suggestedAmount}/mo budget for "${s.categoryName}" (avg spend: £${s.avgMonthlySpend})`,
      );
    }

    revalidateDomains("budgets");

    return { budgetsCreated: newSuggestions.length };
  } catch (err) {
    logger.error("budget-auto-apply", "Auto-apply failed", err);
    return { budgetsCreated: 0 };
  }
}
