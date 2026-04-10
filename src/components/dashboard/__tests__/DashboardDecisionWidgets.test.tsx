// @vitest-environment happy-dom
import { afterEach, describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { DashboardAnomalies } from "@/components/dashboard/DashboardAnomalies";
import { DashboardBudgetProgress } from "@/components/dashboard/DashboardBudgetProgress";
import { DashboardRecentTransactions } from "@/components/dashboard/DashboardRecentTransactions";
import { DashboardRetirement } from "@/components/dashboard/DashboardRetirement";
import { DashboardUpcomingBills } from "@/components/dashboard/DashboardUpcomingBills";
import {
  getAnomalyDecisionSummary,
  getBudgetDecisionSummary,
  getDaysLabel,
  getRetirementTakeaway,
  getUpcomingBillsDecisionSummary,
} from "@/components/dashboard/dashboard-decision";
import type { Subscription } from "@/db/queries/subscriptions";
import type { RetirementProjection } from "@/lib/retirement-calculator";
import type { SpendingAnomaly } from "@/lib/spending-anomalies";
import type { TransactionWithDetails } from "@/lib/types";

function makeTransaction(
  overrides: Partial<TransactionWithDetails> = {},
): TransactionWithDetails {
  return {
    id: "txn_1",
    user_id: "user_1",
    account_id: "acc_1",
    accountName: "Main Account",
    type: "expense",
    amount: 48.2,
    currency: "GBP",
    description: "Tesco",
    date: "2026-04-10",
    category: "Groceries",
    category_id: "cat_1",
    merchant_name: "Tesco",
    notes: null,
    is_recurring: false,
    transfer_account_id: null,
    is_split: false,
    refund_for_transaction_id: null,
    category_source: "manual",
    created_at: "2026-04-10T10:00:00.000Z",
    updated_at: "2026-04-10T10:00:00.000Z",
    ...overrides,
  } as TransactionWithDetails;
}

function makeBudget(
  overrides: Partial<{
    id: string;
    budgetCategory: string;
    budgetAmount: number;
    budgetSpent: number;
  }> = {},
) {
  return {
    id: "budget_1",
    budgetCategory: "Groceries",
    budgetAmount: 500,
    budgetSpent: 250,
    ...overrides,
  };
}

function makeAnomaly(overrides: Partial<SpendingAnomaly> = {}): SpendingAnomaly {
  return {
    category: "Dining",
    color: "#ef4444",
    currentSpend: 260,
    avgSpend: 140,
    pctAbove: 86,
    increaseAmount: 120,
    ...overrides,
  };
}

function makeRenewal(overrides: Partial<Subscription> = {}): Subscription {
  return {
    id: "sub_1",
    name: "Netflix",
    amount: 18.99,
    currency: "GBP",
    billing_cycle: "monthly",
    next_billing_date: "2026-04-11",
    category_id: null,
    account_id: "acc_1",
    categoryName: null,
    categoryColor: null,
    url: null,
    notes: null,
    is_active: true,
    color: "#ef4444",
    icon: null,
    created_at: new Date("2026-04-01T00:00:00.000Z"),
    ...overrides,
  };
}

function makeProjection(
  overrides: Partial<RetirementProjection> = {},
): RetirementProjection {
  return {
    estimatedRetirementAge: 64,
    yearsToRetirement: 19,
    targetRetirementAge: 65,
    canRetireOnTarget: true,
    requiredFundAtTarget: 620000,
    projectedFundAtTarget: 655000,
    fundGap: -35000,
    fundProgress: 100,
    currentNetWorth: 180000,
    annualSavings: 24000,
    monthlySavings: 2000,
    savingsRate: 28,
    yearlyProjection: [],
    scenarios: [],
    ...overrides,
  };
}

describe("dashboard-decision helpers", () => {
  it("summarises at-risk budgets with the highest risk signal first", () => {
    expect(
      getBudgetDecisionSummary({
        budgetsAtRisk: [
          makeBudget({
            budgetCategory: "Travel",
            budgetAmount: 300,
            budgetSpent: 360,
          }),
          makeBudget({
            budgetCategory: "Dining",
            budgetAmount: 200,
            budgetSpent: 170,
          }),
        ],
        currency: "GBP",
      }),
    ).toEqual({
      title: "2 budgets need attention",
      summary: "Travel is over by £60.00. Dining is at 85% of budget.",
      actionLabel: "Review budget limits",
    });
  });

  it("turns anomaly data into review-oriented copy", () => {
    expect(
      getAnomalyDecisionSummary({
        anomalies: [
          makeAnomaly(),
          makeAnomaly({
            category: "Travel",
            color: "#3b82f6",
            currentSpend: 340,
            avgSpend: 170,
            pctAbove: 100,
            increaseAmount: 170,
          }),
        ],
        currency: "GBP",
      }),
    ).toEqual({
      title: "2 spending warnings to review",
      summary:
        "Travel is £170.00 above usual spend this month. Dining is £120.00 above usual.",
      actionLabel: "Review unusual spend",
    });
  });

  it("summarises bill exposure around the nearest due date", () => {
    expect(
      getUpcomingBillsDecisionSummary({
        renewals: [
          makeRenewal(),
          makeRenewal({
            id: "sub_2",
            name: "Rent",
            amount: 950,
            next_billing_date: "2026-04-10",
          }),
        ],
        currency: "GBP",
        now: new Date("2026-04-10T09:00:00.000Z"),
      }),
    ).toEqual({
      title: "£968.99 due across 2 bills",
      summary: "Rent is due today and Netflix follows tomorrow.",
      actionLabel: "Review upcoming bills",
    });
  });

  it("labels overdue bills as overdue in helper copy", () => {
    expect(getDaysLabel(-2)).toBe("2 days overdue");

    expect(
      getUpcomingBillsDecisionSummary({
        renewals: [
          makeRenewal({
            id: "sub_overdue",
            name: "Internet",
            amount: 45,
            next_billing_date: "2026-04-08",
          }),
        ],
        currency: "GBP",
        now: new Date("2026-04-10T09:00:00.000Z"),
      }),
    ).toEqual({
      title: "£45.00 due across 1 bill",
      summary:
        "Internet is 2 days overdue. Make sure enough cash is available before it lands.",
      actionLabel: "Review upcoming bills",
    });
  });

  it("turns retirement projections into a plain-language takeaway", () => {
    expect(getRetirementTakeaway(makeProjection(), "GBP")).toBe(
      "On track for age 64, about 1 year ahead of your target.",
    );

    expect(
      getRetirementTakeaway(
        makeProjection({
          estimatedRetirementAge: 69,
          yearsToRetirement: 24,
          targetRetirementAge: 65,
          canRetireOnTarget: false,
          fundGap: 110000,
        }),
        "GBP",
      ),
    ).toBe(
      "Off track by about 4 years. Closing a £110K gap would get you back toward target.",
    );
  });
});

describe("Dashboard decision widgets", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("renders recent transactions as a compact watch list using decision rows", () => {
    render(
      <DashboardRecentTransactions
        currency="GBP"
        transactions={[
          makeTransaction({
            id: "txn_1",
            description: "Tesco",
            category: null,
            category_id: null,
          }),
          makeTransaction({
            id: "txn_2",
            description: "Savings transfer",
            type: "transfer",
            amount: 300,
            category: null,
            category_id: null,
          }),
        ]}
      />,
    );

    expect(screen.getByText("Transaction Watchlist")).toBeInTheDocument();
    expect(
      screen.getByText("Recent items that may need your attention first."),
    ).toBeInTheDocument();
    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.getByText("Transfer")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Open transactions" })).toHaveAttribute(
      "href",
      "/dashboard/transactions",
    );
  });

  it("leads budget progress with at-risk copy and sorts risky budgets first", () => {
    render(
      <DashboardBudgetProgress
        currency="GBP"
        budgets={[
          makeBudget({
            id: "budget_safe",
            budgetCategory: "Utilities",
            budgetAmount: 400,
            budgetSpent: 120,
          }),
          makeBudget({
            id: "budget_warn",
            budgetCategory: "Dining",
            budgetAmount: 200,
            budgetSpent: 170,
          }),
          makeBudget({
            id: "budget_over",
            budgetCategory: "Travel",
            budgetAmount: 300,
            budgetSpent: 360,
          }),
        ]}
        budgetsAtRisk={[
          makeBudget({
            id: "budget_warn",
            budgetCategory: "Dining",
            budgetAmount: 200,
            budgetSpent: 170,
          }),
          makeBudget({
            id: "budget_over",
            budgetCategory: "Travel",
            budgetAmount: 300,
            budgetSpent: 360,
          }),
        ]}
      />,
    );

    expect(screen.getByText("2 budgets need attention")).toBeInTheDocument();
    expect(
      screen.getByText("Travel is over by £60.00. Dining is at 85% of budget."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review budget limits" })).toHaveAttribute(
      "href",
      "/dashboard/budgets",
    );

    const budgetRows = screen.getAllByTestId("budget-progress-row");
    expect(within(budgetRows[0]).getByText("Travel")).toBeInTheDocument();
    expect(within(budgetRows[1]).getByText("Dining")).toBeInTheDocument();
    expect(within(budgetRows[2]).getByText("Utilities")).toBeInTheDocument();
  });

  it("does not mark a 79.5% budget as warning just because display copy rounds up", () => {
    render(
      <DashboardBudgetProgress
        currency="GBP"
        budgets={[
          makeBudget({
            id: "budget_borderline",
            budgetCategory: "Groceries",
            budgetAmount: 200,
            budgetSpent: 159,
          }),
        ]}
        budgetsAtRisk={[]}
      />,
    );

    expect(screen.getByText("Budgets are tracking to plan")).toBeInTheDocument();
    expect(
      screen.getByText("No categories are close to their spending limit right now."),
    ).toBeInTheDocument();

    const amountLabel = screen.getByText("£159.00 / £200.00");
    expect(amountLabel.className).toContain("text-muted-foreground");
    expect(amountLabel.className).not.toContain("text-amber-600");
  });

  it("turns anomalies into review-oriented warnings", () => {
    render(
      <DashboardAnomalies
        currency="GBP"
        anomalies={[
          makeAnomaly({
            category: "Streaming",
            color: "#22c55e",
            currentSpend: 90,
            avgSpend: 30,
            pctAbove: 200,
            increaseAmount: 60,
          }),
          makeAnomaly({
            category: "Travel",
            color: "#3b82f6",
            currentSpend: 340,
            avgSpend: 170,
            pctAbove: 100,
            increaseAmount: 170,
          }),
          makeAnomaly(),
        ]}
      />,
    );

    expect(screen.getByText("3 spending warnings to review")).toBeInTheDocument();
    expect(
      screen.getByText(
        "Travel is £170.00 above usual spend this month. Dining is £120.00 above usual.",
      ),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review unusual spend" })).toHaveAttribute(
      "href",
      "/dashboard/categories",
    );
    expect(screen.getAllByText("Review now")).toHaveLength(3);

    const anomalyRows = screen.getAllByTestId("anomaly-row");
    expect(within(anomalyRows[0]).getByText("Travel")).toBeInTheDocument();
  });

  it("highlights upcoming bills with exposure and urgency first", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T09:00:00.000Z"));

    render(
      <DashboardUpcomingBills
        currency="GBP"
        renewals={[
          makeRenewal({
            id: "sub_2",
            name: "Rent",
            amount: 950,
            next_billing_date: "2026-04-10",
          }),
          makeRenewal(),
        ]}
      />,
    );

    expect(screen.getByText("£968.99 due across 2 bills")).toBeInTheDocument();
    expect(
      screen.getByText("Rent is due today and Netflix follows tomorrow."),
    ).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Review upcoming bills" })).toHaveAttribute(
      "href",
      "/dashboard/subscriptions",
    );
    expect(screen.getByText("Due today")).toBeInTheDocument();
    expect(screen.getByText("Tomorrow")).toBeInTheDocument();
  });

  it("shows overdue renewals as overdue in the widget", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-04-10T09:00:00.000Z"));

    render(
      <DashboardUpcomingBills
        currency="GBP"
        renewals={[
          makeRenewal({
            id: "sub_overdue",
            name: "Internet",
            amount: 45,
            next_billing_date: "2026-04-08",
          }),
          makeRenewal(),
        ]}
      />,
    );

    expect(
      screen.getByText("Internet is 2 days overdue and Netflix follows tomorrow."),
    ).toBeInTheDocument();
    expect(screen.getByText("2 days overdue")).toBeInTheDocument();
  });

  it("adds a plain-language retirement takeaway before detailed figures", () => {
    render(
      <DashboardRetirement projection={makeProjection()} hasProfile baseCurrency="GBP" />,
    );

    expect(
      screen.getByText("On track for age 64, about 1 year ahead of your target."),
    ).toBeInTheDocument();
    expect(screen.getByText("Target age 65")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "See retirement plan" })).toHaveAttribute(
      "href",
      "/dashboard/retirement",
    );
  });
});
