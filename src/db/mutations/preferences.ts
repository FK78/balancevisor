'use server';

import { db } from '@/index';
import { userPreferencesTable } from '@/db/schema';
import { getCurrentUserId } from '@/lib/auth';
import { revalidateDomains } from '@/lib/revalidate';

export async function toggleAiEnabled(
  enabled: boolean,
): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();

    await db.insert(userPreferencesTable).values({
      user_id: userId,
      ai_enabled: enabled,
      updated_at: new Date(),
    }).onConflictDoUpdate({
      target: userPreferencesTable.user_id,
      set: { ai_enabled: enabled, updated_at: new Date() },
    });

    revalidateDomains('settings');
    return { success: true };
  } catch {
    return { error: 'Failed to update AI preference.' };
  }
}

export async function updateDisabledFeatures(
  disabledFeatures: string[],
): Promise<{ success?: boolean; error?: string }> {
  try {
    const userId = await getCurrentUserId();
    const value = disabledFeatures.length > 0 ? JSON.stringify(disabledFeatures) : null;

    await db.insert(userPreferencesTable).values({
      user_id: userId,
      disabled_features: value,
      updated_at: new Date(),
    }).onConflictDoUpdate({
      target: userPreferencesTable.user_id,
      set: { disabled_features: value, updated_at: new Date() },
    });

    revalidateDomains();
    return { success: true };
  } catch {
    return { error: 'Failed to update feature preferences.' };
  }
}
