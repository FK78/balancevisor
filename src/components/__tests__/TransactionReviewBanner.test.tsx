// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { TransactionReviewBanner } from "@/components/TransactionReviewBanner";
import type { ReviewFlag } from "@/db/queries/review-flags";

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
    subscriptionName: "Netflix",
    debtName: null,
    created_at: new Date(),
    ...overrides,
  };
}

describe("TransactionReviewBanner", () => {
  it("renders nothing when there are no flags", () => {
    const { container } = render(
      <TransactionReviewBanner flags={[]} currency="GBP" />,
    );
    expect(container.innerHTML).toBe("");
  });

  it("renders a single summary line with correct count", () => {
    render(
      <TransactionReviewBanner
        flags={[makeFlag(), makeFlag({ id: "flag_2" }), makeFlag({ id: "flag_3" })]}
        currency="GBP"
      />,
    );
    expect(screen.getByText("3 transactions to review")).toBeInTheDocument();
    expect(screen.getByText(/may be linked/i)).toBeInTheDocument();
  });

  it("uses singular text for a single flag", () => {
    render(
      <TransactionReviewBanner flags={[makeFlag()]} currency="GBP" />,
    );
    expect(screen.getByText("1 transaction to review")).toBeInTheDocument();
  });

  it("links to the notifications page", () => {
    render(
      <TransactionReviewBanner flags={[makeFlag()]} currency="GBP" />,
    );
    const link = screen.getByRole("link", { name: /review all/i });
    expect(link).toHaveAttribute("href", "/dashboard/notifications");
  });

  it("does not render per-flag rows", () => {
    render(
      <TransactionReviewBanner flags={[makeFlag()]} currency="GBP" />,
    );
    expect(screen.queryByText("Netflix")).not.toBeInTheDocument();
    expect(screen.queryByText("Subscription amount differs")).not.toBeInTheDocument();
  });
});
