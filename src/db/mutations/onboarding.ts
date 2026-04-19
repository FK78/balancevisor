'use server';

import { db } from '@/index';
import { accountsTable, userOnboardingTable, userPreferencesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { revalidateDomains } from '@/lib/revalidate';
import { redirect } from 'next/navigation';
import { getCurrentUserId } from '@/lib/auth';
import { DEFAULT_BASE_CURRENCY, normalizeBaseCurrency } from '@/lib/currency';
import { createUserKey } from '@/lib/encryption';
import { buildOnboardingHref } from '@/lib/onboarding-flow';

function serializePendingFeatures(features?: string[] | null): string | null {
  if (!features || features.length === 0) return null;
  return JSON.stringify(features);
}

function parsePendingFeatures(raw: string | null | undefined): string[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : [];
  } catch {
    return [];
  }
}

type OnboardingUpdates = Partial<{
  base_currency: string;
  use_default_categories: boolean;
  completed: boolean;
  completed_at: Date | null;
  pending_features: string[] | null;
}>;

async function upsertOnboardingState(userId: string, updates: OnboardingUpdates) {
  const serializedUpdates: Record<string, unknown> = { ...updates };
  if ('pending_features' in updates) {
    serializedUpdates.pending_features = serializePendingFeatures(updates.pending_features);
  }

  await db.insert(userOnboardingTable).values({
    user_id: userId,
    base_currency: normalizeBaseCurrency(updates.base_currency ?? DEFAULT_BASE_CURRENCY),
    use_default_categories: updates.use_default_categories ?? false,
    completed: updates.completed ?? false,
    completed_at: updates.completed_at ?? null,
    pending_features: serializePendingFeatures(updates.pending_features),
  }).onConflictDoUpdate({
    target: userOnboardingTable.user_id,
    set: serializedUpdates,
  });
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

  revalidateDomains('onboarding', 'accounts');
  const ai = formData.get('ai_enabled');
  redirect(buildOnboardingHref('account-method', { aiEnabled: ai !== '0' }));
}

const FEATURE_ROUTES: Record<string, string> = {
  accounts: '/dashboard/accounts',
  investments: '/dashboard/investments',
  zakat: '/dashboard/zakat',
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

async function persistAiPreference(userId: string, aiEnabled?: boolean) {
  if (typeof aiEnabled !== 'boolean') return;
  const now = new Date();
  await db.insert(userPreferencesTable).values({
    user_id: userId,
    ai_enabled: aiEnabled,
    updated_at: now,
  }).onConflictDoUpdate({
    target: userPreferencesTable.user_id,
    set: { ai_enabled: aiEnabled, updated_at: now },
  });
}

export async function completeOnboarding(aiEnabled?: boolean) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId);
  await persistAiPreference(userId, aiEnabled);
  redirect('/dashboard');
}

export async function skipOnboarding(aiEnabled?: boolean) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId);
  await persistAiPreference(userId, aiEnabled);
  redirect('/dashboard');
}

export async function completeOnboardingAndRedirectWithFeatures(
  features: string[],
  firstFeature?: string,
  aiEnabled?: boolean,
) {
  const userId = await getCurrentUserId();
  await finishOnboarding(userId, features);
  await persistAiPreference(userId, aiEnabled);

  const route = firstFeature ? FEATURE_ROUTES[firstFeature] : '/dashboard';
  redirect(route || '/dashboard');
}

export async function markFeatureVisited(feature: string) {
  const userId = await getCurrentUserId();
  const [state] = await db.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  if (!state || !state.pending_features) return;

  const pendingFeatures = parsePendingFeatures(state.pending_features);
  const updatedFeatures = pendingFeatures.filter((f) => f !== feature);

  await db.update(userOnboardingTable)
    .set({ pending_features: serializePendingFeatures(updatedFeatures) })
    .where(eq(userOnboardingTable.user_id, userId));

  revalidateDomains('onboarding');
}

export async function getNextPendingFeature(): Promise<string | null> {
  const userId = await getCurrentUserId();
  const [state] = await db.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  if (!state || !state.pending_features) return null;

  const pendingFeatures = parsePendingFeatures(state.pending_features);
  return pendingFeatures.length > 0 ? pendingFeatures[0] : null;
}
