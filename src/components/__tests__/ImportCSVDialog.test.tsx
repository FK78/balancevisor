// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ImportCSVDialog } from "@/components/ImportCSVDialog";

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

vi.mock("@/components/AiSettingsProvider", () => ({
  useAiEnabled: () => false,
}));

vi.mock("@/db/mutations/import-csv", () => ({
  importTransactionsFromCSV: vi.fn(),
}));

describe("ImportCSVDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(
      <ImportCSVDialog
        accounts={[{ id: "acc-1", name: "Checking" } as never]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /import csv/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
