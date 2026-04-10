'use server';

import { db } from '@/index';
import { subscriptionsTable, accountsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { createTransaction } from '@/db/mutations/transactions';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zEnum, zRequiredDate, zUUID, zURL, zString, zColor } from '@/lib/form-schema';

const subscriptionSchema = z.object({
  name: zRequiredString(),
  amount: zNumber({ min: 0.01 }),
  account_id: zRequiredString(),
  category_id: zUUID(),
  next_billing_date: zRequiredDate(),
  currency: zEnum(['GBP', 'USD', 'EUR'] as const, 'GBP'),
  billing_cycle: zEnum(['weekly', 'monthly', 'quarterly', 'yearly'] as const, 'monthly'),
  url: zURL(),
  notes: zString(500),
  color: zColor(),
  icon: zString(50),
});

function parseSubscriptionForm(formData: FormData) {
  const data = parseFormData(subscriptionSchema, formData);
  return {
    name: data.name,
    amount: data.amount,
    accountId: data.account_id,
    categoryId: data.category_id,
    nextBillingDate: data.next_billing_date,
    currency: data.currency,
    billing_cycle: data.billing_cycle,
    url: data.url,
    notes: data.notes,
    color: data.color,
    icon: data.icon,
  };
}

export async function addSubscription(formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, amount, accountId, categoryId, nextBillingDate, currency, billing_cycle, url, notes, color, icon } = parseSubscriptionForm(formData);

  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(subscriptionsTable).values({
      user_id: userId,
      name,
      amount,
      currency,
      billing_cycle,
      next_billing_date: nextBillingDate,
      category_id: categoryId,
      account_id: accountId,
      url,
      notes,
      color,
      icon,
    }).returning({ id: subscriptionsTable.id });

    await createTransaction({
      type: 'expense',
      amount,
      description: `Subscription: ${name}`,
      is_recurring: false,
      date: nextBillingDate,
      account_id: accountId,
      category_id: categoryId,
    }, userId, tx);

    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} - ${amount}` })
      .where(eq(accountsTable.id, accountId));

    return inserted;
  });

  await checkBudgetAlerts(userId);

  revalidateDomains('subscriptions', 'transactions', 'accounts');
  return result;
}

export async function editSubscription(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, amount, accountId, categoryId, nextBillingDate, currency, billing_cycle, url, notes, color, icon } = parseSubscriptionForm(formData);

  await db.update(subscriptionsTable).set({
    name,
    amount,
    currency,
    billing_cycle,
    next_billing_date: nextBillingDate,
    category_id: categoryId,
    account_id: accountId,
    url,
    notes,
    color,
    icon,
  }).where(and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.user_id, userId)));

  revalidateDomains('subscriptions');
}

export async function deleteSubscription(id: string) {
  const userId = await getCurrentUserId();
  await db.delete(subscriptionsTable).where(
    and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.user_id, userId))
  );
  revalidateDomains('subscriptions');
}

export async function toggleSubscription(id: string) {
  const userId = await getCurrentUserId();

  await db.update(subscriptionsTable).set({
    is_active: sql`NOT ${subscriptionsTable.is_active}`,
  }).where(and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.user_id, userId)));

  revalidateDomains('subscriptions');
}
