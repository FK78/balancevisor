// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import {
  ActionShelf,
  CockpitHero,
  PriorityCard,
  PriorityStack,
  SoftPanel,
} from "@/components/ui/cockpit";

describe("Cockpit primitives", () => {
  it("renders a cockpit hero with a single next step", () => {
    render(
      <CockpitHero
        eyebrow="Dashboard"
        title="Cash is stable, one budget needs review"
        description="You are in a healthy position today, with one thing worth checking now."
        action={<button type="button">Review budget</button>}
        aside={<p>April snapshot</p>}
      />,
    );

    expect(screen.getByText("Dashboard")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Cash is stable, one budget needs review",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "You are in a healthy position today, with one thing worth checking now.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Review budget" })).toBeInTheDocument();
    expect(screen.getByText("April snapshot")).toBeInTheDocument();
  });

  it("renders an action shelf, priority stack, and soft panel", () => {
    render(
      <>
        <ActionShelf
          eyebrow="Next step"
          title="Move quickly on the highest-value task"
          description="Keep tools secondary and the next action obvious."
        >
          <button type="button">Open review queue</button>
        </ActionShelf>
        <PriorityStack
          eyebrow="Priorities"
          title="Focus on the few things that matter"
          description="Each card should explain what changed and what to do next."
        >
          <PriorityCard title="Budget is close to limit" description="Dining has reached 85% of plan." />
          <PriorityCard title="Bill due tomorrow" description="Internet bill lands before payday." />
        </PriorityStack>
        <SoftPanel
          eyebrow="Install"
          title="Add Wealth to your phone"
          description="Save time getting back to the app with a calmer install helper."
        />
      </>,
    );

    expect(screen.getByText("Move quickly on the highest-value task")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Open review queue" })).toBeInTheDocument();
    expect(screen.getByText("Focus on the few things that matter")).toBeInTheDocument();
    expect(screen.getByText("Budget is close to limit")).toBeInTheDocument();
    expect(screen.getByText("Bill due tomorrow")).toBeInTheDocument();
    expect(screen.getByText("Add Wealth to your phone")).toBeInTheDocument();
  });
});
