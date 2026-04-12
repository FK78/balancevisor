import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { accountsTable, transactionsTable } from "@/db/schema";
import { eq, sql } from "drizzle-orm";
import { v1Handler, paginatedResponse, mutationResponse, parsePagination } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import {
  getTransactionsWithDetailsPaginated,
  getTransactionsCount,
} from "@/db/queries/transactions";
import { encryptForUser, getUserKey } from "@/lib/encryption";
import { revalidateDomains } from "@/lib/revalidate";
import { hasEditAccess } from "@/db/queries/sharing";

const createTransactionSchema = z.object({
  type: z.enum(["income", "expense", "sale", "refund"]).default("expense"),
  amount: z.number().min(0.01),
  account_id: z.string().uuid(),
  description: z.string().max(500).default(""),
  category_id: z.string().uuid().nullable().optional().default(null),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  is_recurring: z.boolean().default(false),
  recurring_pattern: z.enum(["daily", "weekly", "biweekly", "monthly", "yearly"]).nullable().optional().default(null),
  refund_for_transaction_id: z.string().uuid().nullable().optional().default(null),
});

export const GET = v1Handler(async ({ userId, searchParams }) => {
  const { page, limit } = parsePagination(searchParams);
  const startDate = searchParams.get("start_date") ?? undefined;
  const endDate = searchParams.get("end_date") ?? undefined;
  const accountId = searchParams.get("account_id") ?? undefined;

  const [transactions, total] = await Promise.all([
    getTransactionsWithDetailsPaginated(userId, page, limit, startDate, endDate, accountId),
    getTransactionsCount(userId, startDate, endDate, accountId),
  ]);

  return paginatedResponse(transactions, total, page, limit);
});

export const POST = v1Handler(async ({ userId, user, req }) => {
  const body = await parseJsonBody(req, createTransactionSchema);
  if (body instanceof NextResponse) return body;

  const canEdit = await hasEditAccess(userId, user.email, "account", body.account_id);
  if (!canEdit) {
    return NextResponse.json(
      { error: "You do not have access to this account", status: 403 },
      { status: 403 },
    );
  }

  const userKey = await getUserKey(userId);

  const balanceDelta =
    body.type === "income" || body.type === "sale" || body.type === "refund"
      ? body.amount
      : -body.amount;

  const [result] = await db.transaction(async (tx) => {
    const [txn] = await tx.insert(transactionsTable).values({
      user_id: userId,
      account_id: body.account_id,
      type: body.type,
      amount: body.amount,
      description: body.description ? encryptForUser(body.description, userKey) : body.description,
      category_id: body.category_id,
      date: body.date,
      is_recurring: body.is_recurring,
      recurring_pattern: body.recurring_pattern,
      refund_for_transaction_id: body.refund_for_transaction_id,
    }).returning({ id: transactionsTable.id });

    await tx.update(accountsTable).set({
      balance: sql`${accountsTable.balance} + ${balanceDelta}`,
    }).where(eq(accountsTable.id, body.account_id));

    return [txn];
  });

  revalidateDomains("transactions", "accounts");
  return mutationResponse({ id: result.id }, 201);
});
