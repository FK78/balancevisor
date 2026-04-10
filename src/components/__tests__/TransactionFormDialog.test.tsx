// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { TransactionFormDialog } from "@/components/AddTransactionForm";

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

vi.mock("@/hooks/useLastUsed", () => ({
  useLastUsed: () => ({
    get: () => null,
    set: vi.fn(),
  }),
}));

vi.mock("@/db/mutations/transactions", () => ({
  addTransaction: vi.fn(),
  editTransaction: vi.fn(),
}));

vi.mock("@/db/mutations/categorisation-rules", () => ({
  learnCategorisationRule: vi.fn(),
}));

vi.mock("@/db/mutations/merchant-mappings", () => ({
  learnMerchantMapping: vi.fn(),
}));

vi.mock("@/db/mutations/check-duplicate", () => ({
  checkForDuplicate: vi.fn().mockResolvedValue([]),
}));

describe("TransactionFormDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <TransactionFormDialog
        accounts={[{ id: "acc-1", accountName: "Checking" } as never]}
        categories={[{ id: "cat-1", name: "Food" } as never]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /add transaction/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
