// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MFASetupWizard } from "@/components/MFASetupWizard";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("@/db/mutations/mfa", () => ({
  generateMfaSetup: vi.fn(),
  verifyMfaSetup: vi.fn(),
  enableMfa: vi.fn(),
}));

describe("MFASetupWizard", () => {
  it("uses the mobile full-height wizard shell with a sticky action footer", () => {
    render(
      <MFASetupWizard
        open
        onOpenChange={vi.fn()}
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /get started/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
