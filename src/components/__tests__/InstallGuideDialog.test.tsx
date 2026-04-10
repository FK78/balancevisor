// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { InstallGuideDialog } from "@/components/InstallGuideDialog";

describe("InstallGuideDialog", () => {
  it("uses the mobile full-height form shell", () => {
    render(
      <InstallGuideDialog
        open
        onOpenChange={vi.fn()}
        method="ios-safari"
      />,
    );

    expect(screen.getByRole("dialog")).toHaveAttribute("data-mobile-layout", "full-height");
    expect(
      screen.getByRole("button", { name: /done/i }).closest("[data-slot='dialog-footer']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });
});
