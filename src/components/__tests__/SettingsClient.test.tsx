// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { SettingsClient } from "@/components/SettingsClient";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

vi.mock("sonner", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
    reset: vi.fn(),
  },
}));

vi.mock("@/components/ThemeProvider", () => ({
  useTheme: () => ({
    theme: "light",
    setTheme: vi.fn(),
  }),
}));

vi.mock("@/components/MFASettings", () => ({
  MFASettings: () => <div>MFA settings stub</div>,
}));

vi.mock("@/components/ChangePasswordForm", () => ({
  ChangePasswordForm: () => <div>Change password stub</div>,
}));

vi.mock("@/components/ImportDataDialog", () => ({
  ImportDataDialog: () => <div>Import data stub</div>,
}));

vi.mock("@/db/mutations/settings", () => ({
  updateDisplayName: vi.fn(),
  updateBaseCurrency: vi.fn(),
  deleteAccount: vi.fn(),
  exportUserData: vi.fn(),
}));

vi.mock("@/db/mutations/preferences", () => ({
  toggleAiEnabled: vi.fn(),
  updateDisabledFeatures: vi.fn(),
}));

describe("SettingsClient", () => {
  it("uses the mobile full-height form shell for account deletion", async () => {
    const user = userEvent.setup();

    render(
      <SettingsClient
        displayName="Fahad"
        email="fahad@example.com"
        baseCurrency="USD"
        supportedCurrencies={["USD", "GBP"]}
        aiEnabled
        disabledFeatures={[]}
      />,
    );

    await user.click(screen.getByRole("button", { name: /delete account/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /cancel/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
