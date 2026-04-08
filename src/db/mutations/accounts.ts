'use server';

import { db } from '@/index';
import { accountsTable, transactionsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidatePath } from 'next/cache';
import { getCurrentUserId } from '@/lib/auth';
import { getUserBaseCurrency } from '@/db/queries/onboarding';
import { encryptForUser, getUserKey } from '@/lib/encryption';
import { requireString, sanitizeNumber, sanitizeEnum } from '@/lib/sanitize';
import { UnauthorizedError } from '@/lib/errors';
import { invalidateByUser } from '@/lib/cache';

export async function addAccount(formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  const name = requireString(formData.get('name') as string, 'Account name');
  const type = sanitizeEnum(formData.get('type') as string, ['currentAccount', 'savings', 'creditCard', 'investment'] as const, 'currentAccount');
  const balance = sanitizeNumber(formData.get('balance') as string, 'Balance');

  const [result] = await db.insert(accountsTable).values({
    user_id: userId,
    name: encryptForUser(name, userKey),
    type,
    balance,
    currency: baseCurrency,
  }).returning({ id: accountsTable.id });
  revalidatePath('/onboarding');
  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard');
  return result;
}

export async function editAccount(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  // Verify ownership
  const [account] = await db
    .select({ user_id: accountsTable.user_id })
    .from(accountsTable)
    .where(eq(accountsTable.id, id));

  if (!account || account.user_id !== userId) {
    throw new UnauthorizedError('account');
  }

  const name = requireString(formData.get('name') as string, 'Account name');
  const type = sanitizeEnum(formData.get('type') as string, ['currentAccount', 'savings', 'creditCard', 'investment'] as const, 'currentAccount');
  const balance = sanitizeNumber(formData.get('balance') as string, 'Balance');

  await db.update(accountsTable).set({
    name: encryptForUser(name, userKey),
    type,
    balance,
    currency: baseCurrency,
  }).where(eq(accountsTable.id, id));

  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard');
  invalidateByUser(userId);
}

export async function deleteAccount(id: string) {
  const userId = await getCurrentUserId();

  // Verify ownership
  const [account] = await db
    .select({ user_id: accountsTable.user_id })
    .from(accountsTable)
    .where(eq(accountsTable.id, id));

  if (!account || account.user_id !== userId) {
    throw new UnauthorizedError('account');
  }

  await db.delete(transactionsTable).where(eq(transactionsTable.account_id, id));
  await db.delete(accountsTable).where(eq(accountsTable.id, id));

  revalidatePath('/dashboard/accounts');
  revalidatePath('/dashboard');
  invalidateByUser(userId);
}
