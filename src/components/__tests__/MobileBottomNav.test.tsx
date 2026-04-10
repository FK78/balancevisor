// @vitest-environment happy-dom
import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { MobileBottomNav } from "@/components/MobileBottomNav";
import { FeatureFlagsProvider } from "@/components/FeatureFlagsProvider";

let mockPathname = "/dashboard";

vi.mock("next/navigation", () => ({
  usePathname: () => mockPathname,
}));

vi.mock("@/components/MobileNavDrawer", () => ({
  MobileNavDrawer: ({ open }: { open: boolean }) => (
    open ? <div data-testid="mobile-nav-drawer">Drawer Open</div> : null
  ),
}));

describe("MobileBottomNav", () => {
  beforeEach(() => {
    mockPathname = "/dashboard";
  });

  it("marks the active link with aria-current", () => {
    mockPathname = "/dashboard/transactions";

    render(
      <FeatureFlagsProvider disabledFeatures={[]}>
        <MobileBottomNav />
      </FeatureFlagsProvider>,
    );

    expect(screen.getByRole("link", { name: "Transactions" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Dashboard" })).not.toHaveAttribute("aria-current");
  });

  it("hides disabled items and opens the more drawer", async () => {
    const user = userEvent.setup();

    render(
      <FeatureFlagsProvider disabledFeatures={["investments"]}>
        <MobileBottomNav />
      </FeatureFlagsProvider>,
    );

    expect(screen.queryByRole("link", { name: "Investments" })).not.toBeInTheDocument();

    await user.click(screen.getByRole("button", { name: "More" }));

    expect(screen.getByTestId("mobile-nav-drawer")).toBeInTheDocument();
  });
});
