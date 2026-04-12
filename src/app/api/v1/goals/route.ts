import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { goalsTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getGoals } from "@/db/queries/goals";
import { revalidateDomains } from "@/lib/revalidate";

const createGoalSchema = z.object({
  name: z.string().min(1).max(255),
  target_amount: z.number().min(0.01),
  saved_amount: z.number().min(0).default(0),
  target_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable().optional().default(null),
  icon: z.string().max(50).nullable().optional().default(null),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
});

export const GET = v1Handler(async ({ userId }) => {
  const goals = await getGoals(userId);
  return dataResponse(goals);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createGoalSchema);
  if (body instanceof NextResponse) return body;

  const [result] = await db.insert(goalsTable).values({
    user_id: userId,
    name: body.name,
    target_amount: body.target_amount,
    saved_amount: body.saved_amount,
    target_date: body.target_date,
    icon: body.icon,
    color: body.color,
  }).returning({ id: goalsTable.id });

  revalidateDomains("goals");
  return mutationResponse({ id: result.id }, 201);
});
