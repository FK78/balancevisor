import { NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/index";
import { accountsTable } from "@/db/schema";
import { v1Handler, dataResponse, mutationResponse } from "@/lib/api-v1";
import { parseJsonBody } from "@/lib/api-errors";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { encryptForUser, getUserKey } from "@/lib/encryption";
import { revalidateDomains } from "@/lib/revalidate";

const createAccountSchema = z.object({
  name: z.string().min(1).max(255),
  type: z.enum(["currentAccount", "savings", "creditCard", "investment"]).default("currentAccount"),
  balance: z.number(),
});

export const GET = v1Handler(async ({ userId }) => {
  const accounts = await getAccountsWithDetails(userId);
  return dataResponse(accounts);
});

export const POST = v1Handler(async ({ userId, req }) => {
  const body = await parseJsonBody(req, createAccountSchema);
  if (body instanceof NextResponse) return body;

  const baseCurrency = await getUserBaseCurrency(userId);
  const userKey = await getUserKey(userId);

  const [result] = await db.insert(accountsTable).values({
    user_id: userId,
    name: encryptForUser(body.name, userKey),
    type: body.type,
    balance: body.balance,
    currency: baseCurrency,
  }).returning({ id: accountsTable.id });

  revalidateDomains("accounts", "onboarding");
  return mutationResponse({ id: result.id }, 201);
});
