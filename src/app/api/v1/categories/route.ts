import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { categoriesTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getCategoriesByUser } from "@/db/queries/categories";
import { revalidateDomains } from "@/lib/revalidate";

const createCategorySchema = z.object({
  name: z.string().min(1).max(255),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  icon: z.string().max(50).nullable().optional().default(null),
});

export const GET = v1Handler(async ({ userId }) => {
  const categories = await getCategoriesByUser(userId);
  return dataResponse(categories);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createCategorySchema);
  if (body instanceof NextResponse) return body;

  const [result] = await db.insert(categoriesTable).values({
    user_id: userId,
    name: body.name,
    color: body.color,
    icon: body.icon,
  }).returning({ id: categoriesTable.id });

  revalidateDomains("categories", "onboarding");
  return mutationResponse({ id: result.id }, 201);
});
