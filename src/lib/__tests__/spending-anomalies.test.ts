import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMonthKey } from "@/lib/date";

// Mock the DB query module
vi.mock("@/db/queries/transactions", () => ({
  getMonthlyCategorySpendTrend: vi.fn(),
}));

import { getMonthlyCategorySpendTrend } from "@/db/queries/transactions";
import { getSpendingAnomalies } from "@/lib/spending-anomalies";

const mockGetTrend = vi.mocked(getMonthlyCategorySpendTrend);

function currentMonth() {
  return getMonthKey(new Date());
}

describe("getSpendingAnomalies", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("detects category with spending >50% above 3-month average", async () => {
    const cm = currentMonth();
    mockGetTrend.mockResolvedValue([
      // Current month: Food at 300
      { month: cm, category: "Food", category_id: "c1", color: "#f00", total: 300 },
      // History: Food at 100 each month -> avg 100
      { month: "2025-01", category: "Food", category_id: "c1", color: "#f00", total: 100 },
      { month: "2025-02", category: "Food", category_id: "c1", color: "#f00", total: 100 },
      { month: "2025-03", category: "Food", category_id: "c1", color: "#f00", total: 100 },
    ]);

    const result = await getSpendingAnomalies("user-1");
    expect(result).toHaveLength(1);
    expect(result[0].category).toBe("Food");
    expect(result[0].pctAbove).toBe(200); // 300 vs avg 100 → 200% above
    expect(result[0].increaseAmount).toBe(200);
  });

  it("skips categories below 50% threshold", async () => {
    const cm = currentMonth();
    mockGetTrend.mockResolvedValue([
      { month: cm, category: "Food", category_id: "c1", color: "#f00", total: 140 },
      { month: "2025-01", category: "Food", category_id: "c1", color: "#f00", total: 100 },
      { month: "2025-02", category: "Food", category_id: "c1", color: "#f00", total: 100 },
      { month: "2025-03", category: "Food", category_id: "c1", color: "#f00", total: 100 },
    ]);

    const result = await getSpendingAnomalies("user-1");
    expect(result).toHaveLength(0);
  });

  it("skips categories with avg spend < 10", async () => {
    const cm = currentMonth();
    mockGetTrend.mockResolvedValue([
      { month: cm, category: "Misc", category_id: "c2", color: "#0f0", total: 50 },
      { month: "2025-01", category: "Misc", category_id: "c2", color: "#0f0", total: 5 },
      { month: "2025-02", category: "Misc", category_id: "c2", color: "#0f0", total: 5 },
    ]);

    const result = await getSpendingAnomalies("user-1");
    expect(result).toHaveLength(0);
  });

  it("skips new categories (no history)", async () => {
    const cm = currentMonth();
    mockGetTrend.mockResolvedValue([
      { month: cm, category: "New Cat", category_id: "c3", color: "#00f", total: 500 },
    ]);

    const result = await getSpendingAnomalies("user-1");
    expect(result).toHaveLength(0);
  });

  it("caps at 5 anomalies, sorted by pctAbove desc", async () => {
    const cm = currentMonth();
    const rows = [];
    for (let i = 1; i <= 7; i++) {
      rows.push({ month: cm, category: `Cat${i}`, category_id: `c${i}`, color: "#000", total: 100 + i * 50 });
      rows.push({ month: "2025-01", category: `Cat${i}`, category_id: `c${i}`, color: "#000", total: 50 });
      rows.push({ month: "2025-02", category: `Cat${i}`, category_id: `c${i}`, color: "#000", total: 50 });
    }
    mockGetTrend.mockResolvedValue(rows);

    const result = await getSpendingAnomalies("user-1");
    expect(result.length).toBeLessThanOrEqual(5);
    // Sorted descending by pctAbove
    for (let i = 1; i < result.length; i++) {
      expect(result[i - 1].pctAbove).toBeGreaterThanOrEqual(result[i].pctAbove);
    }
  });

  it("returns empty array when no data", async () => {
    mockGetTrend.mockResolvedValue([]);
    const result = await getSpendingAnomalies("user-1");
    expect(result).toEqual([]);
  });
});
