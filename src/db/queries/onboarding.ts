import { getUserDb, adminDb } from '@/db/rls-context';
import { defaultCategoryTemplatesTable, userOnboardingTable } from '@/db/schema';
import { asc, eq } from 'drizzle-orm';
import { DEFAULT_BASE_CURRENCY, normalizeBaseCurrency } from '@/lib/currency';

export async function getOnboardingState(userId: string) {
  const userDb = await getUserDb(userId);
  const [row] = await userDb.select()
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  return row ?? null;
}

export async function hasCompletedOnboarding(userId: string) {
  const state = await getOnboardingState(userId);
  return state?.completed === true;
}

export async function getUserBaseCurrency(userId: string) {
  const state = await getOnboardingState(userId);
  return normalizeBaseCurrency(state?.base_currency ?? DEFAULT_BASE_CURRENCY);
}

export async function getDefaultCategoryTemplates() {
  return await adminDb.select()
    .from(defaultCategoryTemplatesTable)
    .where(eq(defaultCategoryTemplatesTable.is_active, true))
    .orderBy(asc(defaultCategoryTemplatesTable.sort_order), asc(defaultCategoryTemplatesTable.id));
}

export async function getPendingFeatures(userId: string): Promise<string | null> {
  const userDb = await getUserDb(userId);
  const [row] = await userDb.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  return row?.pending_features ?? null;
}
