"use server";

import { db } from "@/index";
import { investmentGroupsTable, manualHoldingsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { getCurrentUserId } from "@/lib/auth";

function revalidate() {
  revalidatePath("/dashboard/investments");
  revalidatePath("/dashboard/accounts");
  revalidatePath("/dashboard");
}

export async function addInvestmentGroup(formData: FormData) {
  const userId = await getCurrentUserId();
  const name = formData.get("name") as string;
  const accountId = (formData.get("account_id") as string) || null;
  const color = (formData.get("color") as string) || "#6366f1";

  if (!name) throw new Error("Group name is required");

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
  const groupId = formData.get("id") as string;
  const name = formData.get("name") as string;
  const color = (formData.get("color") as string) || "#6366f1";
  const accountId = (formData.get("account_id") as string) || null;

  if (!groupId || !name) throw new Error("Group ID and name are required");

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
