import { describe, it, expect } from "vitest";
import { detectMilestones, type MilestoneInput } from "@/lib/milestones";

function makeInput(overrides: Partial<MilestoneInput> = {}): MilestoneInput {
  return {
    netWorthHistory: [],
    monthlyTrend: [],
    goals: [],
    debts: [],
    budgets: [],
    currency: "GBP",
    ...overrides,
  };
}

describe("detectMilestones", () => {
  it("returns empty array when no data", () => {
    const result = detectMilestones(makeInput());
    expect(result).toEqual([]);
  });

  // ---------------------------------------------------------------------------
  // Net worth growth
  // ---------------------------------------------------------------------------

  it("detects net worth growth >= 5%", () => {
    const result = detectMilestones(
      makeInput({
        netWorthHistory: [
          { date: "2025-01-01", net_worth: 10000, total_assets: 12000, total_liabilities: 2000, investment_value: 0 },
          { date: "2025-03-01", net_worth: 12000, total_assets: 14000, total_liabilities: 2000, investment_value: 0 },
        ],
      }),
    );

    const nwMilestone = result.find((m) => m.kind === "net_worth_growth");
    expect(nwMilestone).toBeDefined();
    expect(nwMilestone!.stat).toBe("+20%");
    expect(nwMilestone!.accent).toBe("blue");
  });

  it("skips net worth growth < 5%", () => {
    const result = detectMilestones(
      makeInput({
        netWorthHistory: [
          { date: "2025-01-01", net_worth: 10000, total_assets: 12000, total_liabilities: 2000, investment_value: 0 },
          { date: "2025-03-01", net_worth: 10200, total_assets: 12200, total_liabilities: 2000, investment_value: 0 },
        ],
      }),
    );

    expect(result.find((m) => m.kind === "net_worth_growth")).toBeUndefined();
  });

  it("skips net worth growth when net worth decreased", () => {
    const result = detectMilestones(
      makeInput({
        netWorthHistory: [
          { date: "2025-01-01", net_worth: 10000, total_assets: 12000, total_liabilities: 2000, investment_value: 0 },
          { date: "2025-03-01", net_worth: 9000, total_assets: 11000, total_liabilities: 2000, investment_value: 0 },
        ],
      }),
    );

    expect(result.find((m) => m.kind === "net_worth_growth")).toBeUndefined();
  });

  it("needs at least 2 data points for net worth growth", () => {
    const result = detectMilestones(
      makeInput({
        netWorthHistory: [
          { date: "2025-01-01", net_worth: 10000, total_assets: 12000, total_liabilities: 2000, investment_value: 0 },
        ],
      }),
    );

    expect(result.find((m) => m.kind === "net_worth_growth")).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Goal completion
  // ---------------------------------------------------------------------------

  it("detects completed goals", () => {
    const result = detectMilestones(
      makeInput({
        goals: [
          { id: "g1", name: "Vacation", target_amount: 1000, saved_amount: 1500 },
          { id: "g2", name: "Car", target_amount: 5000, saved_amount: 2000 },
        ],
      }),
    );

    const goalMilestones = result.filter((m) => m.kind === "goal_completed");
    expect(goalMilestones).toHaveLength(1);
    expect(goalMilestones[0].title).toContain("Vacation");
    expect(goalMilestones[0].accent).toBe("emerald");
  });

  it("returns no goal milestone when none completed", () => {
    const result = detectMilestones(
      makeInput({
        goals: [
          { id: "g1", name: "Car", target_amount: 5000, saved_amount: 2000 },
        ],
      }),
    );

    expect(result.filter((m) => m.kind === "goal_completed")).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // Debt paid off
  // ---------------------------------------------------------------------------

  it("detects paid-off debts", () => {
    const result = detectMilestones(
      makeInput({
        debts: [
          { id: "d1", name: "Credit Card", original_amount: 3000, remaining_amount: 0 },
          { id: "d2", name: "Student Loan", original_amount: 15000, remaining_amount: 8000 },
        ],
      }),
    );

    const debtMilestones = result.filter((m) => m.kind === "debt_paid_off");
    expect(debtMilestones).toHaveLength(1);
    expect(debtMilestones[0].title).toContain("Credit Card");
    expect(debtMilestones[0].accent).toBe("amber");
  });

  it("skips debts with zero original amount", () => {
    const result = detectMilestones(
      makeInput({
        debts: [
          { id: "d1", name: "Phantom", original_amount: 0, remaining_amount: 0 },
        ],
      }),
    );

    expect(result.filter((m) => m.kind === "debt_paid_off")).toHaveLength(0);
  });

  // ---------------------------------------------------------------------------
  // Savings streak
  // ---------------------------------------------------------------------------

  it("detects 3+ month savings streak", () => {
    const result = detectMilestones(
      makeInput({
        monthlyTrend: [
          { month: "2025-01", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-02", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-03", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-04", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
        ],
      }),
    );

    const streak = result.find((m) => m.kind === "savings_streak");
    expect(streak).toBeDefined();
    expect(streak!.stat).toBe("4 months");
    expect(streak!.accent).toBe("violet");
  });

  it("streak breaks when a month has negative net", () => {
    const result = detectMilestones(
      makeInput({
        monthlyTrend: [
          { month: "2025-01", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-02", income: 2000, expenses: 3000, refunds: 0, net: -1000 },
          { month: "2025-03", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-04", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
        ],
      }),
    );

    const streak = result.find((m) => m.kind === "savings_streak");
    expect(streak).toBeUndefined(); // Only 2 consecutive from the end
  });

  it("no savings streak with fewer than 3 months", () => {
    const result = detectMilestones(
      makeInput({
        monthlyTrend: [
          { month: "2025-01", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-02", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
        ],
      }),
    );

    expect(result.find((m) => m.kind === "savings_streak")).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Budget adherence
  // ---------------------------------------------------------------------------

  it("detects 80%+ budget adherence", () => {
    const result = detectMilestones(
      makeInput({
        budgets: [
          { id: "b1", spent: 80, limit: 100 },
          { id: "b2", spent: 90, limit: 100 },
          { id: "b3", spent: 50, limit: 100 },
          { id: "b4", spent: 95, limit: 100 },
          { id: "b5", spent: 60, limit: 100 },
        ],
      }),
    );

    const adherence = result.find((m) => m.kind === "budget_adherence");
    expect(adherence).toBeDefined();
    expect(adherence!.stat).toBe("100%");
    expect(adherence!.accent).toBe("rose");
  });

  it("skips budget adherence below 80%", () => {
    const result = detectMilestones(
      makeInput({
        budgets: [
          { id: "b1", spent: 150, limit: 100 },
          { id: "b2", spent: 120, limit: 100 },
          { id: "b3", spent: 50, limit: 100 },
        ],
      }),
    );

    // 1 of 3 on track = 33%
    expect(result.find((m) => m.kind === "budget_adherence")).toBeUndefined();
  });

  it("needs at least 2 budgets for adherence", () => {
    const result = detectMilestones(
      makeInput({
        budgets: [{ id: "b1", spent: 50, limit: 100 }],
      }),
    );

    expect(result.find((m) => m.kind === "budget_adherence")).toBeUndefined();
  });

  // ---------------------------------------------------------------------------
  // Combined
  // ---------------------------------------------------------------------------

  it("detects multiple milestones at once", () => {
    const result = detectMilestones(
      makeInput({
        netWorthHistory: [
          { date: "2025-01-01", net_worth: 10000, total_assets: 12000, total_liabilities: 2000, investment_value: 0 },
          { date: "2025-04-01", net_worth: 15000, total_assets: 17000, total_liabilities: 2000, investment_value: 0 },
        ],
        goals: [
          { id: "g1", name: "Done", target_amount: 100, saved_amount: 200 },
        ],
        debts: [
          { id: "d1", name: "Cleared", original_amount: 500, remaining_amount: 0 },
        ],
        monthlyTrend: [
          { month: "2025-01", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-02", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
          { month: "2025-03", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
        ],
        budgets: [
          { id: "b1", spent: 80, limit: 100 },
          { id: "b2", spent: 50, limit: 100 },
        ],
      }),
    );

    const kinds = new Set(result.map((m) => m.kind));
    expect(kinds.has("net_worth_growth")).toBe(true);
    expect(kinds.has("goal_completed")).toBe(true);
    expect(kinds.has("debt_paid_off")).toBe(true);
    expect(kinds.has("savings_streak")).toBe(true);
    expect(kinds.has("budget_adherence")).toBe(true);
    expect(result.length).toBe(5);
  });

  it("results are sorted by achievedAt descending", () => {
    const result = detectMilestones(
      makeInput({
        goals: [
          { id: "g1", name: "Goal A", target_amount: 100, saved_amount: 200 },
          { id: "g2", name: "Goal B", target_amount: 100, saved_amount: 200 },
        ],
      }),
    );

    // All have the same achievedAt (today), so just verify the array is non-empty and sorted
    expect(result.length).toBe(2);
    for (let i = 1; i < result.length; i++) {
      expect(result[i].achievedAt <= result[i - 1].achievedAt).toBe(true);
    }
  });
});
