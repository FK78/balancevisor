import { describe, expect, it } from "vitest";
import { reconcileLayout } from "@/lib/widget-registry";

describe("reconcileLayout", () => {
  it("removes the legacy dashboard net-worth widget while preserving the remaining saved order", () => {
    const reconciled = reconcileLayout(
      [
        { widgetId: "recent-transactions", visible: true, colSpan: 2 },
        { widgetId: "net-worth", visible: true, colSpan: 2 },
        { widgetId: "insights", visible: false, colSpan: 2 },
      ],
      "dashboard",
    );

    expect(reconciled.map((item) => item.widgetId)).not.toContain("net-worth");
    expect(reconciled[0]).toMatchObject({ widgetId: "recent-transactions", visible: true });
    expect(reconciled[1]).toMatchObject({ widgetId: "insights", visible: false });
  });
});
