import { db } from "@/index";
import { truelayerConnectionsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { getCurrentUserId } from "@/lib/auth";

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

/**
 * Get all TrueLayer connections for the current user.
 * Returns connection metadata (no tokens).
 */
export async function getTrueLayerConnections() {
  const userId = await getCurrentUserId();

  return db
    .select({
      id: truelayerConnectionsTable.id,
      provider_name: truelayerConnectionsTable.provider_name,
      connected_at: truelayerConnectionsTable.connected_at,
      last_synced_at: truelayerConnectionsTable.last_synced_at,
    })
    .from(truelayerConnectionsTable)
    .where(eq(truelayerConnectionsTable.user_id, userId));
}
