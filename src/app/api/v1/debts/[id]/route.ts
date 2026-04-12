import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { debtsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { requireOwnership } from "@/lib/ownership";
import { revalidateDomains } from "@/lib/revalidate";

const updateDebtSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  original_amount: z.number().min(0.01).optional(),
  remaining_amount: z.number().min(0).optional(),
  interest_rate: z.number().min(0).max(100).optional(),
  minimum_payment: z.number().min(0).optional(),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional(),
  lender: z.string().max(255).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateDebtSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(debtsTable, params.id, userId, "debt");

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.original_amount !== undefined) updates.original_amount = body.original_amount;
  if (body.remaining_amount !== undefined) updates.remaining_amount = body.remaining_amount;
  if (body.interest_rate !== undefined) updates.interest_rate = body.interest_rate;
  if (body.minimum_payment !== undefined) updates.minimum_payment = body.minimum_payment;
  if (body.due_date !== undefined) updates.due_date = body.due_date;
  if (body.lender !== undefined) updates.lender = body.lender;
  if (body.color !== undefined) updates.color = body.color;

  await db.update(debtsTable).set(updates).where(
    and(eq(debtsTable.id, params.id), eq(debtsTable.user_id, userId)),
  );

  revalidateDomains("debts");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await requireOwnership(debtsTable, params.id, userId, "debt");

  await db.delete(debtsTable).where(
    and(eq(debtsTable.id, params.id), eq(debtsTable.user_id, userId)),
  );

  revalidateDomains("debts");
  return new NextResponse(null, { status: 204 });
});
