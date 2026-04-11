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

  it("creates an explicit ungrouped section and holding interpretation copy", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: sampleHoldings,
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.accountSections[0]?.groups[0]?.title).toBe("Individual holdings");
    expect(model.accountSections[0]?.groups[0]?.holdings[0]?.interpretation).toMatch(
      /largest position/i,
    );
    expect(model.accountSections[0]?.groups[0]?.holdings[1]?.interpretation).toMatch(
      /price needs refreshing/i,
    );
  });
});
