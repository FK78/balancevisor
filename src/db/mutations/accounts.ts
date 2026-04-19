'use server';

import { db } from '@/index';
import { accountsTable } from '@/db/schema';
import { eq, and } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { getCurrentUserId } from '@/lib/auth';
import { getUserBaseCurrency } from '@/db/queries/onboarding';
import { encryptForUser, getUserKey } from '@/lib/encryption';
import { z } from 'zod';
import { parseFormData, zRequiredString, zNumber, zEnum } from '@/lib/form-schema';
import { requireOwnership } from '@/lib/ownership';

export async function addAccount(formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  const accountSchema = z.object({
    name: zRequiredString(),
    type: zEnum(['currentAccount', 'savings', 'creditCard', 'investment'] as const, 'currentAccount'),
    balance: zNumber(),
  });
  const { name, type, balance } = parseFormData(accountSchema, formData);

  const [result] = await db.insert(accountsTable).values({
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

  const accountSchema = z.object({
    name: zRequiredString(),
    type: zEnum(['currentAccount', 'savings', 'creditCard', 'investment'] as const, 'currentAccount'),
    balance: zNumber(),
  });
  const { name, type, balance } = parseFormData(accountSchema, formData);

  await db.update(accountsTable).set({
    name: encryptForUser(name, userKey),
    type,
    balance,
    currency: baseCurrency,
  }).where(and(eq(accountsTable.id, id), eq(accountsTable.user_id, userId)));

  revalidateDomains('accounts');
}

export async function deleteAccount(id: string) {
  const userId = await getCurrentUserId();

  await requireOwnership(accountsTable, id, userId, 'account');

  await db.delete(accountsTable).where(and(eq(accountsTable.id, id), eq(accountsTable.user_id, userId)));

  revalidateDomains('accounts');
}
