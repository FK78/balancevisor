// @vitest-environment happy-dom
import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import { WidgetLayoutProvider } from "@/components/WidgetLayoutProvider";
import { ReadOnlyWidgetGrid } from "@/components/ReadOnlyWidgetGrid";
import { DashboardWidget } from "@/components/DashboardWidget";
import type { WidgetLayoutItem } from "@/lib/widget-registry";

describe("ReadOnlyWidgetGrid", () => {
  it("renders widgets in saved layout order", () => {
    const layout: readonly WidgetLayoutItem[] = [
      { widgetId: "second", visible: true },
      { widgetId: "first", visible: true },
    ];

    const { container } = render(
      <WidgetLayoutProvider pageId="dashboard" serverLayout={layout}>
        <ReadOnlyWidgetGrid>
          <DashboardWidget id="first">
            <div data-testid="first-widget">First</div>
          </DashboardWidget>
          <DashboardWidget id="second">
            <div data-testid="second-widget">Second</div>
          </DashboardWidget>
        </ReadOnlyWidgetGrid>
      </WidgetLayoutProvider>,
    );

    const widgetTexts = Array.from(container.querySelectorAll("[data-testid$='widget']")).map(
      (node) => node.textContent,
    );
    expect(container.querySelector("[data-cockpit-grid='true']")).not.toBeNull();
    expect(widgetTexts).toEqual(["Second", "First"]);
  });

  it("hides widgets marked invisible in the saved layout", () => {
    const layout: readonly WidgetLayoutItem[] = [
      { widgetId: "visible", visible: true },
      { widgetId: "hidden", visible: false },
    ];

    render(
      <WidgetLayoutProvider pageId="dashboard" serverLayout={layout}>
        <ReadOnlyWidgetGrid>
          <DashboardWidget id="visible">
            <div>Visible widget</div>
          </DashboardWidget>
          <DashboardWidget id="hidden">
            <div>Hidden widget</div>
          </DashboardWidget>
        </ReadOnlyWidgetGrid>
      </WidgetLayoutProvider>,
    );

    expect(screen.getByText("Visible widget")).toBeInTheDocument();
    expect(screen.queryByText("Hidden widget")).not.toBeInTheDocument();
  });
});
