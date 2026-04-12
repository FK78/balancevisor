import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { subscriptionsTable, accountsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getSubscriptions } from "@/db/queries/subscriptions";
import { createTransaction } from "@/db/mutations/transactions";
import { checkBudgetAlerts } from "@/lib/budget-alerts";
import { revalidateDomains } from "@/lib/revalidate";

const createSubscriptionSchema = z.object({
  name: z.string().min(1).max(255),
  amount: z.number().min(0.01),
  account_id: z.string().uuid(),
  category_id: z.string().uuid().nullable().optional().default(null),
  next_billing_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  currency: z.enum(["GBP", "USD", "EUR"]).default("GBP"),
  billing_cycle: z.enum(["weekly", "monthly", "quarterly", "yearly"]).default("monthly"),
  url: z.string().url().nullable().optional().default(null),
  notes: z.string().max(500).nullable().optional().default(null),
  color: z.string().regex(/^#[0-9a-fA-F]{6}$/).default("#6366f1"),
  icon: z.string().max(50).nullable().optional().default(null),
});

export const GET = v1Handler(async ({ userId }) => {
  const subscriptions = await getSubscriptions(userId);
  return dataResponse(subscriptions);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createSubscriptionSchema);
  if (body instanceof NextResponse) return body;

  const result = await db.transaction(async (tx) => {
    const [inserted] = await tx.insert(subscriptionsTable).values({
      user_id: userId,
      name: body.name,
      amount: body.amount,
      currency: body.currency,
      billing_cycle: body.billing_cycle,
      next_billing_date: body.next_billing_date,
      category_id: body.category_id,
      account_id: body.account_id,
      url: body.url,
      notes: body.notes,
      color: body.color,
      icon: body.icon,
    }).returning({ id: subscriptionsTable.id });

    await createTransaction({
      type: "expense",
      amount: body.amount,
      description: `Subscription: ${body.name}`,
      is_recurring: false,
      date: body.next_billing_date,
      account_id: body.account_id,
      category_id: body.category_id,
    }, userId, tx);

    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} - ${body.amount}` })
      .where(eq(accountsTable.id, body.account_id));

    return inserted;
  });

  await checkBudgetAlerts(userId);
  revalidateDomains("subscriptions", "transactions", "accounts");
  return mutationResponse({ id: result.id }, 201);
});
