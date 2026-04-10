// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DashboardPageClient } from "@/components/dashboard/DashboardPageClient";

vi.mock("next/dynamic", () => ({
  default: (_loader: unknown, options?: { loading?: () => ReactNode }) => {
    const MockDynamic = () => (options?.loading ? options.loading() : null);
    return MockDynamic;
  },
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

vi.mock("@/components/QuickAddTransaction", () => ({
  QuickAddTransaction: () => <button type="button">Quick Add</button>,
}));

vi.mock("@/components/EditLayoutToggle", () => ({
  EditLayoutToggle: () => <button type="button">Edit Layout</button>,
}));

vi.mock("@/components/CustomiseDrawer", () => ({
  CustomiseDrawer: () => <button type="button">Customise</button>,
}));

vi.mock("@/components/dashboard/DashboardInsights", () => ({
  DashboardInsights: () => <div>Insights Widget</div>,
}));

vi.mock("@/components/dashboard/DashboardRecentTransactions", () => ({
  DashboardRecentTransactions: () => <div>Recent Transactions Widget</div>,
}));

describe("DashboardPageClient", () => {
  beforeEach(() => {
    window.localStorage?.clear?.();
  });

  it("switches dashboard workspace tabs and shows only the active tab widgets", async () => {
    const user = userEvent.setup();

    render(
      <DashboardPageClient
        serverLayout={[
          { widgetId: "insights", visible: true, colSpan: 2 },
          { widgetId: "recent-transactions", visible: true, colSpan: 2 },
        ]}
        displayName="Fahad"
        monthName="April"
        transactionsEnabled
        accountsEnabled={false}
        investmentsEnabled={false}
        reportsEnabled={false}
        budgetsEnabled={false}
        categoriesEnabled={false}
        subscriptionsEnabled={false}
        retirementEnabled={false}
        zakatEnabled={false}
        zakatData={null}
        insights={[{ title: "Insight" } as never]}
        netWorth={84260}
        totalAssets={101000}
        totalLiabilities={16740}
        investmentValue={0}
        baseCurrency="GBP"
        netWorthHistory={[]}
        monthlyTrend={[]}
        forecast={null}
        anomalies={[]}
        upcomingRenewals={[]}
        budgets={[]}
        budgetsAtRisk={[]}
        spendByCategory={[]}
        expenses={0}
        lastFiveTransactions={[{ id: "txn_1" } as never]}
        retirementProjection={null}
        hasRetirementProfile={false}
        milestones={[]}
        healthScore={{ overall: 72, grade: "B", subScores: [] }}
      />,
    );

    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Insights Widget")).toBeInTheDocument();
    expect(screen.queryByText("Recent Transactions Widget")).not.toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Activity" }));

    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Recent Transactions Widget")).toBeInTheDocument();
    expect(screen.queryByText("Insights Widget")).not.toBeInTheDocument();
  });
});
