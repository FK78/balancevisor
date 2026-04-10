// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MFASettings } from "@/components/MFASettings";

const { checkMfaStatus, getBackupCodes } = vi.hoisted(() => ({
  checkMfaStatus: vi.fn().mockResolvedValue({
    enabled: true,
    setupRequired: false,
    reminderDismissed: false,
    factors: [],
  }),
  getBackupCodes: vi.fn().mockResolvedValue([
    { id: "code-1", used: false, created_at: "2026-04-01" },
  ]),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/components/MFASetupWizard", () => ({
  MFASetupWizard: () => null,
}));

vi.mock("@/db/mutations/mfa", () => ({
  checkMfaStatus,
  disableMfa: vi.fn(),
  regenerateBackupCodes: vi.fn(),
  getBackupCodes,
}));

describe("MFASettings", () => {
  it("uses the mobile full-height form shell for the disable flow", async () => {
    const user = userEvent.setup();

    render(<MFASettings />);

    await user.click(await screen.findByRole("button", { name: /disable 2fa/i }));

    const dialog = screen.getByRole("dialog");

    expect(dialog).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      within(dialog).getByRole("button", { name: /disable 2fa/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
