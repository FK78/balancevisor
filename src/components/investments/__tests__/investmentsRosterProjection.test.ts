import { describe, expect, it } from "vitest";

import { buildInvestmentsCockpitModel } from "@/components/investments/investments-cockpit";
import { buildInvestmentsRosterSections } from "@/components/investments/investments-roster";

describe("buildInvestmentsRosterSections", () => {
  it("keeps same-broker same-ticker holdings in the correct account rows", () => {
    const holdings = [
      {
        id: "trading212-AAPL",
        source: "trading212" as const,
        ticker: "AAPL",
        name: "Apple",
        quantity: 2,
        averagePrice: 100,
        currentPrice: 140,
        currency: "GBP",
        value: 280,
        gainLoss: 80,
        gainLossPercent: 40,
        investmentType: "stock" as const,
        accountId: "acct-isa",
        accountName: "ISA",
        groupId: null,
        groupName: null,
        groupColor: null,
        pricePending: false,
      },
      {
        id: "trading212-AAPL",
        source: "trading212" as const,
        ticker: "AAPL",
        name: "Apple",
        quantity: 6,
        averagePrice: 90,
        currentPrice: 130,
        currency: "GBP",
        value: 780,
        gainLoss: 240,
        gainLossPercent: 44.44,
        investmentType: "stock" as const,
        accountId: "acct-gia",
        accountName: "GIA",
        groupId: null,
        groupName: null,
        groupColor: null,
        pricePending: false,
      },
    ];

    const model = buildInvestmentsCockpitModel({
      holdings,
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    const rosterSections = buildInvestmentsRosterSections({
      accountSections: model.accountSections,
      holdings,
      allGroups: [],
      investmentAccounts: [],
      groupOptions: [],
      baseCurrency: "GBP",
      getInvestmentTypeLabel: (investmentType) => investmentType.toUpperCase(),
      getGainTone: (holding) => (holding.gainLoss >= 0 ? "positive" : "negative"),
    });

    expect(rosterSections.map((section) => section.accountId)).toEqual(["acct-gia", "acct-isa"]);
    expect(rosterSections[0]?.groups[0]?.holdings[0]).toMatchObject({
      quantity: 6,
      value: 780,
      gainLossLabel: "+£240.00 (+44.44%)",
    });
    expect(rosterSections[1]?.groups[0]?.holdings[0]).toMatchObject({
      quantity: 2,
      value: 280,
      gainLossLabel: "+£80.00 (+40.00%)",
    });
  });
});
