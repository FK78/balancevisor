import { describe, it, expect, vi, afterEach } from "vitest";
import {
  toDateString,
  getMonthRange,
  getMonthKey,
  getRecentMonthKeys,
  getRecentDayKeys,
  getTomorrowString,
  getNextMonthFirstString,
  formatMonthLabel,
  addDays,
  formatDayLabel,
} from "@/lib/date";

describe("toDateString", () => {
  it("formats date as YYYY-MM-DD", () => {
    expect(toDateString(new Date("2025-03-15T12:00:00Z"))).toBe("2025-03-15");
  });

  it("handles single-digit months and days with zero padding", () => {
    expect(toDateString(new Date("2025-01-05T00:00:00Z"))).toBe("2025-01-05");
  });
});

describe("getMonthRange", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns start before end for current month", () => {
    const { start, end } = getMonthRange(0);
    expect(start).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(end).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(start < end).toBe(true);
  });

  it("returns range for previous months", () => {
    const current = getMonthRange(0);
    const previous = getMonthRange(1);
    expect(previous.end).toBe(current.start);
    expect(previous.start < previous.end).toBe(true);
  });
});

describe("getMonthKey", () => {
  it("returns YYYY-MM format", () => {
    expect(getMonthKey(new Date("2025-01-15"))).toBe("2025-01");
    expect(getMonthKey(new Date("2025-12-01"))).toBe("2025-12");
  });

  it("zero-pads single-digit months", () => {
    expect(getMonthKey(new Date("2025-03-01"))).toBe("2025-03");
  });
});

describe("getRecentMonthKeys", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns correct number of month keys", () => {
    const keys = getRecentMonthKeys(3);
    expect(keys).toHaveLength(3);
  });

  it("returns keys in chronological order", () => {
    const keys = getRecentMonthKeys(3);
    for (let i = 1; i < keys.length; i++) {
      expect(keys[i] > keys[i - 1]).toBe(true);
    }
  });

  it("handles monthCount of 1", () => {
    const keys = getRecentMonthKeys(1);
    expect(keys).toHaveLength(1);
    // should be current month key
    expect(keys[0]).toBe(getMonthKey(new Date()));
  });
});

describe("getRecentDayKeys", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns correct number of day keys", () => {
    const keys = getRecentDayKeys(7);
    expect(keys).toHaveLength(7);
  });

  it("last key is today", () => {
    const keys = getRecentDayKeys(3);
    expect(keys[keys.length - 1]).toBe(toDateString(new Date()));
  });
});

describe("getTomorrowString", () => {
  it("returns a date string after today", () => {
    const tomorrow = getTomorrowString();
    const today = toDateString(new Date());
    expect(tomorrow > today).toBe(true);
  });
});

describe("getNextMonthFirstString", () => {
  it("returns a date string in the future", () => {
    const next = getNextMonthFirstString();
    expect(next).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    // should be at least a few days from now
    const today = toDateString(new Date());
    expect(next >= today).toBe(true);
  });
});

describe("formatMonthLabel", () => {
  it("formats month string as short label", () => {
    const label = formatMonthLabel("2025-06");
    expect(label).toMatch(/Jun/);
    expect(label).toMatch(/25/);
  });
});

describe("addDays", () => {
  it("adds positive days", () => {
    const date = new Date("2025-06-15");
    const result = addDays(date, 5);
    expect(result.getDate()).toBe(20);
  });

  it("does not mutate original date", () => {
    const date = new Date("2025-06-15");
    addDays(date, 5);
    expect(date.getDate()).toBe(15);
  });

  it("handles negative days", () => {
    const date = new Date("2025-06-15");
    const result = addDays(date, -5);
    expect(result.getDate()).toBe(10);
  });

  it("crosses month boundaries", () => {
    const date = new Date("2025-06-30");
    const result = addDays(date, 2);
    expect(result.getMonth()).toBe(6); // July (0-indexed)
    expect(result.getDate()).toBe(2);
  });
});

describe("formatDayLabel", () => {
  it("formats day string as short label", () => {
    const label = formatDayLabel("2025-06-15");
    expect(label).toMatch(/Jun/);
    expect(label).toMatch(/15/);
  });
});
