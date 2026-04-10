// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DecisionRow } from "@/components/dense-data/DecisionRow";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";

describe("Decision primitives", () => {
  it("DecisionRow renders signal, context, interpretation, and action", () => {
    render(
      <DecisionRow
        title="Emergency fund progress"
        amount="$12,400"
        meta={["Target: $15,000", "83% funded"]}
        interpretation="You are close to your 6-month reserve target."
        action={<button type="button">Top up fund</button>}
      />,
    );

    expect(screen.getByText("Emergency fund progress")).toBeInTheDocument();
    expect(screen.getByText("$12,400")).toBeInTheDocument();
    expect(screen.getByText("Target: $15,000")).toBeInTheDocument();
    expect(screen.getByText("83% funded")).toBeInTheDocument();
    expect(
      screen.getByText("You are close to your 6-month reserve target."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Top up fund" }),
    ).toBeInTheDocument();
  });

  it("DecisionMetricCard renders interpretation and action", () => {
    render(
      <DecisionMetricCard
        eyebrow="Cash flow"
        title="+$980 this month"
        subtitle="After recurring obligations"
        interpretation="You can safely move 40% to long-term savings."
        action={<button type="button">Move to savings</button>}
      />,
    );

    expect(screen.getByText("Cash flow")).toBeInTheDocument();
    expect(screen.getByText("+$980 this month")).toBeInTheDocument();
    expect(screen.getByText("After recurring obligations")).toBeInTheDocument();
    expect(
      screen.getByText("You can safely move 40% to long-term savings."),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Move to savings" }),
    ).toBeInTheDocument();
  });

  it("DecisionEmptyState renders reason and next step", () => {
    render(
      <DecisionEmptyState
        title="No unusual spending signals"
        description="We need at least two full weeks of categorized transactions."
        action={<button type="button">Review categories</button>}
      />,
    );

    expect(screen.getByText("No unusual spending signals")).toBeInTheDocument();
    expect(
      screen.getByText(
        "We need at least two full weeks of categorized transactions.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Review categories" }),
    ).toBeInTheDocument();
  });
});
