import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { categoriesTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { revalidateDomains } from "@/lib/revalidate";

const updateCategorySchema = z.object({
  name: z.string().min(1).max(255).optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(50).nullable().optional(),
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateCategorySchema);
  if (body instanceof NextResponse) return body;

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.color !== undefined) updates.color = body.color;
  if (body.icon !== undefined) updates.icon = body.icon;

  await db.update(categoriesTable).set(updates).where(
    and(eq(categoriesTable.id, params.id), eq(categoriesTable.user_id, userId)),
  );

  revalidateDomains("categories");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await db.delete(categoriesTable).where(
    and(eq(categoriesTable.id, params.id), eq(categoriesTable.user_id, userId)),
  );

  revalidateDomains("categories");
  return new NextResponse(null, { status: 204 });
});
