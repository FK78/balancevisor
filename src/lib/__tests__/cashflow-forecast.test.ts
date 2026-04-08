import { describe, it, expect, vi, beforeEach } from "vitest";
import { getMonthKey } from "@/lib/date";

// Mock all DB dependencies
vi.mock("@/db/queries/transactions", () => ({
  getMonthlyIncomeExpenseTrend: vi.fn(),
}));

vi.mock("@/db/queries/recurring", () => ({
  getRecurringTransactions: vi.fn(),
  toMonthlyEquivalent: vi.fn((amount: number, pattern: string) => {
    if (pattern === "monthly") return amount;
    if (pattern === "weekly") return amount * 4.33;
    if (pattern === "yearly") return amount / 12;
    return amount;
  }),
}));

vi.mock("@/db/queries/subscriptions", () => ({
  getActiveSubscriptionsTotals: vi.fn(),
}));

vi.mock("@/db/queries/onboarding", () => ({
  getUserBaseCurrency: vi.fn(),
}));

import { getMonthlyIncomeExpenseTrend } from "@/db/queries/transactions";
import { getRecurringTransactions } from "@/db/queries/recurring";
import { getActiveSubscriptionsTotals } from "@/db/queries/subscriptions";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getCashflowForecast } from "@/lib/cashflow-forecast";

const mockTrend = vi.mocked(getMonthlyIncomeExpenseTrend);
const mockRecurring = vi.mocked(getRecurringTransactions);
const mockSubs = vi.mocked(getActiveSubscriptionsTotals);
const mockCurrency = vi.mocked(getUserBaseCurrency);

describe("getCashflowForecast", () => {
  beforeEach(() => {
    vi.clearAllMocks();

    mockCurrency.mockResolvedValue("GBP");
    mockSubs.mockResolvedValue({ monthly: 50, yearly: 600, count: 3 });
    mockRecurring.mockResolvedValue([]);
  });

  it("returns forecast with correct shape", async () => {
    const cm = getMonthKey(new Date());
    mockTrend.mockResolvedValue([
      { month: cm, income: 1000, expenses: 800, net: 200 },
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
      { month: "2025-02", income: 3200, expenses: 2200, net: 1000 },
      { month: "2025-03", income: 2800, expenses: 1800, net: 1000 },
    ]);

    const result = await getCashflowForecast("user-1");

    expect(result.baseCurrency).toBe("GBP");
    expect(result.isCurrentMonth).toBe(true);
    expect(result.periodLabel).toBeTruthy();
    expect(result.daysRemaining).toBeGreaterThanOrEqual(0);
    expect(result.daysInMonth).toBeGreaterThan(0);
    expect(typeof result.projectedIncome).toBe("number");
    expect(typeof result.projectedExpenses).toBe("number");
    expect(typeof result.projectedNet).toBe("number");
    expect(result.actualIncome).toBe(1000);
    expect(result.actualExpenses).toBe(800);
  });

  it("returns 'low' confidence with no completed months", async () => {
    const cm = getMonthKey(new Date());
    mockTrend.mockResolvedValue([
      { month: cm, income: 500, expenses: 300, net: 200 },
    ]);

    const result = await getCashflowForecast("user-1");
    expect(result.confidence).toBe("low");
  });

  it("returns 'medium' confidence with 1-2 completed months", async () => {
    const cm = getMonthKey(new Date());
    mockTrend.mockResolvedValue([
      { month: cm, income: 500, expenses: 300, net: 200 },
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
    ]);

    const result = await getCashflowForecast("user-1");
    expect(result.confidence).toBe("medium");
  });

  it("returns 'high' confidence with 3+ completed months", async () => {
    const cm = getMonthKey(new Date());
    mockTrend.mockResolvedValue([
      { month: cm, income: 500, expenses: 300, net: 200 },
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
      { month: "2025-02", income: 3000, expenses: 2000, net: 1000 },
      { month: "2025-03", income: 3000, expenses: 2000, net: 1000 },
    ]);

    const result = await getCashflowForecast("user-1");
    expect(result.confidence).toBe("high");
  });

  it("includes subscription cost in breakdown", async () => {
    const cm = getMonthKey(new Date());
    mockTrend.mockResolvedValue([
      { month: cm, income: 1000, expenses: 800, net: 200 },
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
    ]);
    mockSubs.mockResolvedValue({ monthly: 120, yearly: 1440, count: 5 });

    const result = await getCashflowForecast("user-1");
    const subItem = result.breakdown.find((b) => b.label.includes("Subscriptions"));
    expect(subItem).toBeDefined();
    expect(subItem!.amount).toBe(120);
  });

  it("includes recurring transactions in breakdown", async () => {
    const cm = getMonthKey(new Date());
    mockTrend.mockResolvedValue([
      { month: cm, income: 1000, expenses: 800, net: 200 },
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
    ]);
    mockRecurring.mockResolvedValue([
      { description: "Salary", type: "income", amount: 3000, recurring_pattern: "monthly" },
      { description: "Rent", type: "expense", amount: 1200, recurring_pattern: "monthly" },
    ] as never);

    const result = await getCashflowForecast("user-1");
    expect(result.recurringIncome).toBe(3000);
    expect(result.recurringExpenses).toBe(1200);
  });

  it("handles no current month data gracefully", async () => {
    mockTrend.mockResolvedValue([
      { month: "2025-01", income: 3000, expenses: 2000, net: 1000 },
    ]);

    const result = await getCashflowForecast("user-1");
    expect(result.actualIncome).toBe(0);
    expect(result.actualExpenses).toBe(0);
  });
});
