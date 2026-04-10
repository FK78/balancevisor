// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SellHoldingDialog } from "@/components/SellHoldingDialog";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/db/mutations/investments", () => ({
  recordHoldingSale: vi.fn(),
}));

describe("SellHoldingDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <SellHoldingDialog
        holding={{
          id: "hold-1",
          ticker: "AAPL",
          name: "Apple",
          quantity: 5,
          average_price: 100,
          current_price: 150,
          currency: "USD",
        }}
      />,
    );

    await user.click(screen.getByRole("button", { name: /sell/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /record sale/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
