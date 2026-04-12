import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { goalsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { requireOwnership } from "@/lib/ownership";
import { revalidateDomains } from "@/lib/revalidate";

const updateGoalSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  target_amount: z.number().min(0.01).optional(),
  saved_amount: z.number().min(0).optional(),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  icon: z.string().max(50).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateGoalSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(goalsTable, params.id, userId, "goal");

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.target_amount !== undefined) updates.target_amount = body.target_amount;
  if (body.saved_amount !== undefined) updates.saved_amount = body.saved_amount;
  if (body.target_date !== undefined) updates.target_date = body.target_date;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.color !== undefined) updates.color = body.color;

  await db.update(goalsTable).set(updates).where(
    and(eq(goalsTable.id, params.id), eq(goalsTable.user_id, userId)),
  );

  revalidateDomains("goals");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await requireOwnership(goalsTable, params.id, userId, "goal");

  await db.delete(goalsTable).where(
    and(eq(goalsTable.id, params.id), eq(goalsTable.user_id, userId)),
  );

  revalidateDomains("goals");
  return new NextResponse(null, { status: 204 });
});
