'use server';

import { db } from '@/index';
import { subscriptionsTable, accountsTable } from '@/db/schema';
import { eq, and, sql } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';
import { createTransaction } from '@/db/mutations/transactions';
import { checkBudgetAlerts } from '@/lib/budget-alerts';
import { requireString, sanitizeNumber, sanitizeEnum, requireDate, sanitizeUUID, sanitizeURL, sanitizeString, sanitizeColor } from '@/lib/sanitize';

export async function addSubscription(formData: FormData) {
  const userId = await getCurrentUserId();
  const name = requireString(formData.get('name') as string, 'Subscription name');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const accountId = requireString(formData.get('account_id') as string, 'Account');
  const categoryId = sanitizeUUID(formData.get('category_id') as string);
  const nextBillingDate = requireDate(formData.get('next_billing_date') as string, 'Next billing date');
  const currency = sanitizeEnum(formData.get('currency') as string, ['GBP', 'USD', 'EUR'] as const, 'GBP');
  const billing_cycle = sanitizeEnum(formData.get('billing_cycle') as string, ['weekly', 'monthly', 'quarterly', 'yearly'] as const, 'monthly');
  const url = sanitizeURL(formData.get('url') as string);
  const notes = sanitizeString(formData.get('notes') as string, 500);
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

  const [result] = await db.insert(subscriptionsTable).values({
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
  }, userId);

  await db.update(accountsTable)
    .set({ balance: sql`${accountsTable.balance} - ${amount}` })
    .where(eq(accountsTable.id, accountId));

  await checkBudgetAlerts(userId);

  revalidatePath('/dashboard/subscriptions');
  revalidatePath('/dashboard/transactions');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard');
  return result;
}

export async function editSubscription(id: string, formData: FormData) {
  const userId = await getCurrentUserId();

  const name = requireString(formData.get('name') as string, 'Subscription name');
  const amount = sanitizeNumber(formData.get('amount') as string, 'Amount', { required: true, min: 0.01 });
  const accountId = requireString(formData.get('account_id') as string, 'Account');
  const categoryId = sanitizeUUID(formData.get('category_id') as string);
  const nextBillingDate = requireDate(formData.get('next_billing_date') as string, 'Next billing date');
  const currency = sanitizeEnum(formData.get('currency') as string, ['GBP', 'USD', 'EUR'] as const, 'GBP');
  const billing_cycle = sanitizeEnum(formData.get('billing_cycle') as string, ['weekly', 'monthly', 'quarterly', 'yearly'] as const, 'monthly');
  const url = sanitizeURL(formData.get('url') as string);
  const notes = sanitizeString(formData.get('notes') as string, 500);
  const color = sanitizeColor(formData.get('color') as string);
  const icon = sanitizeString(formData.get('icon') as string, 50);

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

  revalidatePath('/dashboard/subscriptions');
  revalidatePath('/dashboard');
}

export async function deleteSubscription(id: string) {
  const userId = await getCurrentUserId();
  await db.delete(subscriptionsTable).where(
    and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.user_id, userId))
  );
  revalidatePath('/dashboard/subscriptions');
  revalidatePath('/dashboard');
}

export async function toggleSubscription(id: string) {
  const userId = await getCurrentUserId();

  const [sub] = await db.select({ is_active: subscriptionsTable.is_active })
    .from(subscriptionsTable)
    .where(and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.user_id, userId)));

  if (!sub) return;

  await db.update(subscriptionsTable).set({
    is_active: !sub.is_active,
  }).where(and(eq(subscriptionsTable.id, id), eq(subscriptionsTable.user_id, userId)));

  revalidatePath('/dashboard/subscriptions');
  revalidatePath('/dashboard');
}
