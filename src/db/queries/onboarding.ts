import { db } from '@/index';
import { userOnboardingTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { DEFAULT_BASE_CURRENCY, normalizeBaseCurrency } from '@/lib/currency';

export async function getOnboardingState(userId: string) {
  const [row] = await db.select()
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

function parsePendingFeatures(raw: string | null | undefined): string[] | null {
  if (!raw) return null;
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === 'string') : null;
  } catch {
    return null;
  }
}

export async function getPendingFeatures(userId: string): Promise<string[] | null> {
  const [row] = await db.select({ pending_features: userOnboardingTable.pending_features })
    .from(userOnboardingTable)
    .where(eq(userOnboardingTable.user_id, userId))
    .limit(1);

  return parsePendingFeatures(row?.pending_features ?? null);
}
