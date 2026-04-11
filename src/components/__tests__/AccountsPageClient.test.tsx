// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { AccountsPageClient } from "@/components/AccountsPageClient";

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

describe("AccountsPageClient", () => {
  it("switches between summary, accounts, and insights workspaces", async () => {
    const user = userEvent.setup();

    render(
      <AccountsPageClient
        serverLayout={[
          { widgetId: "stats", visible: true, colSpan: 2 },
          { widgetId: "account-cards", visible: true, colSpan: 2 },
          { widgetId: "charts", visible: true, colSpan: 2 },
          { widgetId: "health-check", visible: true, colSpan: 2 },
        ]}
        header={<div>Accounts Header</div>}
        pendingInvitations={null}
        stats={<div>Stats Summary Widget</div>}
        charts={<div>Charts Widget</div>}
        accountCards={<div>Account Cards Widget</div>}
        healthCheck={<div>Health Check Widget</div>}
        primaryAccountLink={{
          href: "/dashboard/accounts/acc_1",
          label: "Open Monzo Current",
        }}
      />,
    );

    expect(screen.getByText("Your money, organised")).toBeInTheDocument();
    expect(
      screen.getByText(/keep balances, account roster, and insights in clear workspaces/i),
    ).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Summary" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Stats Summary Widget")).toBeInTheDocument();
    expect(screen.queryByText("Account Cards Widget")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open Monzo Current" })).toHaveAttribute(
      "href",
      "/dashboard/accounts/acc_1",
    );

    await user.click(screen.getByRole("tab", { name: "Accounts" }));

    expect(screen.getByRole("tab", { name: "Accounts" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Account Cards Widget")).toBeInTheDocument();
    expect(screen.getByText("Stats Summary Widget")).toBeInTheDocument();

    await user.click(screen.getByRole("tab", { name: "Insights" }));

    expect(screen.getByText("Charts Widget")).toBeInTheDocument();
    expect(screen.getByText("Health Check Widget")).toBeInTheDocument();
    expect(screen.queryByText("Account Cards Widget")).not.toBeInTheDocument();
  });
});
