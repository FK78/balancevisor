// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectBankButton } from "@/components/ConnectBankButton";

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

vi.mock("@/db/mutations/truelayer", () => ({
  importFromTrueLayer: vi.fn(),
  disconnectTrueLayer: vi.fn(),
}));

vi.mock("@/lib/formatTimeAgo", () => ({
  formatTimeAgo: () => "just now",
}));

describe("ConnectBankButton", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(<ConnectBankButton connections={[]} />);

    await user.click(screen.getByRole("button", { name: /connect bank/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("link", { name: /connect bank/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
