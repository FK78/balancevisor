// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { CategoryStructureGrid } from "@/components/categories/CategoryStructureGrid";

const categories = [
  {
    id: "housing",
    name: "Housing",
    color: "#1d4ed8",
    icon: "house",
    spendShare: 58.1,
    spendLabel: "£1,500.00 this month",
    shareLabel: "58% of tracked spend",
    structureSignal: "Largest category this month",
    trendLabel: "+11% vs last month",
    actions: <button type="button">Edit Housing</button>,
  },
  {
    id: "groceries",
    name: "Groceries",
    color: "#16a34a",
    icon: "shopping-cart",
    spendShare: 17.4,
    spendLabel: "£450.00 this month",
    shareLabel: "17% of tracked spend",
    structureSignal: "Steady share across the quarter",
    trendLabel: "+4% vs last month",
    actions: <button type="button">Edit Groceries</button>,
  },
];

describe("CategoryStructureGrid", () => {
  it("renders structure-first cards with spend share, trend, and identity signals", () => {
    render(<CategoryStructureGrid categories={categories} />);

    const housingCard = screen.getByTestId("category-structure-card-housing");
    expect(within(housingCard).getByText("Housing")).toBeInTheDocument();
    expect(within(housingCard).getByText("58% of tracked spend")).toBeInTheDocument();
    expect(within(housingCard).getByText("+11% vs last month")).toBeInTheDocument();
    expect(within(housingCard).getByText("Largest category this month")).toBeInTheDocument();
    expect(within(housingCard).getByRole("button", { name: "Edit Housing" })).toBeInTheDocument();
  });

  it("shows a calm empty state that keeps structure understanding ahead of maintenance", () => {
    render(<CategoryStructureGrid categories={[]} emptyAction={<button type="button">Add category</button>} />);

    expect(screen.getByText(/no category structure yet/i)).toBeInTheDocument();
    expect(screen.getByText(/start by adding the categories/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /add category/i })).toBeInTheDocument();
  });
});
