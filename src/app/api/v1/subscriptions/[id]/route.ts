import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { subscriptionsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { revalidateDomains } from "@/lib/revalidate";

const updateSubscriptionSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  amount: z.number().min(0.01).optional(),
  category_id: z.string().uuid().nullable().optional(),
  next_billing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  currency: z.enum(["GBP", "USD", "EUR"]).optional(),
  billing_cycle: z.enum(["weekly", "monthly", "quarterly", "yearly"]).optional(),
  url: z.string().url().nullable().optional(),
  notes: z.string().max(500).nullable().optional(),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).optional(),
  icon: z.string().max(50).nullable().optional(),
  is_active: z.boolean().optional(),
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateSubscriptionSchema);
  if (body instanceof NextResponse) return body;

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = body.name;
  if (body.amount !== undefined) updates.amount = body.amount;
  if (body.category_id !== undefined) updates.category_id = body.category_id;
  if (body.next_billing_date !== undefined) updates.next_billing_date = body.next_billing_date;
  if (body.currency !== undefined) updates.currency = body.currency;
  if (body.billing_cycle !== undefined) updates.billing_cycle = body.billing_cycle;
  if (body.url !== undefined) updates.url = body.url;
  if (body.notes !== undefined) updates.notes = body.notes;
  if (body.color !== undefined) updates.color = body.color;
  if (body.icon !== undefined) updates.icon = body.icon;
  if (body.is_active !== undefined) updates.is_active = body.is_active;

  await db.update(subscriptionsTable).set(updates).where(
    and(eq(subscriptionsTable.id, params.id), eq(subscriptionsTable.user_id, userId)),
  );

  revalidateDomains("subscriptions");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await db.delete(subscriptionsTable).where(
    and(eq(subscriptionsTable.id, params.id), eq(subscriptionsTable.user_id, userId)),
  );

  revalidateDomains("subscriptions");
  return new NextResponse(null, { status: 204 });
});
