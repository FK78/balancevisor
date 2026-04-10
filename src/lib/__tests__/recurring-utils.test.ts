import { describe, it, expect } from "vitest";
import {
  computeNextRecurringDate,
  inferRecurringPattern,
  isAmountConsistent,
  normaliseForDedup,
  MIN_RECURRING_OCCURRENCES,
  RECURRING_AMOUNT_TOLERANCE,
  VALID_RECURRING_PATTERNS,
  type RecurringPattern,
} from "@/lib/recurring-utils";

// ---------------------------------------------------------------------------
// computeNextRecurringDate
// ---------------------------------------------------------------------------

describe("computeNextRecurringDate", () => {
  it("advances daily by 1 day", () => {
    expect(computeNextRecurringDate("2025-06-15", "daily")).toBe("2025-06-16");
  });

  it("advances weekly by 7 days", () => {
    expect(computeNextRecurringDate("2025-06-15", "weekly")).toBe("2025-06-22");
  });

  it("advances biweekly by 14 days", () => {
    expect(computeNextRecurringDate("2025-06-15", "biweekly")).toBe("2025-06-29");
  });

  it("advances monthly by 1 month", () => {
    expect(computeNextRecurringDate("2025-06-15", "monthly")).toBe("2025-07-15");
  });

  it("advances yearly by 1 year", () => {
    expect(computeNextRecurringDate("2025-06-15", "yearly")).toBe("2026-06-15");
  });

  it("crosses month boundary for weekly", () => {
    expect(computeNextRecurringDate("2025-06-28", "weekly")).toBe("2025-07-05");
  });

  it("handles month-end rollover for monthly (Jan 31 overflows Feb)", () => {
    const result = computeNextRecurringDate("2025-01-31", "monthly");
    // JS Date.setUTCMonth rolls Jan 31 + 1 month → Feb 31 → Mar 3
    expect(result).toBe("2025-03-03");
  });

  it("crosses year boundary for monthly (Dec → Jan)", () => {
    expect(computeNextRecurringDate("2025-12-15", "monthly")).toBe("2026-01-15");
  });

  it("handles leap year for yearly", () => {
    expect(computeNextRecurringDate("2024-02-29", "yearly")).toBe("2025-03-01");
  });
});

// ---------------------------------------------------------------------------
// inferRecurringPattern
// ---------------------------------------------------------------------------

describe("inferRecurringPattern", () => {
  it("returns null for daily-range intervals (< 5 days)", () => {
    expect(inferRecurringPattern(1)).toBeNull();
    expect(inferRecurringPattern(4)).toBeNull();
  });

  it("returns 'weekly' for 5–9 day intervals", () => {
    expect(inferRecurringPattern(5)).toBe("weekly");
    expect(inferRecurringPattern(7)).toBe("weekly");
    expect(inferRecurringPattern(9)).toBe("weekly");
  });

  it("returns null for gap between weekly and biweekly (10–11 days)", () => {
    expect(inferRecurringPattern(10)).toBeNull();
    expect(inferRecurringPattern(11)).toBeNull();
  });

  it("returns 'biweekly' for 12–18 day intervals", () => {
    expect(inferRecurringPattern(12)).toBe("biweekly");
    expect(inferRecurringPattern(14)).toBe("biweekly");
    expect(inferRecurringPattern(18)).toBe("biweekly");
  });

  it("returns null for gap between biweekly and monthly (19–24 days)", () => {
    expect(inferRecurringPattern(20)).toBeNull();
    expect(inferRecurringPattern(24)).toBeNull();
  });

  it("returns 'monthly' for 25–35 day intervals", () => {
    expect(inferRecurringPattern(25)).toBe("monthly");
    expect(inferRecurringPattern(30)).toBe("monthly");
    expect(inferRecurringPattern(35)).toBe("monthly");
  });

  it("returns null for gap between monthly and yearly", () => {
    expect(inferRecurringPattern(60)).toBeNull();
    expect(inferRecurringPattern(200)).toBeNull();
    expect(inferRecurringPattern(339)).toBeNull();
  });

  it("returns 'yearly' for 340–395 day intervals", () => {
    expect(inferRecurringPattern(340)).toBe("yearly");
    expect(inferRecurringPattern(365)).toBe("yearly");
    expect(inferRecurringPattern(395)).toBe("yearly");
  });

  it("returns null for intervals beyond yearly range", () => {
    expect(inferRecurringPattern(396)).toBeNull();
    expect(inferRecurringPattern(700)).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// isAmountConsistent
// ---------------------------------------------------------------------------

describe("isAmountConsistent", () => {
  it("returns false for empty array", () => {
    expect(isAmountConsistent([])).toBe(false);
  });

  it("returns true for single amount", () => {
    expect(isAmountConsistent([10])).toBe(true);
  });

  it("returns true for identical amounts", () => {
    expect(isAmountConsistent([9.99, 9.99, 9.99])).toBe(true);
  });

  it("returns true for amounts within ±15% tolerance", () => {
    // median = 10, tolerance = ±1.5 → range [8.5, 11.5]
    expect(isAmountConsistent([9, 10, 11])).toBe(true);
  });

  it("returns false for amounts outside ±15% tolerance", () => {
    // median = 10, 5 is 50% off
    expect(isAmountConsistent([5, 10, 10])).toBe(false);
  });

  it("returns true for all zeros", () => {
    expect(isAmountConsistent([0, 0, 0])).toBe(true);
  });

  it("returns false when median is 0 but other values are non-zero", () => {
    expect(isAmountConsistent([0, 0, 5])).toBe(false);
  });

  it("handles typical subscription amounts (small variance)", () => {
    // Netflix: £15.99 every month
    expect(isAmountConsistent([15.99, 15.99, 15.99, 15.99])).toBe(true);
  });

  it("rejects wildly varying Amazon orders", () => {
    expect(isAmountConsistent([5.99, 49.99, 120.0])).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// normaliseForDedup
// ---------------------------------------------------------------------------

describe("normaliseForDedup", () => {
  it("lowercases and strips non-alphanumeric", () => {
    expect(normaliseForDedup("NETFLIX.COM")).toBe("netflixcom");
  });

  it("collapses whitespace", () => {
    expect(normaliseForDedup("  hello   world  ")).toBe("hello world");
  });

  it("strips special characters", () => {
    expect(normaliseForDedup("Amazon *Prime - UK")).toBe("amazon prime uk");
  });

  it("returns empty string for empty input", () => {
    expect(normaliseForDedup("")).toBe("");
  });
});

// ---------------------------------------------------------------------------
// Constants
// ---------------------------------------------------------------------------

describe("constants", () => {
  it("MIN_RECURRING_OCCURRENCES is 3", () => {
    expect(MIN_RECURRING_OCCURRENCES).toBe(3);
  });

  it("RECURRING_AMOUNT_TOLERANCE is 0.15", () => {
    expect(RECURRING_AMOUNT_TOLERANCE).toBe(0.15);
  });

  it("VALID_RECURRING_PATTERNS contains all 5 patterns", () => {
    expect(VALID_RECURRING_PATTERNS).toEqual(["daily", "weekly", "biweekly", "monthly", "yearly"]);
  });
});

// ---------------------------------------------------------------------------
// toMonthlyEquivalent (exported from queries/recurring.ts)
// ---------------------------------------------------------------------------

describe("toMonthlyEquivalent", async () => {
  const { toMonthlyEquivalent } = await import("@/db/queries/recurring");

  it("daily → amount × 30", () => {
    expect(toMonthlyEquivalent(10, "daily")).toBeCloseTo(300);
  });

  it("weekly → amount × 52/12", () => {
    expect(toMonthlyEquivalent(10, "weekly")).toBeCloseTo(10 * (52 / 12));
  });

  it("biweekly → amount × 26/12", () => {
    expect(toMonthlyEquivalent(10, "biweekly")).toBeCloseTo(10 * (26 / 12));
  });

  it("monthly → amount unchanged", () => {
    expect(toMonthlyEquivalent(10, "monthly")).toBe(10);
  });

  it("yearly → amount / 12", () => {
    expect(toMonthlyEquivalent(120, "yearly")).toBeCloseTo(10);
  });

  it("null pattern → amount unchanged", () => {
    expect(toMonthlyEquivalent(10, null)).toBe(10);
  });
});
