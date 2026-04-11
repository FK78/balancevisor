import { describe, expect, it } from "vitest";

import { buildCategoriesCockpitModel } from "@/components/categories/categories-cockpit";

const categories = [
  { id: "groceries", name: "Groceries", color: "#16a34a", icon: "shopping-cart", user_id: "u1" },
  { id: "housing", name: "Housing", color: "#1d4ed8", icon: "house", user_id: "u1" },
  { id: "coffee", name: "Coffee", color: "#92400e", icon: "coffee", user_id: "u1" },
] as const;

const topSpend = [
  { category: "Housing", color: "#1d4ed8", total: 1500 },
  { category: "Groceries", color: "#16a34a", total: 450 },
  { category: "Coffee", color: "#92400e", total: 120 },
] as const;

const monthlyRows = [
  { month: "2026-01", category: "Housing", category_id: "housing", color: "#1d4ed8", total: 1350 },
  { month: "2026-02", category: "Housing", category_id: "housing", color: "#1d4ed8", total: 1425 },
  { month: "2026-03", category: "Housing", category_id: "housing", color: "#1d4ed8", total: 1500 },
  { month: "2026-01", category: "Groceries", category_id: "groceries", color: "#16a34a", total: 380 },
  { month: "2026-02", category: "Groceries", category_id: "groceries", color: "#16a34a", total: 410 },
  { month: "2026-03", category: "Groceries", category_id: "groceries", color: "#16a34a", total: 450 },
] as const;

describe("buildCategoriesCockpitModel", () => {
  it("chooses add rule as the primary action when uncategorised structure is the bigger gap", () => {
    const model = buildCategoriesCockpitModel({
      categories,
      topSpendByCategory: topSpend,
      monthlySpendRows: monthlyRows,
      rules: [],
    });

    expect(model.primaryAction.key).toBe("add-rule");
    expect(model.primaryAction.label).toMatch(/add rule/i);
    expect(model.heroTitle).toMatch(/coverage|rules/i);
    expect(model.priorityCards[0]?.id).toBe("rule-coverage");
  });

  it("chooses add category when rule coverage is healthier than category structure depth", () => {
    const model = buildCategoriesCockpitModel({
      categories: [{ id: "housing", name: "Housing", color: "#1d4ed8", icon: "house", user_id: "u1" }],
      topSpendByCategory: [{ category: "Housing", color: "#1d4ed8", total: 1500 }],
      monthlySpendRows: monthlyRows,
      rules: [
        {
          id: "rule-rent",
          pattern: "landlord",
          category_id: "housing",
          categoryName: "Housing",
          categoryColor: "#1d4ed8",
          priority: 100,
        },
        {
          id: "rule-store",
          pattern: "tesco",
          category_id: "groceries",
          categoryName: "Groceries",
          categoryColor: "#16a34a",
          priority: 90,
        },
      ],
    });

    expect(model.primaryAction.key).toBe("add-category");
    expect(model.primaryAction.label).toMatch(/add category/i);
    expect(model.heroTitle).toMatch(/concentration|single/i);
    expect(model.priorityCards.some((card) => card.id === "category-depth")).toBe(true);
  });

  it("surfaces category movement in the hero when month-over-month change is the main signal", () => {
    const model = buildCategoriesCockpitModel({
      categories,
      topSpendByCategory: [
        { category: "Housing", color: "#1d4ed8", total: 980 },
        { category: "Groceries", color: "#16a34a", total: 920 },
      ],
      monthlySpendRows: [
        { month: "2026-01", category: "Housing", category_id: "housing", color: "#1d4ed8", total: 420 },
        { month: "2026-02", category: "Housing", category_id: "housing", color: "#1d4ed8", total: 540 },
        { month: "2026-03", category: "Housing", category_id: "housing", color: "#1d4ed8", total: 980 },
        { month: "2026-01", category: "Groceries", category_id: "groceries", color: "#16a34a", total: 810 },
        { month: "2026-02", category: "Groceries", category_id: "groceries", color: "#16a34a", total: 860 },
        { month: "2026-03", category: "Groceries", category_id: "groceries", color: "#16a34a", total: 920 },
      ],
      rules: [
        {
          id: "rule-rent",
          pattern: "landlord",
          category_id: "housing",
          categoryName: "Housing",
          categoryColor: "#1d4ed8",
          priority: 100,
        },
        {
          id: "rule-groceries",
          pattern: "tesco",
          category_id: "groceries",
          categoryName: "Groceries",
          categoryColor: "#16a34a",
          priority: 90,
        },
        {
          id: "rule-coffee",
          pattern: "pret",
          category_id: "coffee",
          categoryName: "Coffee",
          categoryColor: "#92400e",
          priority: 80,
        },
      ],
    });

    expect(model.heroTitle).toMatch(/housing/i);
    expect(model.heroDescription).toMatch(/shift|movement|month/i);
    expect(model.priorityCards[0]?.id).toBe("category-movement");
  });

  it("keeps the empty state calm and points the first action to adding a category", () => {
    const model = buildCategoriesCockpitModel({
      categories: [],
      topSpendByCategory: [],
      monthlySpendRows: [],
      rules: [],
    });

    expect(model.primaryAction.key).toBe("add-category");
    expect(model.heroTitle).toMatch(/build your category structure/i);
    expect(model.priorityCards).toHaveLength(3);
  });
});
