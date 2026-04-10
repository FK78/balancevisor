// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { RecurringClient } from "@/components/RecurringClient";

vi.mock("@/db/mutations/recurring", () => ({
  cancelRecurring: vi.fn(),
  confirmRecurringCandidate: vi.fn(),
  updateRecurringPattern: vi.fn(),
}));

describe("RecurringClient", () => {
  const recurring = [
    {
      id: "rec-1",
      description: "Spotify",
      accountName: "Checking",
      category: "Entertainment",
      categoryColor: "#8b5cf6",
      recurring_pattern: "monthly",
      next_recurring_date: "2026-04-20",
      type: "expense",
      amount: 15.99,
    },
  ] as never;

  it("uses the mobile full-height shells for editing and stopping recurring items", async () => {
    const user = userEvent.setup();

    render(<RecurringClient recurring={recurring} currency="USD" />);

    await user.click(screen.getAllByRole("button", { name: /edit recurring schedule/i })[0]);

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");

    await user.click(screen.getByRole("button", { name: /cancel/i }));
    await user.click(screen.getAllByRole("button", { name: /stop recurring transaction/i })[0]);

    expect(screen.getByRole("alertdialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /keep it/i }).closest("[data-slot='alert-dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
