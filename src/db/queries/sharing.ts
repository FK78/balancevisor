"use server";

import { db } from "@/index";
import { sharedAccessTable, accountsTable, budgetsTable, categoriesTable } from "@/db/schema";
import { eq, and, or, inArray } from "drizzle-orm";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import type { SharedAccess } from "@/lib/types";

/**
 * Get all shares where the current user is the owner (things they've shared out).
 */
export async function getSharesByOwner(userId: string): Promise<SharedAccess[]> {
  return db
    .select()
    .from(sharedAccessTable)
    .where(eq(sharedAccessTable.owner_id, userId));
}

/**
 * Get all shares for a specific resource (account or budget).
 * Only the resource owner may list shares.
 */
export async function getSharesForResource(
  userId: string,
  resourceType: "account" | "budget",
  resourceId: string,
): Promise<SharedAccess[]> {
  return db
    .select()
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.owner_id, userId),
        eq(sharedAccessTable.resource_type, resourceType),
        eq(sharedAccessTable.resource_id, resourceId),
      ),
    );
}

/**
 * Get pending invitations for a user (by email or user ID).
 */
export async function getPendingInvitations(
  userId: string,
  email: string,
): Promise<(SharedAccess & { resourceName: string })[]> {
  const rows = await db
    .select()
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.status, "pending"),
        or(
          eq(sharedAccessTable.shared_with_id, userId),
          eq(sharedAccessTable.shared_with_email, email),
        ),
      ),
    );

  // Batch-fetch resource names to avoid N+1 queries
  const accountIds = rows.filter((r) => r.resource_type === "account").map((r) => r.resource_id);
  const budgetIds = rows.filter((r) => r.resource_type === "budget").map((r) => r.resource_id);

  const accountNameMap = new Map<string, string>();
  if (accountIds.length > 0) {
    const accounts = await db
      .select({ id: accountsTable.id, name: accountsTable.name, user_id: accountsTable.user_id })
      .from(accountsTable)
      .where(inArray(accountsTable.id, accountIds));

    // Group by owner to minimize getUserKey calls
    const byOwner = new Map<string, typeof accounts>();
    for (const a of accounts) {
      if (!byOwner.has(a.user_id)) byOwner.set(a.user_id, []);
      byOwner.get(a.user_id)!.push(a);
    }
    for (const [ownerId, ownerAccounts] of byOwner) {
      const ownerKey = await getUserKey(ownerId);
      for (const a of ownerAccounts) {
        accountNameMap.set(a.id, decryptForUser(a.name, ownerKey));
      }
    }
  }

  const budgetNameMap = new Map<string, string>();
  if (budgetIds.length > 0) {
    const budgetRows = await db
      .select({ id: budgetsTable.id, name: categoriesTable.name })
      .from(budgetsTable)
      .innerJoin(categoriesTable, eq(categoriesTable.id, budgetsTable.category_id))
      .where(inArray(budgetsTable.id, budgetIds));
    for (const b of budgetRows) {
      budgetNameMap.set(b.id, b.name);
    }
  }

  return rows.map((row) => {
    let resourceName = "Unknown";
    if (row.resource_type === "account") {
      resourceName = accountNameMap.get(row.resource_id) ?? "Unknown";
    } else if (row.resource_type === "budget") {
      resourceName = budgetNameMap.get(row.resource_id) ?? "Unknown";
    }
    return { ...row, resourceName };
  });
}

/**
 * Get accepted shared account IDs for a user (accounts shared with them).
 */
export async function getSharedAccountIds(
  userId: string,
  email: string,
): Promise<string[]> {
  const rows = await db
    .select({ resource_id: sharedAccessTable.resource_id })
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.resource_type, "account"),
        eq(sharedAccessTable.status, "accepted"),
        or(
          eq(sharedAccessTable.shared_with_id, userId),
          eq(sharedAccessTable.shared_with_email, email),
        ),
      ),
    );
  return rows.map((r) => r.resource_id);
}

/**
 * Get accepted shared budget IDs for a user (budgets shared with them).
 */
export async function getSharedBudgetIds(
  userId: string,
  email: string,
): Promise<string[]> {
  const rows = await db
    .select({ resource_id: sharedAccessTable.resource_id })
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.resource_type, "budget"),
        eq(sharedAccessTable.status, "accepted"),
        or(
          eq(sharedAccessTable.shared_with_id, userId),
          eq(sharedAccessTable.shared_with_email, email),
        ),
      ),
    );
  return rows.map((r) => r.resource_id);
}

/**
 * Check if a user has edit access to a specific resource (as owner or shared-with).
 */
export async function hasEditAccess(
  userId: string,
  email: string,
  resourceType: "account" | "budget",
  resourceId: string,
): Promise<boolean> {
  // Check ownership first
  if (resourceType === "account") {
    const [owned] = await db
      .select({ id: accountsTable.id })
      .from(accountsTable)
      .where(and(eq(accountsTable.id, resourceId), eq(accountsTable.user_id, userId)));
    if (owned) return true;
  } else {
    const [owned] = await db
      .select({ id: budgetsTable.id })
      .from(budgetsTable)
      .where(and(eq(budgetsTable.id, resourceId), eq(budgetsTable.user_id, userId)));
    if (owned) return true;
  }

  // Check shared access
  const [shared] = await db
    .select({ id: sharedAccessTable.id })
    .from(sharedAccessTable)
    .where(
      and(
        eq(sharedAccessTable.resource_type, resourceType),
        eq(sharedAccessTable.resource_id, resourceId),
        eq(sharedAccessTable.permission, "edit"),
        eq(sharedAccessTable.status, "accepted"),
        or(
          eq(sharedAccessTable.shared_with_id, userId),
          eq(sharedAccessTable.shared_with_email, email),
        ),
      ),
    );

  return !!shared;
}
