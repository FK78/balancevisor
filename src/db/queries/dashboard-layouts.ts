import { db } from "@/index";
import { dashboardLayoutsTable } from "@/db/schema";
import { and, eq } from "drizzle-orm";
import type { DashboardPageId, WidgetLayoutItem } from "@/lib/widget-registry";
import { getDefaultLayout, reconcileLayout } from "@/lib/widget-registry";

/**
 * Get the reconciled widget layout for a given page.
 * Returns the default layout if no custom layout exists.
 */
export async function getPageLayout(
  userId: string,
  pageId: DashboardPageId,
): Promise<readonly WidgetLayoutItem[]> {
  const [row] = await db
    .select({ layout_json: dashboardLayoutsTable.layout_json })
    .from(dashboardLayoutsTable)
    .where(
      and(
        eq(dashboardLayoutsTable.user_id, userId),
        eq(dashboardLayoutsTable.page, pageId),
      ),
    )
    .limit(1);

  if (!row) return getDefaultLayout(pageId);

  try {
    const saved = JSON.parse(row.layout_json) as WidgetLayoutItem[];
    return reconcileLayout(saved, pageId);
  } catch {
    return getDefaultLayout(pageId);
  }
}
