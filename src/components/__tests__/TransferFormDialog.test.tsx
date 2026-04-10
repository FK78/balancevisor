// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransferFormDialog } from "@/components/AddTransferForm";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

vi.mock("@/db/mutations/transactions", () => ({
  addTransfer: vi.fn(),
}));

describe("TransferFormDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <TransferFormDialog
        accounts={[
          { id: "acc-1", name: "Checking" } as never,
          { id: "acc-2", name: "Savings" } as never,
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /transfer/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
