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
    let budgetsCreated = 0;

    for (const suggestion of newSuggestions) {
      await db.insert(budgetsTable).values({
        user_id: userId,
        category_id: suggestion.categoryId,
        amount: suggestion.suggestedAmount,
        period: "monthly",
        start_date: today,
      });
      budgetsCreated++;

      logger.info(
        "budget-auto-apply",
        `Auto-created £${suggestion.suggestedAmount}/mo budget for "${suggestion.categoryName}" (avg spend: £${suggestion.avgMonthlySpend})`,
      );
    }

    if (budgetsCreated > 0) {
      revalidateDomains("budgets");
    }

    return { budgetsCreated };
  } catch (err) {
    logger.error("budget-auto-apply", "Auto-apply failed", err);
    return { budgetsCreated: 0 };
  }
}
