import { db } from "@/index";
import { dashboardLayoutsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";

/**
 * Upsert the widget layout for a given page.
 */
export async function savePageLayout(
  userId: string,
  pageId: DashboardPageId,
  layout: readonly WidgetLayoutItem[],
): Promise<void> {
  const layoutJson = JSON.stringify(layout);
  const now = new Date();

  await db
    .insert(dashboardLayoutsTable)
    .values({
      user_id: userId,
      page: pageId,
      layout_json: layoutJson,
      updated_at: now,
    })
    .onConflictDoUpdate({
      target: [dashboardLayoutsTable.user_id, dashboardLayoutsTable.page],
      set: { layout_json: layoutJson, updated_at: now },
    });
}

/**
 * Delete a custom layout, reverting to defaults.
 */
export async function deletePageLayout(
  userId: string,
  pageId: DashboardPageId,
): Promise<void> {
  await db
    .delete(dashboardLayoutsTable)
    .where(
      and(
        eq(dashboardLayoutsTable.user_id, userId),
        eq(dashboardLayoutsTable.page, pageId),
      ),
    );
}
