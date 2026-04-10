// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ConnectBrokerDialog } from "@/components/ConnectBrokerDialog";

vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
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
  },
}));

vi.mock("@/db/mutations/investments", () => ({
  connectBroker: vi.fn(),
  disconnectBroker: vi.fn(),
}));

describe("ConnectBrokerDialog", () => {
  it("uses the mobile full-height form shell", async () => {
    const user = userEvent.setup();

    render(<ConnectBrokerDialog />);

    await user.click(screen.getByRole("button", { name: /connect broker/i }));
    await user.click(screen.getByRole("button", { name: /trading 212/i }));

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /back/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
