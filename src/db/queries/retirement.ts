import { db } from '@/index';
import { retirementProfilesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';

export type RetirementProfile = typeof retirementProfilesTable.$inferSelect;

export async function getRetirementProfile(userId: string): Promise<RetirementProfile | null> {
  const [row] = await db
    .select()
    .from(retirementProfilesTable)
    .where(eq(retirementProfilesTable.user_id, userId))
    .limit(1);
  return row ?? null;
}
