import { getUserDb } from '@/db/rls-context';
import { categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { CategoryWithColor } from '@/lib/types';

export async function getCategoriesByUser(userId: string): Promise<CategoryWithColor[]> {
  const userDb = await getUserDb(userId);
  return await userDb.select()
    .from(categoriesTable)
    .where(eq(categoriesTable.user_id, userId));
}
