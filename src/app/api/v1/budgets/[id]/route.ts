import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { budgetsTable, sharedAccessTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { requireOwnership } from "@/lib/ownership";
import { revalidateDomains } from "@/lib/revalidate";

const updateBudgetSchema = z.object({
  category_id: z.string().uuid().optional(),
  amount: z.number().min(0.01).optional(),
  period: z.enum(["monthly", "weekly"]).optional(),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateBudgetSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(budgetsTable, params.id, userId, "budget");

  const updates: Record<string, unknown> = {};
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.period !== undefined) updates.period = body.period;
  if (body.start_date !== undefined) updates.start_date = body.start_date;

  await db.update(budgetsTable).set(updates).where(
    and(eq(budgetsTable.id, params.id), eq(budgetsTable.user_id, userId)),
  );

  revalidateDomains("budgets");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await requireOwnership(budgetsTable, params.id, userId, "budget");

  await db.delete(sharedAccessTable).where(
    and(eq(sharedAccessTable.resource_type, "budget"), eq(sharedAccessTable.resource_id, params.id)),
  );
  await db.delete(budgetsTable).where(
    and(eq(budgetsTable.id, params.id), eq(budgetsTable.user_id, userId)),
  );

  revalidateDomains("budgets");
  return new NextResponse(null, { status: 204 });
});
