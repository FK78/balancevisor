// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { BudgetAlertSettings } from "@/components/BudgetAlertSettings";

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

vi.mock("@/db/mutations/budget-alerts", () => ({
  upsertAlertPreferences: vi.fn(),
}));

describe("BudgetAlertSettings", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <BudgetAlertSettings
        budgetId="budget-1"
        budgetCategory="Groceries"
        prefs={null}
      />,
    );

    await user.click(screen.getByRole("button"));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
