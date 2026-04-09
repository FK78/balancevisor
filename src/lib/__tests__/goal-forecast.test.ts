import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock DB query
vi.mock("@/db/queries/transactions", () => ({
  getMonthlyIncomeExpenseTrend: vi.fn(),
}));

import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getGoalForecasts } from "@/lib/goal-forecast";

const mockGetTrend = vi.mocked(getMonthlyIncomeExpenseTrend);

describe("getGoalForecasts", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("returns 'completed' for goals already met", async () => {
    mockGetTrend.mockResolvedValue([
      { month: "2025-01", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
    ]);

    const result = await getGoalForecasts("user-1", [
      { id: "g1", name: "Vacation", target_amount: 1000, saved_amount: 1500, target_date: null, color: "#f00" },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].status).toBe("completed");
    expect(result[0].remaining).toBe(0);
    expect(result[0].estimatedMonths).toBe(0);
  });

  it("estimates months to completion with positive savings", async () => {
    mockGetTrend.mockResolvedValue([
      { month: "2025-01", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
      { month: "2025-02", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
      { month: "2025-03", income: 3000, expenses: 2000, refunds: 0, net: 1000 },
    ]);

    const result = await getGoalForecasts("user-1", [
      { id: "g1", name: "Car", target_amount: 5000, saved_amount: 1000, target_date: null, color: "#0f0" },
    ]);

    expect(result[0].remaining).toBe(4000);
    expect(result[0].avgMonthlySavings).toBe(1000);
    expect(result[0].estimatedMonths).toBe(4);
    expect(result[0].status).toBe("on_track");
  });

  it("returns 'at_risk' when no savings (no deadline)", async () => {
    mockGetTrend.mockResolvedValue([
      { month: "2025-01", income: 2000, expenses: 2000, refunds: 0, net: 0 },
    ]);

    const result = await getGoalForecasts("user-1", [
      { id: "g1", name: "House", target_amount: 50000, saved_amount: 0, target_date: null, color: "#00f" },
    ]);

    expect(result[0].status).toBe("at_risk");
    expect(result[0].estimatedMonths).toBeNull();
  });

  it("returns 'behind' when deadline has passed with remaining amount", async () => {
    mockGetTrend.mockResolvedValue([
      { month: "2025-01", income: 3000, expenses: 2500, refunds: 0, net: 500 },
    ]);

    const result = await getGoalForecasts("user-1", [
      { id: "g1", name: "Old Goal", target_amount: 10000, saved_amount: 5000, target_date: "2020-01-01", color: "#f0f" },
    ]);

    expect(result[0].status).toBe("behind");
    expect(result[0].monthsUntilDeadline).toBe(0);
  });

  it("handles multiple goals", async () => {
    mockGetTrend.mockResolvedValue([
      { month: "2025-01", income: 5000, expenses: 3000, refunds: 0, net: 2000 },
    ]);

    const result = await getGoalForecasts("user-1", [
      { id: "g1", name: "Done", target_amount: 100, saved_amount: 200, target_date: null, color: "#f00" },
      { id: "g2", name: "WIP", target_amount: 10000, saved_amount: 0, target_date: null, color: "#0f0" },
    ]);

    expect(result).toHaveLength(2);
    expect(result[0].status).toBe("completed");
    expect(result[1].status).toBe("on_track");
  });

  it("returns empty array for empty goals", async () => {
    mockGetTrend.mockResolvedValue([]);
    const result = await getGoalForecasts("user-1", []);
    expect(result).toEqual([]);
  });
});
