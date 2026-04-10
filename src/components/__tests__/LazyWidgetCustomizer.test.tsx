// @vitest-environment happy-dom
import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { LazyWidgetCustomizer } from "@/components/LazyWidgetCustomizer";
import { DashboardWidget } from "@/components/DashboardWidget";
import type { WidgetLayoutItem } from "@/lib/widget-registry";

vi.mock("sonner", () => ({
  toast: {
    error: vi.fn(),
  },
}));

describe("LazyWidgetCustomizer", () => {
  const layout: readonly WidgetLayoutItem[] = [
    { widgetId: "alpha", visible: true },
    { widgetId: "beta", visible: true },
  ];

  it("keeps edit-only UI unloaded until activated", () => {
    render(
      <LazyWidgetCustomizer pageId="dashboard" serverLayout={layout}>
        <DashboardWidget id="alpha">
          <div>Alpha widget</div>
        </DashboardWidget>
        <DashboardWidget id="beta">
          <div>Beta widget</div>
        </DashboardWidget>
      </LazyWidgetCustomizer>,
    );

    expect(screen.getByRole("button", { name: /edit layout/i })).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /done/i })).not.toBeInTheDocument();
    expect(screen.queryByText("Customise Layout")).not.toBeInTheDocument();
  });

  it("loads edit controls only after the user activates customization", async () => {
    const user = userEvent.setup();

    render(
      <LazyWidgetCustomizer pageId="dashboard" serverLayout={layout}>
        <DashboardWidget id="alpha">
          <div>Alpha widget</div>
        </DashboardWidget>
        <DashboardWidget id="beta">
          <div>Beta widget</div>
        </DashboardWidget>
      </LazyWidgetCustomizer>,
    );

    await user.click(screen.getByRole("button", { name: /edit layout/i }));

    expect(await screen.findByRole("button", { name: /done/i })).toBeInTheDocument();
    expect(await screen.findAllByRole("button", { name: /hide/i })).toHaveLength(2);
  });
});
