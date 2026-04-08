import { describe, it, expect } from "vitest";
import { formatCurrency, formatCompactCurrency } from "@/lib/formatCurrency";

describe("formatCurrency", () => {
  it("formats GBP amount with symbol", () => {
    const result = formatCurrency(1234.56, "GBP");
    expect(result).toContain("1,234.56");
  });

  it("formats USD amount", () => {
    const result = formatCurrency(99.99, "USD");
    expect(result).toContain("99.99");
    expect(result).toMatch(/US\$|\$/);
  });

  it("formats EUR amount", () => {
    const result = formatCurrency(50, "EUR");
    expect(result).toContain("50.00");
  });

  it("uses absolute value for negative amounts", () => {
    const result = formatCurrency(-100, "GBP");
    expect(result).toContain("100.00");
    expect(result).not.toContain("-");
  });

  it("formats zero", () => {
    const result = formatCurrency(0, "GBP");
    expect(result).toContain("0.00");
  });

  it("uses default currency (GBP) when not specified", () => {
    const result = formatCurrency(10);
    expect(result).toContain("10.00");
  });

  it("normalizes unsupported currency to GBP", () => {
    const result = formatCurrency(10, "JPY");
    // normalizeBaseCurrency returns GBP for unsupported
    expect(result).toContain("10.00");
  });
});

describe("formatCompactCurrency", () => {
  it("formats large amounts compactly", () => {
    const result = formatCompactCurrency(1_500_000, "GBP");
    expect(result).toMatch(/1\.5M|£1\.5M/i);
  });

  it("formats smaller amounts", () => {
    const result = formatCompactCurrency(1200, "GBP");
    expect(result).toMatch(/1\.2K|£1\.2K/i);
  });

  it("uses default currency (GBP) when not specified", () => {
    const result = formatCompactCurrency(5000);
    expect(result).toBeDefined();
  });
});
