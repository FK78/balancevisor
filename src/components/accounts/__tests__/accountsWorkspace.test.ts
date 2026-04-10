import { describe, expect, it } from "vitest";
import { groupAccountsLayoutByTab } from "@/components/accounts/accounts-workspace";

describe("groupAccountsLayoutByTab", () => {
  it("preserves saved widget order within each accounts workspace tab", () => {
    const grouped = groupAccountsLayoutByTab([
      { widgetId: "account-cards", visible: true, colSpan: 2 },
      { widgetId: "stats", visible: true, colSpan: 2 },
      { widgetId: "health-check", visible: true, colSpan: 2 },
      { widgetId: "charts", visible: true, colSpan: 2 },
    ]);

    expect(grouped.summary.map((item) => item.widgetId)).toEqual(["stats"]);
    expect(grouped.accounts.map((item) => item.widgetId)).toEqual(["account-cards"]);
    expect(grouped.insights.map((item) => item.widgetId)).toEqual(["health-check", "charts"]);
  });
});
