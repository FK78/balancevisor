// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { DecisionRow } from "@/components/dense-data/DecisionRow";
import { DecisionMetricCard } from "@/components/dense-data/DecisionMetricCard";
import { DecisionEmptyState } from "@/components/dense-data/DecisionEmptyState";
import { ChartSkeleton } from "@/components/ChartSkeleton";

describe("Decision primitives", () => {
  it("DecisionRow renders signal, context, interpretation, and action", () => {
    render(
      <DecisionRow
        title="Emergency fund progress"
        amount="$12,400"
        statusLabel="On track"
        meta={["Target: $15,000", "83% funded"]}
        interpretation="You are close to your 6-month reserve target."
        action={<button type="button">Top up fund</button>}
      />,
    );

    const title = screen.getByRole("heading", {
      level: 3,
      name: "Emergency fund progress",
    });
    expect(title).toBeInTheDocument();
    expect(title).not.toHaveClass("decision-eyebrow");

    const statusLabel = screen.getByText("On track");
    expect(statusLabel).toBeInTheDocument();
    expect(statusLabel).toHaveClass("decision-eyebrow");
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

  it("DecisionRow filters falsy or blank meta entries", () => {
    render(
      <DecisionRow
        title="Liquidity buffer"
        amount="$7,200"
        meta={["", "   ", "Covers 2.8 months", "\t"]}
      />,
    );

    const items = screen.getAllByRole("listitem");
    expect(items).toHaveLength(1);
    expect(screen.getByText("Covers 2.8 months")).toBeInTheDocument();
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

  it("ChartSkeleton applies the requested height contract", () => {
    const { container } = render(<ChartSkeleton height={260} />);
    const skeletonCard = container.firstElementChild;

    expect(skeletonCard).toHaveStyle("height: 260px");
  });
});
