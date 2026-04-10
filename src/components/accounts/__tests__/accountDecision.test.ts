import { describe, expect, it } from "vitest";

import {
  buildAccountCardDecision,
  buildAccountSummaryCards,
  buildVisibleExposureTotal,
} from "@/components/accounts/account-decision";

const sampleAccounts = [
  {
    id: "acc_1",
    accountName: "Main Current",
    type: "currentAccount",
    balance: 2500,
    transactions: 34,
    isShared: false,
  },
  {
    id: "acc_2",
    accountName: "Rainy Day",
    type: "savings",
    balance: 5000,
    transactions: 12,
    isShared: false,
  },
  {
    id: "acc_3",
    accountName: "Everyday Card",
    type: "creditCard",
    balance: -1200,
    transactions: 78,
    isShared: false,
  },
] as const;

describe("account decision helpers", () => {
  it("builds summary cards for net worth, liquid cash, and liabilities", () => {
    const cards = buildAccountSummaryCards(sampleAccounts, "GBP");

    expect(cards.map((card) => card.id)).toEqual([
      "net-worth",
      "liquid-cash",
      "liabilities",
    ]);
    expect(cards[0].title).toContain("£6,300.00");
    expect(cards[1].title).toContain("£7,500.00");
    expect(cards[2].title).toContain("£1,200.00");
  });

  it("builds account-card decision state with status, interpretation, and share label", () => {
    const state = buildAccountCardDecision(
      {
        id: "acc_3",
        accountName: "Everyday Card",
        type: "creditCard",
        balance: -1200,
        transactions: 78,
        isShared: false,
      },
      {
        currency: "GBP",
        totalAbsoluteBalance: 8700,
        shareCount: 2,
      },
    );

    expect(state.statusLabel).toBe("Liability watch");
    expect(state.interpretation).toContain("prioritise paydown");
    expect(state.shareLabel).toBe("Shared with 2 people");
    expect(state.balanceShareLabel).toBe("13.8% of total exposure");
    expect(state.amountTone).toBe("negative");
  });

  it("returns shared visibility label when account is shared with user", () => {
    const state = buildAccountCardDecision(
      {
        id: "acc_9",
        accountName: "Joint Bills",
        type: "currentAccount",
        balance: 900,
        transactions: 25,
        isShared: true,
      },
      {
        currency: "GBP",
        totalAbsoluteBalance: 3000,
      },
    );

    expect(state.shareLabel).toBe("Shared with you");
    expect(state.statusLabel).toBe("Cash ready");
    expect(state.interpretation).toContain("spending buffer");
  });

  it("uses warning emphasis for negative cash accounts", () => {
    const state = buildAccountCardDecision(
      {
        id: "acc_10",
        accountName: "Main Current",
        type: "currentAccount",
        balance: -75,
        transactions: 14,
        isShared: false,
      },
      {
        currency: "GBP",
        totalAbsoluteBalance: 3000,
      },
    );

    expect(state.amountTone).toBe("warning");
    expect(state.statusLabel).toBe("Low cash buffer");
  });

  it("includes the current shared account in exposure total when missing from owned set", () => {
    const exposureTotal = buildVisibleExposureTotal(
      [
        {
          id: "owned_1",
          accountName: "Owned Account",
          type: "currentAccount",
          balance: 300,
        },
      ],
      {
        id: "shared_1",
        accountName: "Shared Account",
        type: "savings",
        balance: 700,
      },
    );

    expect(exposureTotal).toBe(1000);
  });
});
