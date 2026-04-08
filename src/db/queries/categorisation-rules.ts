import { getUserDb } from '@/db/rls-context';
import { categorisationRulesTable, categoriesTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getCategorisationRules(userId: string) {
  const userDb = await getUserDb(userId);
  return await userDb.select({
    id: categorisationRulesTable.id,
    pattern: categorisationRulesTable.pattern,
    category_id: categorisationRulesTable.category_id,
    categoryName: categoriesTable.name,
    categoryColor: categoriesTable.color,
    priority: categorisationRulesTable.priority,
  })
    .from(categorisationRulesTable)
    .leftJoin(categoriesTable, eq(categorisationRulesTable.category_id, categoriesTable.id))
    .where(eq(categorisationRulesTable.user_id, userId))
    .orderBy(desc(categorisationRulesTable.priority));
}
