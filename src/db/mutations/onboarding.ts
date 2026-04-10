'use server';

import { db } from '@/index';
import { accountsTable, categoriesTable, defaultCategoryTemplatesTable, userOnboardingTable, userPreferencesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { DEFAULT_BASE_CURRENCY, normalizeBaseCurrency } from '@/lib/currency';
import { createUserKey } from '@/lib/encryption';
import { buildOnboardingHref } from '@/lib/onboarding-flow';

async function upsertOnboardingState(userId: string, updates: Partial<{
  base_currency: string;
  use_default_categories: boolean;
  completed: boolean;
  completed_at: Date | null;
  pending_features: string[] | null;
}>) {
  await db.insert(userOnboardingTable).values({
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
  const templates = await db.select()
    .from(defaultCategoryTemplatesTable)
    .where(eq(defaultCategoryTemplatesTable.is_active, true));

  if (templates.length === 0) {
    return;
  }

  const existingCategories = await db.select({ name: categoriesTable.name })
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
    await db.insert(categoriesTable).values(rowsToInsert).onConflictDoNothing();
  }
}

export async function setBaseCurrency(formData: FormData) {
  const userId = await getCurrentUserId();
  const baseCurrency = normalizeBaseCurrency(formData.get('base_currency') as string | null);

  await db.transaction(async (tx) => {
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
  const ai = formData.get('ai_enabled');
  redirect(buildOnboardingHref('setup', { aiEnabled: ai !== '0' }));
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
  const ai = formData.get('ai_enabled');
  const aiEnabled = ai !== '0';
  if (intent === 'apply') {
    redirect(buildOnboardingHref('setup', { aiEnabled }));
  }

  redirect(buildOnboardingHref('review', { aiEnabled }));
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
    pending_features: features && features.length > 0 ? features : null,
  });
  revalidateDomains('onboarding');
}

export async function completeOnboarding(aiEnabled?: boolean) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId);
  if (typeof aiEnabled === 'boolean') {
    await db.insert(userPreferencesTable).values({
      user_id: userId,
      ai_enabled: aiEnabled,
      updated_at: new Date(),
    }).onConflictDoUpdate({
      target: userPreferencesTable.user_id,
      set: { ai_enabled: aiEnabled, updated_at: new Date() },
    });
  }
  redirect('/dashboard');
}

export async function skipOnboarding(aiEnabled?: boolean) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId);
  if (typeof aiEnabled === 'boolean') {
    await db.insert(userPreferencesTable).values({
      user_id: userId,
      ai_enabled: aiEnabled,
      updated_at: new Date(),
    }).onConflictDoUpdate({
      target: userPreferencesTable.user_id,
      set: { ai_enabled: aiEnabled, updated_at: new Date() },
    });
  }
  redirect('/dashboard');
}

export async function completeOnboardingAndRedirectWithFeatures(
  features: string[],
  firstFeature?: string,
  disabledFeatures?: string[],
  aiEnabled?: boolean,
) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId, features);

  const hasDisabled = disabledFeatures && disabledFeatures.length > 0;
  const hasAiPref = typeof aiEnabled === 'boolean';

  if (hasDisabled || hasAiPref) {
    const now = new Date();
    const disabledJson = hasDisabled ? JSON.stringify(disabledFeatures) : undefined;

    await db.insert(userPreferencesTable).values({
      user_id: userId,
      ...(hasDisabled && { disabled_features: disabledJson }),
      ...(hasAiPref && { ai_enabled: aiEnabled }),
      updated_at: now,
    }).onConflictDoUpdate({
      target: userPreferencesTable.user_id,
      set: {
        ...(hasDisabled && { disabled_features: disabledJson }),
        ...(hasAiPref && { ai_enabled: aiEnabled }),
        updated_at: now,
      },
    });
  }

  const route = firstFeature ? FEATURE_ROUTES[firstFeature] : '/dashboard';
  redirect(route || '/dashboard');
}

export async function markFeatureVisited(feature: string) {
  const userId = await getCurrentUserId();
  const state = await db.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  if (state.length === 0 || !state[0].pending_features) return;

  const pendingFeatures = state[0].pending_features as string[];
  const updatedFeatures = pendingFeatures.filter((f) => f !== feature);

  await db.update(userOnboardingTable)
    .set({ pending_features: updatedFeatures.length > 0 ? updatedFeatures : null })
    .where(eq(userOnboardingTable.user_id, userId));

  revalidateDomains();
}

export async function getNextPendingFeature(): Promise<string | null> {
  const userId = await getCurrentUserId();
  const state = await db.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  if (state.length === 0 || !state[0].pending_features) return null;

  const pendingFeatures = state[0].pending_features as string[];
  return pendingFeatures.length > 0 ? pendingFeatures[0] : null;
}
