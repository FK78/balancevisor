import { getUserDb } from '@/db/rls-context';
import { goalsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getGoals(userId: string) {
  const userDb = await getUserDb(userId);
  return await userDb.select()
    .from(goalsTable)
    .where(eq(goalsTable.user_id, userId))
    .orderBy(desc(goalsTable.created_at));
}
