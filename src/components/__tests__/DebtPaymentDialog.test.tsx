// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DebtPaymentDialog } from "@/components/DebtPaymentDialog";

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

vi.mock("@/db/mutations/debts", () => ({
  recordDebtPayment: vi.fn(),
}));

describe("DebtPaymentDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <DebtPaymentDialog
        debtId="debt-1"
        debtName="Visa"
        remainingAmount={200}
        accounts={[{ id: "acc-1", name: "Checking" } as never]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /make payment/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
