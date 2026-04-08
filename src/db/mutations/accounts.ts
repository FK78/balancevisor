'use server';

import { getUserDb } from '@/db/rls-context';
import { accountsTable, transactionsTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { getUserBaseCurrency } from '@/db/queries/onboarding';
import { encryptForUser, getUserKey } from '@/lib/encryption';
import { requireString, sanitizeNumber, sanitizeEnum } from '@/lib/sanitize';
import { requireOwnership } from '@/lib/ownership';
import { invalidateByUser } from '@/lib/cache';

export async function addAccount(formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  const name = requireString(formData.get('name') as string, 'Account name');
  const type = sanitizeEnum(formData.get('type') as string, ['currentAccount', 'savings', 'creditCard', 'investment'] as const, 'currentAccount');
  const balance = sanitizeNumber(formData.get('balance') as string, 'Balance');

  const userDb = await getUserDb(userId);
  const [result] = await userDb.insert(accountsTable).values({
    user_id: userId,
    name: encryptForUser(name, userKey),
    type,
    balance,
    currency: baseCurrency,
  }).returning({ id: accountsTable.id });
  revalidateDomains('accounts', 'onboarding');
  return result;
}

export async function editAccount(id: string, formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  await requireOwnership(accountsTable, id, userId, 'account');

  const name = requireString(formData.get('name') as string, 'Account name');
  const type = sanitizeEnum(formData.get('type') as string, ['currentAccount', 'savings', 'creditCard', 'investment'] as const, 'currentAccount');
  const balance = sanitizeNumber(formData.get('balance') as string, 'Balance');

  const userDb = await getUserDb(userId);
  await userDb.update(accountsTable).set({
    name: encryptForUser(name, userKey),
    type,
    balance,
    currency: baseCurrency,
  }).where(eq(accountsTable.id, id));

  revalidateDomains('accounts');
  invalidateByUser(userId);
}

export async function deleteAccount(id: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(accountsTable, id, userId, 'account');

  const userDb = await getUserDb(userId);
  await userDb.delete(transactionsTable).where(eq(transactionsTable.account_id, id));
  await userDb.delete(accountsTable).where(eq(accountsTable.id, id));

  revalidateDomains('accounts');
  invalidateByUser(userId);
}
