import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { debtsTable, debtPaymentsTable, accountsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getPaymentsForDebt } from "@/db/queries/debts";
import { requireOwnership } from "@/lib/ownership";
import { createTransaction } from "@/db/mutations/transactions";
import { checkBudgetAlerts } from "@/lib/budget-alerts";
import { revalidateDomains } from "@/lib/revalidate";

const paymentSchema = z.object({
  amount: z.number().min(0.01),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  account_id: z.string().uuid(),
  note: z.string().max(500).nullable().optional().default(null),
});

export const GET = v1Handler(async ({ userId, params }) => {
  await requireOwnership(debtsTable, params.id, userId, "debt");
  const payments = await getPaymentsForDebt(params.id);
  return dataResponse(payments);
});

export const POST = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, paymentSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(debtsTable, params.id, userId, "debt");
  await requireOwnership(accountsTable, body.account_id, userId, "account");

  await db.transaction(async (tx) => {
    await tx.insert(debtPaymentsTable).values({
      debt_id: params.id,
      account_id: body.account_id,
      amount: body.amount,
      date: body.date,
      note: body.note,
    });

    const [debt] = await tx.select({ name: debtsTable.name })
      .from(debtsTable)
      .where(eq(debtsTable.id, params.id));

    await tx.update(debtsTable).set({
      remaining_amount: sql`GREATEST(${debtsTable.remaining_amount} - ${body.amount}, 0)`,
    }).where(eq(debtsTable.id, params.id));

    await createTransaction({
      type: "expense",
      amount: body.amount,
      description: `Debt payment: ${debt?.name ?? "Unknown"}`,
      is_recurring: false,
      date: body.date,
      account_id: body.account_id,
      category_id: null,
    }, userId, tx);

    await tx.update(accountsTable)
      .set({ balance: sql`${accountsTable.balance} - ${body.amount}` })
      .where(eq(accountsTable.id, body.account_id));
  });

  await checkBudgetAlerts(userId);
  revalidateDomains("debts", "transactions", "accounts");
  return mutationResponse({ success: true }, 201);
});
