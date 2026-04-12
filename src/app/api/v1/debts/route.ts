import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { debtsTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getDebts } from "@/db/queries/debts";
import { revalidateDomains } from "@/lib/revalidate";

const createDebtSchema = z.object({
  name: z.string().min(1).max(255),
  original_amount: z.number().min(0.01),
  remaining_amount: z.number().min(0),
  interest_rate: z.number().min(0).max(100),
  minimum_payment: z.number().min(0),
  due_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().default(null),
  lender: z.string().max(255).nullable().optional().default(null),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export const GET = v1Handler(async ({ userId }) => {
  const debts = await getDebts(userId);
  return dataResponse(debts);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createDebtSchema);
  if (body instanceof NextResponse) return body;

  const [result] = await db.insert(debtsTable).values({
    user_id: userId,
    name: body.name,
    original_amount: body.original_amount,
    remaining_amount: body.remaining_amount,
    interest_rate: body.interest_rate,
    minimum_payment: body.minimum_payment,
    due_date: body.due_date,
    lender: body.lender,
    color: body.color,
  }).returning({ id: debtsTable.id });

  revalidateDomains("debts");
  return mutationResponse({ id: result.id }, 201);
});
