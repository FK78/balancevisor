import { describe, it, expect } from "vitest";
import { computeMonthlySavingsRates } from "@/lib/savings-rate";

describe("computeMonthlySavingsRates", () => {
  it("computes correct savings rate when income > expenses", () => {
    const result = computeMonthlySavingsRates([
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
    ]);

    expect(result).toHaveLength(1);
    expect(result[0].rate).toBeCloseTo(33.3, 1);
    expect(result[0].net).toBe(1000);
  });

  it("returns 0 rate when income is 0", () => {
    const result = computeMonthlySavingsRates([
      { month: "2025-01", income: 0, expenses: 500, net: -500 },
    ]);

    expect(result[0].rate).toBe(0);
  });

  it("handles negative net (spending > income)", () => {
    const result = computeMonthlySavingsRates([
      { month: "2025-01", income: 1000, expenses: 1500, net: -500 },
    ]);

    expect(result[0].rate).toBeCloseTo(-50, 1);
  });

  it("handles 100% savings rate", () => {
    const result = computeMonthlySavingsRates([
      { month: "2025-01", income: 1000, expenses: 0, net: 1000 },
    ]);

    expect(result[0].rate).toBe(100);
  });

  it("processes multiple months", () => {
    const result = computeMonthlySavingsRates([
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
      { month: "2025-02", income: 3000, expenses: 3000, net: 0 },
      { month: "2025-03", income: 3000, expenses: 1000, net: 2000 },
    ]);

    expect(result).toHaveLength(3);
    expect(result[0].month).toBe("2025-01");
    expect(result[1].rate).toBe(0);
    expect(result[2].rate).toBeCloseTo(66.7, 1);
  });

  it("returns empty array for empty input", () => {
    expect(computeMonthlySavingsRates([])).toEqual([]);
  });
});
