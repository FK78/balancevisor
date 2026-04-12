import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { accountsTable, transactionsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody, notFound } from "@/lib/api-errors";
import { getAccountById } from "@/db/queries/accounts";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { encryptForUser, getUserKey } from "@/lib/encryption";
import { requireOwnership } from "@/lib/ownership";
import { revalidateDomains } from "@/lib/revalidate";

const updateAccountSchema = z.object({
  name: z.string().min(1).max(255).optional(),
  type: z.enum(["currentAccount", "savings", "creditCard", "investment"]).optional(),
  balance: z.number().optional(),
});

export const GET = v1Handler(async ({ userId, user, params }) => {
  const account = await getAccountById(userId, user.email, params.id);
  if (!account) return notFound("Account");
  return dataResponse(account);
});

export const PATCH = v1Handler(async ({ userId, req, params }) => {
  const body = await parseJsonBody(req, updateAccountSchema);
  if (body instanceof NextResponse) return body;

  await requireOwnership(accountsTable, params.id, userId, "account");

  const userKey = await getUserKey(userId);
  const baseCurrency = await getUserBaseCurrency(userId);

  const updates: Record<string, unknown> = {};
  if (body.name !== undefined) updates.name = encryptForUser(body.name, userKey);
  if (body.type !== undefined) updates.type = body.type;
  if (body.balance !== undefined) updates.balance = body.balance;
  updates.currency = baseCurrency;

  await db.update(accountsTable).set(updates).where(
    and(eq(accountsTable.id, params.id), eq(accountsTable.user_id, userId)),
  );

  revalidateDomains("accounts");
  return mutationResponse({ id: params.id });
});

export const DELETE = v1Handler(async ({ userId, params }) => {
  await requireOwnership(accountsTable, params.id, userId, "account");

  await db.transaction(async (tx) => {
    await tx.delete(transactionsTable).where(eq(transactionsTable.account_id, params.id));
    await tx.delete(accountsTable).where(
      and(eq(accountsTable.id, params.id), eq(accountsTable.user_id, userId)),
    );
  });

  revalidateDomains("accounts");
  return new NextResponse(null, { status: 204 });
});
