import { describe, it, expect } from "vitest";
import {
  SUPPORTED_BASE_CURRENCIES,
  DEFAULT_BASE_CURRENCY,
  normalizeBaseCurrency,
} from "@/lib/currency";

describe("normalizeBaseCurrency", () => {
  it("returns GBP as default", () => {
    expect(DEFAULT_BASE_CURRENCY).toBe("GBP");
  });

  it("returns the currency when it is supported", () => {
    for (const cur of SUPPORTED_BASE_CURRENCIES) {
      expect(normalizeBaseCurrency(cur)).toBe(cur);
    }
  });

  it("is case-insensitive", () => {
    expect(normalizeBaseCurrency("usd")).toBe("USD");
    expect(normalizeBaseCurrency("eur")).toBe("EUR");
    expect(normalizeBaseCurrency("gbp")).toBe("GBP");
  });

  it("returns default for unsupported currency", () => {
    expect(normalizeBaseCurrency("JPY")).toBe("GBP");
    expect(normalizeBaseCurrency("CHF")).toBe("GBP");
  });

  it("returns default for null/undefined/empty", () => {
    expect(normalizeBaseCurrency(null)).toBe("GBP");
    expect(normalizeBaseCurrency(undefined)).toBe("GBP");
    expect(normalizeBaseCurrency("")).toBe("GBP");
  });
});
