import { db } from '@/index';
import { userPreferencesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function getUserPreferences(userId: string) {
  const [row] = await db.select()
    .from(userPreferencesTable)
    .where(eq(userPreferencesTable.user_id, userId))
    .limit(1);

  return row ?? null;
}

/**
 * Returns whether AI features are enabled for the user.
 * Defaults to true if no preference row exists (opt-out model).
 */
export async function isAiEnabled(userId: string): Promise<boolean> {
  const prefs = await getUserPreferences(userId);
  return prefs?.ai_enabled ?? true;
}
