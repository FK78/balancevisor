// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewFlagCard } from "@/components/ReviewFlagCard";
import type { ReviewFlag } from "@/db/queries/review-flags";

vi.mock("@/db/mutations/review-flags", () => ({
  acceptReviewFlag: vi.fn(async () => {}),
  dismissReviewFlag: vi.fn(async () => {}),
}));

function makeFlag(overrides: Partial<ReviewFlag> = {}): ReviewFlag {
  return {
    id: "flag_1",
    transaction_id: "txn_1",
    flag_type: "subscription_amount_mismatch",
    transactionDescription: "Netflix",
    transactionAmount: 15.99,
    transactionDate: "2026-04-01",
    expected_amount: 12.99,
    actual_amount: 15.99,
    subscriptionName: "Netflix Monthly",
    debtName: null,
    created_at: new Date(),
    ...overrides,
  };
}

describe("ReviewFlagCard", () => {
  it("renders transaction description and flag label", () => {
    render(
      <ReviewFlagCard flag={makeFlag()} currency="GBP" onResolved={() => {}} />,
    );
    expect(screen.getAllByText("Netflix").length).toBeGreaterThanOrEqual(1);
    expect(screen.getByText("Subscription amount differs")).toBeInTheDocument();
  });

  it("renders the before/after visual example", () => {
    render(
      <ReviewFlagCard flag={makeFlag()} currency="GBP" onResolved={() => {}} />,
    );
    expect(screen.getByText("What linking does")).toBeInTheDocument();
    expect(screen.getByText("Before")).toBeInTheDocument();
    expect(screen.getByText("After")).toBeInTheDocument();
  });

  it("shows subscription-specific explanation for subscription flags", () => {
    render(
      <ReviewFlagCard flag={makeFlag()} currency="GBP" onResolved={() => {}} />,
    );
    expect(
      screen.getByText(/updates the subscription's next billing date/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/transaction appears under the linked subscription in reports/i),
    ).toBeInTheDocument();
  });

  it("shows debt-specific explanation for debt flags", () => {
    render(
      <ReviewFlagCard
        flag={makeFlag({
          flag_type: "possible_debt_payment",
          subscriptionName: null,
          debtName: "Car Loan",
        })}
        currency="GBP"
        onResolved={() => {}}
      />,
    );
    expect(
      screen.getByText(/records a debt payment and reduces remaining balance/i),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/transaction appears under the linked debt in reports/i),
    ).toBeInTheDocument();
  });

  it("renders link target name", () => {
    render(
      <ReviewFlagCard flag={makeFlag()} currency="GBP" onResolved={() => {}} />,
    );
    expect(screen.getByText("Netflix Monthly")).toBeInTheDocument();
  });

  it("renders Link transaction and Dismiss buttons", () => {
    render(
      <ReviewFlagCard flag={makeFlag()} currency="GBP" onResolved={() => {}} />,
    );
    expect(screen.getByRole("button", { name: /link transaction/i })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /dismiss/i })).toBeInTheDocument();
  });
});
