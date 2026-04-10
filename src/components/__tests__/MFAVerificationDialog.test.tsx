// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MFAVerificationDialog } from "@/components/MFAVerificationDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    info: vi.fn(),
  },
}));

vi.mock("@/db/mutations/mfa", () => ({
  verifyMfaLogin: vi.fn(),
  useBackupCode: vi.fn(),
}));

describe("MFAVerificationDialog", () => {
  it("uses the mobile full-height form shell", () => {
    render(
      <MFAVerificationDialog
        open
        onOpenChange={vi.fn()}
        factorId="factor-1"
        email="user@example.com"
        onSuccess={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /verify & sign in/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
