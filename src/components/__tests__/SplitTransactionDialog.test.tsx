// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SplitTransactionDialog } from "@/components/SplitTransactionDialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/db/mutations/transactions", () => ({
  addSplitTransaction: vi.fn(),
}));

describe("SplitTransactionDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <SplitTransactionDialog
        accounts={[{ id: "acc-1", name: "Checking" } as never]}
        categories={[
          { id: "cat-1", name: "Food" } as never,
          { id: "cat-2", name: "Transport" } as never,
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /split transaction/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
