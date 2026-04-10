// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QuickAddTransaction } from "@/components/QuickAddTransaction";

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@tanstack/react-query", () => ({
  useMutation: () => ({
    mutate: vi.fn(),
    reset: vi.fn(),
    isPending: false,
  }),
}));

vi.mock("@/components/AiSettingsProvider", () => ({
  useAiEnabled: () => true,
}));

vi.mock("@/db/mutations/transactions", () => ({
  addTransaction: vi.fn(),
}));

describe("QuickAddTransaction", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(<QuickAddTransaction />);

    await user.click(screen.getByRole("button", { name: /quick add/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /parse/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
