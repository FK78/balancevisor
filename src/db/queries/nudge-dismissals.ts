import { db } from "@/index";
import { nudgeDismissalsTable } from "@/db/schema";
import { eq } from "drizzle-orm";

export async function getDismissedNudgeKeys(userId: string): Promise<Set<string>> {
  const rows = await db
    .select({ nudge_key: nudgeDismissalsTable.nudge_key })
    .from(nudgeDismissalsTable)
    .where(eq(nudgeDismissalsTable.user_id, userId));

  return new Set(rows.map((r) => r.nudge_key));
}
