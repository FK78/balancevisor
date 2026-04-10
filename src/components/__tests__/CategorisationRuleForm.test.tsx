// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CategorisationRuleFormDialog } from "@/components/CategorisationRuleForm";

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

vi.mock("@/db/mutations/categorisation-rules", () => ({
  addCategorisationRule: vi.fn(),
  editCategorisationRule: vi.fn(),
}));

describe("CategorisationRuleFormDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <CategorisationRuleFormDialog
        categories={[
          { id: "cat-1", name: "Food", color: "#16a34a" } as never,
        ]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /add rule/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
