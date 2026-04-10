// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";

import { TransactionDecisionRow } from "@/components/transactions/TransactionDecisionRow";
import type { Transaction } from "@/components/transactions/TransactionHelpers";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "txn_1",
    accountName: "Main Account",
    account_id: "acc_1",
    type: "expense",
    amount: 45.2,
    category: null,
    category_id: null,
    description: "Tesco",
    date: "2026-04-10",
    is_recurring: false,
    transfer_account_id: null,
    is_split: false,
    refund_for_transaction_id: null,
    category_source: null,
    merchant_name: "Tesco",
    ...overrides,
  };
}

describe("TransactionDecisionRow", () => {
  it("renders decision state details and optional actions", () => {
    render(
      <TransactionDecisionRow
        transaction={makeTransaction()}
        currency="GBP"
        action={<button type="button">Edit</button>}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Tesco" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Needs review")).toBeInTheDocument();
    expect(screen.getByText(/Uncategorised expense/i)).toBeInTheDocument();
    expect(screen.getByText("Main Account")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Edit" })).toBeInTheDocument();
  });
});
