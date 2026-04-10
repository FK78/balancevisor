import { db } from '@/index';
import {
  budgetsTable,
  budgetAlertPreferencesTable,
  budgetNotificationsTable,
  categoriesTable,
  transactionsTable,
} from '@/db/schema';
import { eq, sum, and, gte, lt, inArray } from 'drizzle-orm';
import { sendBudgetAlertEmail } from '@/lib/email';
import { createClient } from '@/lib/supabase/server';
import { getUserBaseCurrency } from '@/db/queries/onboarding';
import { getMonthRange } from '@/lib/date';

/**
 * Atomically create a budget notification only if one with the same
 * (user, budget, alert_type) doesn't already exist this month.
 * Returns the new notification ID, or null if it was a duplicate.
 */
async function createNotificationIfNotExists(
  userId: string,
  budgetId: string,
  alertType: 'threshold_warning' | 'over_budget',
  message: string,
): Promise<{ id: string } | null> {
  return db.transaction(async (tx) => {
    const { start } = getMonthRange();
    const [existing] = await tx.select({ id: budgetNotificationsTable.id })
      .from(budgetNotificationsTable)
      .where(and(
        eq(budgetNotificationsTable.user_id, userId),
        eq(budgetNotificationsTable.budget_id, budgetId),
        eq(budgetNotificationsTable.alert_type, alertType),
        gte(budgetNotificationsTable.created_at, new Date(start)),
      ))
      .limit(1);

    if (existing) return null;

    const [row] = await tx.insert(budgetNotificationsTable).values({
      user_id: userId,
      budget_id: budgetId,
      alert_type: alertType,
      message,
    }).returning({ id: budgetNotificationsTable.id });

    return row;
  });
}

type BudgetWithSpend = {
  budgetId: string;
  categoryName: string;
  budgetAmount: number;
  spent: number;
  threshold: number;
  browserAlerts: boolean;
  emailAlerts: boolean;
};

async function getBudgetsWithSpendAndPrefs(userId: string): Promise<BudgetWithSpend[]> {
  const { start, end } = getMonthRange();

  const budgets = await db.select({
    budgetId: budgetsTable.id,
    categoryName: categoriesTable.name,
    budgetAmount: budgetsTable.amount,
    spent: sum(transactionsTable.amount),
  })
    .from(budgetsTable)
    .innerJoin(categoriesTable, eq(categoriesTable.id, budgetsTable.category_id))
    .leftJoin(transactionsTable, and(
      eq(transactionsTable.category_id, budgetsTable.category_id),
      gte(transactionsTable.date, start),
      lt(transactionsTable.date, end),
    ))
    .where(eq(budgetsTable.user_id, userId))
    .groupBy(budgetsTable.id, categoriesTable.name, budgetsTable.amount);

  const prefs = await db.select()
    .from(budgetAlertPreferencesTable)
    .where(eq(budgetAlertPreferencesTable.user_id, userId));

  const prefsMap = new Map(prefs.map(p => [p.budget_id, p]));

  return budgets.map(b => {
    const pref = prefsMap.get(b.budgetId);
    return {
      budgetId: b.budgetId,
      categoryName: b.categoryName,
      budgetAmount: b.budgetAmount,
      spent: Number(b.spent ?? 0),
      threshold: pref?.threshold ?? 80,
      browserAlerts: pref?.browser_alerts ?? true,
      emailAlerts: pref?.email_alerts ?? false,
    };
  });
}

/**
 * Batch-fetch all recent notifications for the given budgets this month.
 * Returns a Set of "budgetId:alertType" keys for O(1) lookup.
 */
async function getRecentNotificationKeys(
  userId: string,
  budgetIds: string[],
): Promise<Set<string>> {
  if (budgetIds.length === 0) return new Set();

  const { start } = getMonthRange();

  const rows = await db.select({
    budget_id: budgetNotificationsTable.budget_id,
    alert_type: budgetNotificationsTable.alert_type,
  })
    .from(budgetNotificationsTable)
    .where(and(
      eq(budgetNotificationsTable.user_id, userId),
      inArray(budgetNotificationsTable.budget_id, budgetIds),
      gte(budgetNotificationsTable.created_at, new Date(start)),
    ));

  return new Set(rows.map(r => `${r.budget_id}:${r.alert_type}`));
}

export type TriggeredAlert = {
  budgetId: string;
  alertType: 'threshold_warning' | 'over_budget';
  message: string;
  emailAlerts: boolean;
};

/**
 * Checks all budgets for a user and creates notifications for any
 * that have crossed their alert threshold or gone over budget.
 * Returns the list of newly triggered alerts (for browser push).
 */
export async function checkBudgetAlerts(userId: string): Promise<TriggeredAlert[]> {
  const budgets = await getBudgetsWithSpendAndPrefs(userId);
  const triggered: TriggeredAlert[] = [];

  // Pre-fetch user email and currency for potential email alerts
  let userEmail: string | undefined;
  let baseCurrency = 'GBP';
  const needsEmail = budgets.some(b => b.emailAlerts);
  if (needsEmail) {
    const [supabase, currency] = await Promise.all([
      createClient(),
      getUserBaseCurrency(userId),
    ]);
    const { data: { user } } = await supabase.auth.getUser();
    userEmail = user?.email ?? undefined;
    baseCurrency = currency;
  }

  const activeBudgetIds = budgets
    .filter(b => (b.browserAlerts || b.emailAlerts) && b.budgetAmount > 0)
    .map(b => b.budgetId);
  const recentKeys = await getRecentNotificationKeys(userId, activeBudgetIds);

  for (const b of budgets) {
    if (!b.browserAlerts && !b.emailAlerts) continue;
    if (b.budgetAmount <= 0) continue;

    const percent = (b.spent / b.budgetAmount) * 100;

    if (percent >= 100) {
      const already = recentKeys.has(`${b.budgetId}:over_budget`);
      if (!already) {
        const message = `You've exceeded your ${b.categoryName} budget! Spent ${percent.toFixed(0)}% of your ${b.categoryName} budget.`;
        const created = await createNotificationIfNotExists(userId, b.budgetId, 'over_budget', message);
        if (created) {
          triggered.push({
            budgetId: b.budgetId,
            alertType: 'over_budget',
            message,
            emailAlerts: b.emailAlerts,
          });

          if (b.emailAlerts && userEmail) {
            await sendBudgetAlertEmail(
              userEmail,
              `${b.categoryName} budget exceeded`,
              'over_budget',
              b.categoryName,
              percent,
              b.budgetAmount,
              b.spent,
              baseCurrency,
            );
          }
        }
      }
    } else if (percent >= b.threshold) {
      const already = recentKeys.has(`${b.budgetId}:threshold_warning`);
      if (!already) {
        const message = `Heads up — you've used ${percent.toFixed(0)}% of your ${b.categoryName} budget.`;
        const created = await createNotificationIfNotExists(userId, b.budgetId, 'threshold_warning', message);
        if (created) {
          triggered.push({
            budgetId: b.budgetId,
            alertType: 'threshold_warning',
            message,
            emailAlerts: b.emailAlerts,
          });

          if (b.emailAlerts && userEmail) {
            await sendBudgetAlertEmail(
              userEmail,
              `${b.categoryName} budget at ${percent.toFixed(0)}%`,
              'threshold_warning',
              b.categoryName,
              percent,
              b.budgetAmount,
              b.spent,
              baseCurrency,
            );
          }
        }
      }
    }
  }

  return triggered;
}
