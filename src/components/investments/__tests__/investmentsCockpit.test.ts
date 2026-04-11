import { describe, expect, it } from "vitest";

import { buildInvestmentsCockpitModel } from "@/components/investments/investments-cockpit";

const sampleHoldings = [
  {
    id: "manual-apple",
    source: "manual" as const,
    ticker: "AAPL",
    name: "Apple",
    quantity: 10,
    averagePrice: 120,
    currentPrice: 180,
    currency: "GBP",
    value: 1800,
    gainLoss: 600,
    gainLossPercent: 50,
    investmentType: "stock" as const,
    accountId: "acct-1",
    accountName: "ISA",
    groupId: null,
    groupName: null,
    groupColor: null,
    pricePending: false,
  },
  {
    id: "manual-tsla",
    source: "manual" as const,
    ticker: "TSLA",
    name: "Tesla",
    quantity: 2,
    averagePrice: 200,
    currentPrice: 160,
    currency: "GBP",
    value: 320,
    gainLoss: -80,
    gainLossPercent: -20,
    investmentType: "stock" as const,
    accountId: "acct-1",
    accountName: "ISA",
    groupId: null,
    groupName: null,
    groupColor: null,
    pricePending: true,
  },
];

describe("buildInvestmentsCockpitModel", () => {
  it("prioritises broker recovery over every other primary action", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: sampleHoldings,
      brokerErrors: [{ broker: "Trading 212", message: "Token expired" }],
      brokerCash: 0,
      totalRealizedGain: 200,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.primaryAction.key).toBe("reconnect-broker");
    expect(model.heroTitle).toMatch(/broker connection needs attention/i);
    expect(model.priorityCards[0].id).toBe("broker-health");
  });

  it("prefers stale price interpretation over largest position when both apply", () => {
    const overlappingHoldings = [
      {
        ...sampleHoldings[0],
        pricePending: true,
      },
      sampleHoldings[1],
    ];

    const model = buildInvestmentsCockpitModel({
      holdings: overlappingHoldings,
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.accountSections[0]?.groups[0]?.title).toBe("Individual holdings");
    expect(model.accountSections[0]?.groups[0]?.holdings[0]?.interpretation).toBe(
      "Manual price needs refreshing",
    );
  });

  it("keeps empty portfolios inside the calm balance hero state", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: [],
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.heroTitle).toBe("Portfolio balance looks calm");
    expect(model.heroTitle).not.toMatch(/start your investment cockpit/i);
    expect(model.heroDescription).toBe(
      "The portfolio is stable for now, so keep the next action lightweight and easy to return to.",
    );
  });
});
