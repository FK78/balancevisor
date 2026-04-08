'use server';

import { getUserDb } from '@/db/rls-context';
import { budgetAlertPreferencesTable, budgetNotificationsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';

export async function upsertAlertPreferences(
  budgetId: string,
  threshold: number,
  browserAlerts: boolean,
  emailAlerts: boolean,
) {
  const userId = await getCurrentUserId();

  const userDb = await getUserDb(userId);
  const [existing] = await userDb.select()
    .from(budgetAlertPreferencesTable)
    .where(
      and(
        eq(budgetAlertPreferencesTable.budget_id, budgetId),
        eq(budgetAlertPreferencesTable.user_id, userId),
      )
    );

  if (existing) {
    await userDb.update(budgetAlertPreferencesTable)
      .set({ threshold, browser_alerts: browserAlerts, email_alerts: emailAlerts })
      .where(eq(budgetAlertPreferencesTable.id, existing.id));
  } else {
    await userDb.insert(budgetAlertPreferencesTable).values({
      budget_id: budgetId,
      user_id: userId,
      threshold,
      browser_alerts: browserAlerts,
      email_alerts: emailAlerts,
    });
  }

  revalidateDomains('budgets');
}

export async function markNotificationRead(notificationId: string) {
  const userId = await getCurrentUserId();
  const userDb = await getUserDb(userId);
  await userDb.update(budgetNotificationsTable)
    .set({ is_read: true })
    .where(eq(budgetNotificationsTable.id, notificationId));
  revalidateDomains();
}

export async function markAllNotificationsRead() {
  const userId = await getCurrentUserId();
  const userDb = await getUserDb(userId);
  await userDb.update(budgetNotificationsTable)
    .set({ is_read: true })
    .where(
      and(
        eq(budgetNotificationsTable.user_id, userId),
        eq(budgetNotificationsTable.is_read, false),
      )
    );
  revalidateDomains();
}

export async function createNotification(
  userId: string,
  budgetId: string,
  alertType: 'threshold_warning' | 'over_budget',
  message: string,
) {
  const userDb = await getUserDb(userId);
  return await userDb.insert(budgetNotificationsTable).values({
    user_id: userId,
    budget_id: budgetId,
    alert_type: alertType,
    message,
  }).returning({ id: budgetNotificationsTable.id });
}
