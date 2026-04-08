"use server";

import { getUserDb } from "@/db/rls-context";
import { investmentGroupsTable } from "@/db/schema";
import { eq, and, asc } from "drizzle-orm";

export type InvestmentGroup = {
  id: string;
  user_id: string;
  account_id: string | null;
  name: string;
  color: string;
  icon: string | null;
  sort_order: number;
  created_at: Date;
};

export async function getGroupsByAccount(userId: string, accountId: string): Promise<InvestmentGroup[]> {
  const userDb = await getUserDb(userId);
  return userDb
    .select()
    .from(investmentGroupsTable)
    .where(
      and(
        eq(investmentGroupsTable.user_id, userId),
        eq(investmentGroupsTable.account_id, accountId),
      )
    )
    .orderBy(asc(investmentGroupsTable.sort_order), asc(investmentGroupsTable.name));
}

export async function getGroupsByUser(userId: string): Promise<InvestmentGroup[]> {
  const userDb = await getUserDb(userId);
  return userDb
    .select()
    .from(investmentGroupsTable)
    .where(eq(investmentGroupsTable.user_id, userId))
    .orderBy(asc(investmentGroupsTable.sort_order), asc(investmentGroupsTable.name));
}

export async function getGroupById(userId: string, groupId: string): Promise<InvestmentGroup | null> {
  const userDb = await getUserDb(userId);
  const rows = await userDb
    .select()
    .from(investmentGroupsTable)
    .where(
      and(
        eq(investmentGroupsTable.id, groupId),
        eq(investmentGroupsTable.user_id, userId),
      )
    )
    .limit(1);
  return rows[0] ?? null;
}
