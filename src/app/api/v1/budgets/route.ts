import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { budgetsTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getBudgets } from "@/db/queries/budgets";
import { revalidateDomains } from "@/lib/revalidate";

const createBudgetSchema = z.object({
  category_id: z.string().uuid(),
  amount: z.number().min(0.01),
  period: z.enum(["monthly", "weekly"]).default("monthly"),
  start_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
});

export const GET = v1Handler(async ({ userId }) => {
  const budgets = await getBudgets(userId);
  return dataResponse(budgets);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createBudgetSchema);
  if (body instanceof NextResponse) return body;

  const [result] = await db.insert(budgetsTable).values({
    user_id: userId,
    category_id: body.category_id,
    amount: body.amount,
    period: body.period,
    start_date: body.start_date,
  }).returning({ id: budgetsTable.id });

  revalidateDomains("budgets", "onboarding");
  return mutationResponse({ id: result.id }, 201);
});
