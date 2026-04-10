"use server";

import { db } from "@/index";
import { nudgeDismissalsTable } from "@/db/schema";
import { getCurrentUserId } from "@/lib/auth";
import { revalidatePath } from "next/cache";

export async function dismissNudge(nudgeKey: string) {
  const userId = await getCurrentUserId();
  const key = nudgeKey.trim().slice(0, 100);

  await db
    .insert(nudgeDismissalsTable)
    .values({ user_id: userId, nudge_key: key })
    .onConflictDoNothing();

  revalidatePath("/dashboard");
}
