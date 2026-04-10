// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ZakatSettingsDialog } from "@/components/ZakatSettingsDialog";

vi.mock("@/db/mutations/zakat", () => ({
  saveZakatSettings: vi.fn(),
}));

vi.mock("@/lib/formatCurrency", () => ({
  formatCurrency: (value: number, currency: string) => `${currency} ${value}`,
}));

describe("ZakatSettingsDialog", () => {
  beforeEach(() => {
    vi.spyOn(global, "fetch").mockResolvedValue({
      ok: true,
      json: async () => ({
        success: true,
        data: {
          gold: { nisabValue: 5000, lastUpdated: null },
          silver: { nisabValue: 400, lastUpdated: null },
        },
      }),
    } as Response);
  });

  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(<ZakatSettingsDialog settings={null} />);

    await user.click(screen.getByRole("button", { name: /set anniversary/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
