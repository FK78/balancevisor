"use server";

import { db } from "@/index";
import { investmentGroupsTable, manualHoldingsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidateDomains } from "@/lib/revalidate";
import { getCurrentUserId } from "@/lib/auth";
import { z } from 'zod';
import { parseFormData, zRequiredString, zColor, zUUID } from '@/lib/form-schema';

const groupSchema = z.object({
  name: zRequiredString(),
  account_id: zUUID(),
  color: zColor(),
});

function revalidate() {
  revalidateDomains('investments', 'accounts');
}

export async function addInvestmentGroup(formData: FormData) {
  const userId = await getCurrentUserId();
  const { name, account_id: accountId, color } = parseFormData(groupSchema, formData);

  const [result] = await db
    .insert(investmentGroupsTable)
    .values({
      user_id: userId,
      account_id: accountId,
      name,
      color,
    })
    .returning({ id: investmentGroupsTable.id });

  revalidate();
  return result;
}

export async function editInvestmentGroup(formData: FormData) {
  const userId = await getCurrentUserId();
  const editSchema = groupSchema.extend({ id: zRequiredString() });
  const { id: groupId, name, color, account_id: accountId } = parseFormData(editSchema, formData);

  await db
    .update(investmentGroupsTable)
    .set({ name, color, account_id: accountId })
    .where(
      and(
        eq(investmentGroupsTable.id, groupId),
        eq(investmentGroupsTable.user_id, userId),
      )
    );

  revalidate();
}

export async function deleteInvestmentGroup(groupId: string) {
  const userId = await getCurrentUserId();

  // Holdings in this group will have group_id set to null (ON DELETE SET NULL)
  await db
    .delete(investmentGroupsTable)
    .where(
      and(
        eq(investmentGroupsTable.id, groupId),
        eq(investmentGroupsTable.user_id, userId),
      )
    );

  revalidate();
}

export async function assignHoldingToGroup(holdingId: string, groupId: string | null) {
  const userId = await getCurrentUserId();

  await db
    .update(manualHoldingsTable)
    .set({ group_id: groupId })
    .where(
      and(
        eq(manualHoldingsTable.id, holdingId),
        eq(manualHoldingsTable.user_id, userId),
      )
    );

  revalidate();
}
