import { db } from "@/index";
import { truelayerConnectionsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";

/**
 * Lightweight check for whether a user has at least one TrueLayer connection.
 * Used by the dashboard layout to decide whether to enable background sync.
 */
export async function hasTrueLayerConnection(userId: string): Promise<boolean> {
  const [row] = await db
    .select({ exists: sql<boolean>`true` })
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.user_id, userId))
    .limit(1);

  return !!row;
}
