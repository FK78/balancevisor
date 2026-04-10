import { describe, expect, it, vi } from "vitest";

import { buildTransactionDecisionState } from "@/components/transactions/transaction-decision";
import type { Transaction } from "@/components/transactions/TransactionHelpers";

function makeTransaction(overrides: Partial<Transaction> = {}): Transaction {
  return {
    id: "txn_1",
    accountName: "Main Account",
    account_id: "acc_1",
    type: "expense",
    amount: 45.2,
    category: "Groceries",
    category_id: "cat_1",
    description: "Tesco",
    date: "2026-04-10",
    is_recurring: false,
    transfer_account_id: null,
    is_split: false,
    refund_for_transaction_id: null,
    category_source: "manual",
    merchant_name: "Tesco",
    ...overrides,
  };
}

describe("buildTransactionDecisionState", () => {
  it("marks uncategorised expenses as review items", () => {
    const state = buildTransactionDecisionState(
      makeTransaction({ category: null, category_id: null }),
      "GBP",
    );

    expect(state.amountTone).toBe("warning");
    expect(state.statusLabel).toBe("Needs review");
    expect(state.interpretation).toContain("Uncategorised expense");
    expect(state.meta).toContain("Uncategorised");
  });

  it("marks transfers with neutral semantics", () => {
    const state = buildTransactionDecisionState(
      makeTransaction({ type: "transfer", amount: 100, category: null, category_id: null }),
      "GBP",
    );

    expect(state.amountTone).toBe("neutral");
    expect(state.statusLabel).toBe("Transfer");
    expect(state.amountLabel).toContain("⇄");
  });

  it("marks split transactions with split interpretation", () => {
    const state = buildTransactionDecisionState(
      makeTransaction({ is_split: true }),
      "GBP",
    );

    expect(state.statusLabel).toBe("Split transaction");
    expect(state.interpretation).toContain("split");
  });

  it("keeps regular categorised transactions as standard spending", () => {
    const state = buildTransactionDecisionState(
      makeTransaction(),
      "GBP",
    );

    expect(state.amountTone).toBe("negative");
    expect(state.statusLabel).toBeUndefined();
    expect(state.interpretation).toBeUndefined();
    expect(state.amountLabel).toContain("−");
  });

  it("keeps date-only values on the intended calendar day across timezones", async () => {
    const previousTz = process.env.TZ;

    try {
      process.env.TZ = "America/Los_Angeles";
      vi.resetModules();
      const { buildTransactionDecisionState: buildStateInUsTz } = await import(
        "@/components/transactions/transaction-decision"
      );

      const state = buildStateInUsTz(
        makeTransaction({ date: "2026-04-10" }),
        "GBP",
      );

      expect(state.meta).toContain("10 Apr 2026");
    } finally {
      process.env.TZ = previousTz;
      vi.resetModules();
    }
  });
});
