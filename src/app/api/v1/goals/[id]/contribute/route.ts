import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { goalsTable } from "@/db/schema";
import { eq, and, sql } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { requireOwnership } from "@/lib/ownership";
import { revalidateDomains } from "@/lib/revalidate";

const contributeSchema = z.object({
  amount: z.number().min(0.01),
});

export const POST = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, contributeSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(goalsTable, params.id, userId, "goal");

  await db.update(goalsTable).set({
    saved_amount: sql`${goalsTable.saved_amount} + ${body.amount}`,
  }).where(and(eq(goalsTable.id, params.id), eq(goalsTable.user_id, userId)));

  revalidateDomains("goals");
  return mutationResponse({ id: params.id });
});
