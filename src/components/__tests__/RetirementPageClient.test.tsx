// @vitest-environment happy-dom
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { RetirementPageClient } from "@/components/RetirementPageClient";

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

vi.mock("@/db/mutations/retirement", () => ({
  upsertRetirementProfile: vi.fn(),
}));

vi.mock("@/components/RetirementAIAdvisor", () => ({
  RetirementAIAdvisor: () => <div>Retirement advisor stub</div>,
}));

vi.mock("recharts", () => ({
  Area: () => null,
  AreaChart: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  CartesianGrid: () => null,
  ReferenceLine: () => null,
  XAxis: () => null,
  YAxis: () => null,
}));

vi.mock("@/components/ui/chart", () => ({
  ChartContainer: ({ children }: { children: ReactNode }) => <div>{children}</div>,
  ChartTooltip: () => null,
  ChartTooltipContent: () => null,
}));

describe("RetirementPageClient", () => {
  it("keeps the inline setup form footer non-sticky", () => {
    render(
      <RetirementPageClient
        profile={null}
        projection={null}
        baseCurrency="USD"
        suggestions={{
          estimatedAnnualSalary: 0,
          suggestedAnnualSpending: 0,
          suggestedMonthlySavings: 0,
          avgMonthlyIncome: 0,
          avgMonthlyExpenses: 0,
          hasEnoughData: false,
        }}
      />,
    );

    expect(
      screen.getByRole("button", { name: /get started/i }).closest("[data-slot='dialog-footer']"),
    ).not.toHaveAttribute("data-mobile-sticky");
  });

  it("shows a cockpit hero and next-step framing for the planner view", () => {
    render(
      <RetirementPageClient
        profile={{
          user_id: "user_1",
          current_age: 35,
          target_retirement_age: 60,
          desired_annual_spending: 32000,
          expected_pension_annual: 12000,
          expected_investment_return: 5,
          inflation_rate: 2.5,
          life_expectancy: 90,
          updated_at: new Date("2026-04-10T00:00:00Z"),
        }}
        projection={{
          estimatedRetirementAge: 61,
          yearsToRetirement: 26,
          canRetireOnTarget: false,
          targetRetirementAge: 60,
          fundProgress: 78,
          projectedFundAtTarget: 550000,
          requiredFundAtTarget: 700000,
          fundGap: 150000,
          currentNetWorth: 120000,
          monthlySavings: 850,
          annualSavings: 10200,
          savingsRate: 18,
          yearlyProjection: [],
          scenarios: [],
        }}
        baseCurrency="USD"
        suggestions={{
          estimatedAnnualSalary: 72000,
          suggestedAnnualSpending: 32000,
          suggestedMonthlySavings: 850,
          avgMonthlyIncome: 6000,
          avgMonthlyExpenses: 4300,
          hasEnoughData: true,
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /make retirement feel concrete, not distant/i }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: /see the next planning move first/i }),
    ).toBeInTheDocument();
  });
});
