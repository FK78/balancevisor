import { db } from '@/index';
import { zakatSettingsTable, zakatCalculationsTable } from '@/db/schema';
import { eq, desc } from 'drizzle-orm';

export async function getZakatSettings(userId: string) {
  const [row] = await db
    .select()
    .from(zakatSettingsTable)
    .where(eq(zakatSettingsTable.user_id, userId))
    .limit(1);
  return row ?? null;
}

export async function getZakatCalculations(userId: string, limit = 10) {
  return db
    .select()
    .from(zakatCalculationsTable)
    .where(eq(zakatCalculationsTable.user_id, userId))
    .orderBy(desc(zakatCalculationsTable.calculated_at))
    .limit(limit);
}

export async function getLatestZakatCalculation(userId: string) {
  const [row] = await db
    .select()
    .from(zakatCalculationsTable)
    .where(eq(zakatCalculationsTable.user_id, userId))
    .orderBy(desc(zakatCalculationsTable.calculated_at))
    .limit(1);
  return row ?? null;
}
