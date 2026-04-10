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
});
