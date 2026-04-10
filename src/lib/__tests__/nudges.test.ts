import { describe, it, expect } from "vitest";
import { generateNudges } from "@/lib/nudges";
import type { SubscriptionHealthReport } from "@/lib/subscription-health";
import type { BudgetRow } from "@/db/queries/budgets";

const emptyHealth: SubscriptionHealthReport = {
  billIncreases: [],
  unusedSubscriptions: [],
  overlaps: [],
  potentialMonthlySavings: 0,
};

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

describe("generateNudges", () => {
  it("returns empty array when there are no issues", () => {
    const nudges = generateNudges({
      subscriptionHealth: emptyHealth,
      anomalies: [],
      budgets: [],
      monthlyTrend: [],
      goalsProgress: [],
      currency: "GBP",
    });
    expect(nudges).toEqual([]);
  });

  it("generates bill increase nudges", () => {
    const health: SubscriptionHealthReport = {
      ...emptyHealth,
      billIncreases: [
        {
          subscriptionId: "sub-1",
          name: "Netflix",
          previousAmount: 9.99,
          currentAmount: 12.99,
          increaseAmount: 3,
          increasePercent: 30,
          billingCycle: "monthly",
          monthlyImpact: 3,
        },
      ],
      potentialMonthlySavings: 3,
    };

    const nudges = generateNudges({
      subscriptionHealth: health,
      anomalies: [],
      budgets: [],
      monthlyTrend: [],
      goalsProgress: [],
      currency: "GBP",
    });

    expect(nudges.length).toBeGreaterThanOrEqual(1);
    expect(nudges[0].id).toBe("bill-increase-sub-1");
    expect(nudges[0].category).toBe("watch");
  });

  it("generates unused subscription nudges", () => {
    const health: SubscriptionHealthReport = {
      ...emptyHealth,
      unusedSubscriptions: [
        {
          subscriptionId: "sub-2",
          name: "Gym",
          amount: 30,
          billingCycle: "monthly",
          monthlyAmount: 30,
          daysSinceLastTransaction: 90,
        },
      ],
      potentialMonthlySavings: 30,
    };

    const nudges = generateNudges({
      subscriptionHealth: health,
      anomalies: [],
      budgets: [],
      monthlyTrend: [],
      goalsProgress: [],
      currency: "GBP",
    });

    expect(nudges.some((n) => n.id === "unused-sub-sub-2")).toBe(true);
  });

  it("filters out dismissed nudges", () => {
    const health: SubscriptionHealthReport = {
      ...emptyHealth,
      billIncreases: [
        {
          subscriptionId: "sub-1",
          name: "Netflix",
          previousAmount: 9.99,
          currentAmount: 12.99,
          increaseAmount: 3,
          increasePercent: 30,
          billingCycle: "monthly",
          monthlyImpact: 3,
        },
      ],
      potentialMonthlySavings: 3,
    };

    const nudges = generateNudges({
      subscriptionHealth: health,
      anomalies: [],
      budgets: [],
      monthlyTrend: [],
      goalsProgress: [],
      currency: "GBP",
      dismissedNudgeKeys: new Set(["bill-increase-sub-1"]),
    });

    expect(nudges.some((n) => n.id === "bill-increase-sub-1")).toBe(false);
  });

  it("caps nudges at 8", () => {
    const health: SubscriptionHealthReport = {
      ...emptyHealth,
      billIncreases: Array.from({ length: 3 }, (_, i) => ({
        subscriptionId: `sub-${i}`,
        name: `Sub ${i}`,
        previousAmount: 10,
        currentAmount: 15,
        increaseAmount: 5,
        increasePercent: 50,
        billingCycle: "monthly" as const,
        monthlyImpact: 5,
      })),
      unusedSubscriptions: Array.from({ length: 3 }, (_, i) => ({
        subscriptionId: `unused-${i}`,
        name: `Unused ${i}`,
        amount: 10,
        billingCycle: "monthly" as const,
        monthlyAmount: 10,
        daysSinceLastTransaction: 90,
      })),
      overlaps: Array.from({ length: 3 }, (_, i) => ({
        category: `Cat ${i}`,
        categoryColor: "#000",
        subscriptions: [
          { name: "A", monthlyAmount: 5 },
          { name: "B", monthlyAmount: 5 },
        ],
        totalMonthly: 10,
      })),
      potentialMonthlySavings: 60,
    };

    const nudges = generateNudges({
      subscriptionHealth: health,
      anomalies: [],
      budgets: [],
      monthlyTrend: [],
      goalsProgress: [],
      currency: "GBP",
    });

    expect(nudges.length).toBeLessThanOrEqual(8);
  });

  it("sorts by priority descending", () => {
    const health: SubscriptionHealthReport = {
      ...emptyHealth,
      billIncreases: [
        {
          subscriptionId: "sub-1",
          name: "Netflix",
          previousAmount: 10,
          currentAmount: 15,
          increaseAmount: 5,
          increasePercent: 50,
          billingCycle: "monthly",
          monthlyImpact: 5,
        },
      ],
      unusedSubscriptions: [
        {
          subscriptionId: "sub-2",
          name: "Gym",
          amount: 30,
          billingCycle: "monthly",
          monthlyAmount: 30,
          daysSinceLastTransaction: 90,
        },
      ],
      potentialMonthlySavings: 35,
    };

    const nudges = generateNudges({
      subscriptionHealth: health,
      anomalies: [],
      budgets: [],
      monthlyTrend: [],
      goalsProgress: [],
      currency: "GBP",
    });

    for (let i = 1; i < nudges.length; i++) {
      expect(nudges[i - 1].priority).toBeGreaterThanOrEqual(nudges[i].priority);
    }
  });
});
