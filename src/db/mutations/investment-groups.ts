"use server";

import { getUserDb } from "@/db/rls-context";
import { investmentGroupsTable, manualHoldingsTable } from "@/db/schema";
import { eq, and } from "drizzle-orm";
import { revalidateDomains } from "@/lib/revalidate";
import { getCurrentUserId } from "@/lib/auth";
import { requireString, sanitizeColor, sanitizeUUID } from "@/lib/sanitize";

function revalidate() {
  revalidateDomains('investments', 'accounts');
}

export async function addInvestmentGroup(formData: FormData) {
  const userId = await getCurrentUserId();
  const name = requireString(formData.get("name") as string, "Group name");
  const accountId = sanitizeUUID(formData.get("account_id") as string);
  const color = sanitizeColor(formData.get("color") as string);

  const userDb = await getUserDb(userId);
  const [result] = await userDb
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
  const groupId = requireString(formData.get("id") as string, "Group ID");
  const name = requireString(formData.get("name") as string, "Group name");
  const color = sanitizeColor(formData.get("color") as string);
  const accountId = sanitizeUUID(formData.get("account_id") as string);

  const userDb = await getUserDb(userId);
  await userDb
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
  const userDb = await getUserDb(userId);
  await userDb
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

  const userDb = await getUserDb(userId);
  await userDb
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
