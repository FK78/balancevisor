import { NextResponse } from "next/server";
import { db } from "@/index";
import { manualHoldingsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler } from "@/lib/api-v1";
import { revalidateDomains } from "@/lib/revalidate";

export const DELETE = v1Handler(async ({ userId, params }) => {
  await db.delete(manualHoldingsTable).where(
    and(eq(manualHoldingsTable.id, params.id), eq(manualHoldingsTable.user_id, userId)),
  );

  revalidateDomains("investments");
  return new NextResponse(null, { status: 204 });
});
