import { describe, it, expect } from "vitest";
import { calculateBudgetPace } from "@/lib/budget-pace";
import type { BudgetRow } from "@/db/queries/budgets";

function makeBudget(overrides: Partial<BudgetRow> & { id: string; budgetAmount: number; budgetSpent: number; budgetCategory: string }): BudgetRow {
  return {
    category_id: "cat-1",
    budgetColor: "#000",
    budgetIcon: "circle",
    budgetPeriod: "monthly",
    start_date: "2025-01-01",
    isShared: false,
    ...overrides,
  } as BudgetRow;
}

describe("calculateBudgetPace", () => {
  it("returns empty when dayOfMonth < 3", () => {
    const budgets = [makeBudget({ id: "b1", budgetAmount: 100, budgetSpent: 90, budgetCategory: "Food" })];
    const earlyMonth = new Date(2025, 0, 2); // Jan 2nd
    expect(calculateBudgetPace(budgets, earlyMonth)).toEqual([]);
  });

  it("detects overspending budget", () => {
    const budgets = [makeBudget({ id: "b1", budgetAmount: 300, budgetSpent: 200, budgetCategory: "Food" })];
    // Day 10 of 31-day month: rate = 200/10 = 20/day → projected = 620 → overspend 320
    const midMonth = new Date(2025, 0, 10);
    const results = calculateBudgetPace(budgets, midMonth);
    expect(results.length).toBe(1);
    expect(results[0].budgetId).toBe("b1");
    expect(results[0].willOverspend).toBe(true);
    expect(results[0].projectedOverspend).toBeGreaterThan(0);
  });

  it("does not flag budgets within limit", () => {
    const budgets = [makeBudget({ id: "b2", budgetAmount: 1000, budgetSpent: 100, budgetCategory: "Transport" })];
    const midMonth = new Date(2025, 0, 15);
    const results = calculateBudgetPace(budgets, midMonth);
    expect(results.length).toBe(0);
  });

  it("sorts by projected overspend descending", () => {
    const budgets = [
      makeBudget({ id: "b1", budgetAmount: 100, budgetSpent: 80, budgetCategory: "Food" }),
      makeBudget({ id: "b2", budgetAmount: 200, budgetSpent: 180, budgetCategory: "Entertainment" }),
    ];
    const midMonth = new Date(2025, 0, 10);
    const results = calculateBudgetPace(budgets, midMonth);
    expect(results.length).toBe(2);
    expect(results[0].projectedOverspend).toBeGreaterThanOrEqual(results[1].projectedOverspend);
  });

  it("skips budgets with zero amount", () => {
    const budgets = [makeBudget({ id: "b1", budgetAmount: 0, budgetSpent: 50, budgetCategory: "Misc" })];
    const midMonth = new Date(2025, 0, 15);
    expect(calculateBudgetPace(budgets, midMonth)).toEqual([]);
  });
});
