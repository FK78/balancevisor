import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { transactionsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { requireOwnership } from "@/lib/ownership";
import { encryptForUser, getUserKey } from "@/lib/encryption";
import { revalidateDomains } from "@/lib/revalidate";

const updateTransactionSchema = z.object({
  type: z.enum(["income", "expense", "sale", "refund"]).optional(),
  amount: z.number().min(0.01).optional(),
  description: z.string().max(500).optional(),
  category_id: z.string().uuid().nullable().optional(),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  is_recurring: z.boolean().optional(),
  recurring_pattern: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).nullable().optional(),
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateTransactionSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(transactionsTable, params.id, userId, "transaction");

  const userKey = await getUserKey(userId);

  const updates: Record<string, unknown> = {};
  if (body.type !== undefined) updates.type = body.type;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.description !== undefined) {
    updates.description = body.description ? encryptForUser(body.description, userKey) : body.description;
  }
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.date !== undefined) updates.date = body.date;
  if (body.is_recurring !== undefined) updates.is_recurring = body.is_recurring;
  if (body.recurring_pattern !== undefined) updates.recurring_pattern = body.recurring_pattern;

  await db.update(transactionsTable).set(updates).where(
    and(eq(transactionsTable.id, params.id), eq(transactionsTable.user_id, userId)),
  );

  revalidateDomains("transactions");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await requireOwnership(transactionsTable, params.id, userId, "transaction");

  await db.delete(transactionsTable).where(
    and(eq(transactionsTable.id, params.id), eq(transactionsTable.user_id, userId)),
  );

  revalidateDomains("transactions");
  return new NextResponse(null, { status: 204 });
});
