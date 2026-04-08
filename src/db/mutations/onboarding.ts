'use server';

import { getUserDb } from '@/db/rls-context';
import { accountsTable, categoriesTable, defaultCategoryTemplatesTable, userOnboardingTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { DEFAULT_BASE_CURRENCY, normalizeBaseCurrency } from '@/lib/currency';
import { createUserKey } from '@/lib/encryption';

async function upsertOnboardingState(userId: string, updates: Partial<{
  base_currency: string;
  use_default_categories: boolean;
  completed: boolean;
  completed_at: Date | null;
  pending_features: string | null;
}>) {
  const userDb = await getUserDb(userId);
  await userDb.insert(userOnboardingTable).values({
    user_id: userId,
    base_currency: normalizeBaseCurrency(updates.base_currency ?? DEFAULT_BASE_CURRENCY),
    use_default_categories: updates.use_default_categories ?? false,
    completed: updates.completed ?? false,
    completed_at: updates.completed_at ?? null,
  }).onConflictDoUpdate({
    target: userOnboardingTable.user_id,
    set: updates,
  });
}

async function insertMissingDefaultCategories(userId: string) {
  const userDb = await getUserDb(userId);
  const templates = await userDb.select()
    .from(defaultCategoryTemplatesTable)
    .where(eq(defaultCategoryTemplatesTable.is_active, true));

  if (templates.length === 0) {
    return;
  }

  const existingCategories = await userDb.select({ name: categoriesTable.name })
    .from(categoriesTable)
    .where(eq(categoriesTable.user_id, userId));

  const existingNames = new Set(existingCategories.map((category) => category.name.toLowerCase()));
  const rowsToInsert = templates
    .filter((template) => !existingNames.has(template.name.toLowerCase()))
    .map((template) => ({
      user_id: userId,
      name: template.name,
      color: template.color,
      icon: template.icon,
    }));

  if (rowsToInsert.length > 0) {
    await userDb.insert(categoriesTable).values(rowsToInsert);
  }
}

export async function setBaseCurrency(formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = normalizeBaseCurrency(formData.get('base_currency') as string | null);

  const userDb = await getUserDb(userId);
  await userDb.transaction(async (tx) => {
    await tx.insert(userOnboardingTable).values({
      user_id: userId,
      base_currency: baseCurrency,
      use_default_categories: false,
      completed: false,
      completed_at: null,
    }).onConflictDoUpdate({
      target: userOnboardingTable.user_id,
      set: { base_currency: baseCurrency },
    });

    await tx.update(accountsTable)
      .set({ currency: baseCurrency })
      .where(eq(accountsTable.user_id, userId));
  });

  revalidateDomains('onboarding', 'accounts', 'budgets', 'transactions');
  redirect('/onboarding?step=accounts');
}

export async function continueFromCategories(formData: FormData) {
  const userId = await getCurrentUserId();
  const useDefaultCategories = formData.get('use_default_categories') === 'on';
  const intent = formData.get('intent');

  await upsertOnboardingState(userId, {
    use_default_categories: useDefaultCategories,
    completed: false,
    completed_at: null,
  });

  if (useDefaultCategories) {
    await insertMissingDefaultCategories(userId);
  }

  revalidateDomains('onboarding');
  if (intent === 'apply') {
    redirect('/onboarding?step=categories');
  }

  redirect('/onboarding?step=features');
}

const FEATURE_ROUTES: Record<string, string> = {
  budgets: '/dashboard/budgets',
  goals: '/dashboard/goals',
  debts: '/dashboard/debts',
  subscriptions: '/dashboard/subscriptions',
  investments: '/dashboard/investments',
};

async function finishOnboarding(userId: string, features?: string[]) {
  await createUserKey(userId);
  await upsertOnboardingState(userId, {
    completed: true,
    completed_at: new Date(),
    pending_features: features && features.length > 0 ? JSON.stringify(features) : null,
  });
  revalidateDomains('onboarding');
}

export async function completeOnboarding() {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId);
  redirect('/dashboard');
}

export async function skipOnboarding() {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId);
  redirect('/dashboard');
}

export async function completeOnboardingAndRedirectWithFeatures(features: string[], firstFeature?: string) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId, features);
  const route = firstFeature ? FEATURE_ROUTES[firstFeature] : '/dashboard';
  redirect(route || '/dashboard');
}

export async function markFeatureVisited(feature: string) {
  const userId = await getCurrentUserId();
  const userDb = await getUserDb(userId);
  const state = await userDb.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  if (state.length === 0 || !state[0].pending_features) return;

  const pendingFeatures: string[] = JSON.parse(state[0].pending_features);
  const updatedFeatures = pendingFeatures.filter((f) => f !== feature);

  await userDb.update(userOnboardingTable)
    .set({ pending_features: updatedFeatures.length > 0 ? JSON.stringify(updatedFeatures) : null })
    .where(eq(userOnboardingTable.user_id, userId));

  revalidateDomains();
}

export async function getNextPendingFeature(): Promise<string | null> {
  const userId = await getCurrentUserId();
  const userDb = await getUserDb(userId);
  const state = await userDb.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  if (state.length === 0 || !state[0].pending_features) return null;

  const pendingFeatures: string[] = JSON.parse(state[0].pending_features);
  return pendingFeatures.length > 0 ? pendingFeatures[0] : null;
}
