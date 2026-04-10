// @vitest-environment happy-dom
import { useState } from "react";
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { WorkspaceTabs } from "@/components/ui/workspace-tabs";

function TestTabs() {
  const [value, setValue] = useState("overview");

  return (
    <WorkspaceTabs
      ariaLabel="Dashboard sections"
      value={value}
      onValueChange={setValue}
      tabs={[
        { value: "overview", label: "Overview" },
        { value: "activity", label: "Activity" },
        { value: "planning", label: "Planning" },
      ]}
    />
  );
}

describe("WorkspaceTabs", () => {
  it("renders accessible tab semantics with the selected tab", () => {
    render(<TestTabs />);

    expect(screen.getByRole("tablist", { name: "Dashboard sections" })).toBeInTheDocument();
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Activity" })).toHaveAttribute("aria-selected", "false");
  });

  it("updates the selected state after clicking a tab", async () => {
    const user = userEvent.setup();

    render(<TestTabs />);

    await user.click(screen.getByRole("tab", { name: "Planning" }));

    expect(screen.getByRole("tab", { name: "Planning" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Planning" })).toHaveAttribute("data-state", "active");
    expect(screen.getByRole("tab", { name: "Overview" })).toHaveAttribute("aria-selected", "false");
  });
});
