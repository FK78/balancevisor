import { describe, expect, it } from "vitest";
import { groupDashboardLayoutByTab } from "@/components/dashboard/dashboard-workspace";

describe("groupDashboardLayoutByTab", () => {
  it("keeps saved layout order within each dashboard workspace tab", () => {
    const grouped = groupDashboardLayoutByTab([
      { widgetId: "recent-transactions", visible: true, colSpan: 2 },
      { widgetId: "insights", visible: true, colSpan: 2 },
      { widgetId: "budget-progress", visible: true, colSpan: 1 },
      { widgetId: "anomalies", visible: true, colSpan: 2 },
      { widgetId: "weekly-digest", visible: true, colSpan: 2 },
    ]);

    expect(grouped.overview.map((item) => item.widgetId)).toEqual(["insights"]);
    expect(grouped.activity.map((item) => item.widgetId)).toEqual([
      "recent-transactions",
      "weekly-digest",
    ]);
    expect(grouped.planning.map((item) => item.widgetId)).toEqual(["budget-progress"]);
    expect(grouped.health.map((item) => item.widgetId)).toEqual(["anomalies"]);
  });
});
