import { db } from '@/index';
import { categoriesTable } from '@/db/schema';
import { eq } from 'drizzle-orm';
import type { CategoryWithColor } from '@/lib/types';

export async function getCategoriesByUser(userId: string): Promise<CategoryWithColor[]> {
  return await db.select()
    .from(categoriesTable)
    .where(eq(categoriesTable.user_id, userId));
}
