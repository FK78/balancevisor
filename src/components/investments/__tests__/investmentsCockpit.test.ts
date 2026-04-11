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

  it("uses the concentration primary action when one holding dominates", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: [
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
          pricePending: false,
        },
      ],
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.primaryAction.key).toBe("review-concentration");
    expect(model.heroTitle).toMatch(/large position/i);
  });

  it("preserves negative realized gains in the priority card title", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: sampleHoldings,
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: -200,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.priorityCards.find((card) => card.id === "realized-gains")?.title).toMatch(
      /^-.*realised$/,
    );
  });

  it("labels the largest holding in the interpretation copy", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: sampleHoldings,
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.accountSections[0]?.groups[0]?.holdings[0]?.interpretation).toBe(
      "Largest position in portfolio",
    );
  });

  it("only marks the true largest holding when duplicate broker ticker ids exist across accounts", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: [
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
      ],
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [],
    });

    expect(model.accountSections[0]?.accountId).toBe("acct-gia");
    expect(model.accountSections[0]?.groups[0]?.holdings[0]?.interpretation).toBe(
      "Largest position in portfolio",
    );
    expect(model.accountSections[1]?.accountId).toBe("acct-isa");
    expect(model.accountSections[1]?.groups[0]?.holdings[0]?.interpretation).toBeNull();
  });

  it("orders grouped and ungrouped sections by portfolio value", () => {
    const model = buildInvestmentsCockpitModel({
      holdings: [
        {
          id: "manual-cash",
          source: "manual" as const,
          ticker: "CASH",
          name: "Cash holding",
          quantity: 1,
          averagePrice: 400,
          currentPrice: 400,
          currency: "GBP",
          value: 400,
          gainLoss: 0,
          gainLossPercent: 0,
          investmentType: "stock" as const,
          accountId: "acct-1",
          accountName: "ISA",
          groupId: null,
          groupName: null,
          groupColor: null,
          pricePending: false,
        },
        {
          id: "manual-index",
          source: "manual" as const,
          ticker: "VGK",
          name: "Vanguard FTSE",
          quantity: 5,
          averagePrice: 100,
          currentPrice: 110,
          currency: "GBP",
          value: 550,
          gainLoss: 50,
          gainLossPercent: 10,
          investmentType: "etf" as const,
          accountId: "acct-2",
          accountName: "GIA",
          groupId: "grp-1",
          groupName: "Index",
          groupColor: "#111111",
          pricePending: false,
        },
        {
          id: "manual-growth",
          source: "manual" as const,
          ticker: "MSFT",
          name: "Microsoft",
          quantity: 3,
          averagePrice: 200,
          currentPrice: 220,
          currency: "GBP",
          value: 660,
          gainLoss: 60,
          gainLossPercent: 10,
          investmentType: "stock" as const,
          accountId: "acct-2",
          accountName: "GIA",
          groupId: null,
          groupName: null,
          groupColor: null,
          pricePending: false,
        },
      ],
      brokerErrors: [],
      brokerCash: 0,
      totalRealizedGain: 0,
      baseCurrency: "GBP",
      allGroups: [
        {
          id: "grp-1",
          name: "Index",
          color: "#111111",
          account_id: "acct-2",
        },
      ],
    });

    expect(model.accountSections.map((section) => section.accountId)).toEqual(["acct-2", "acct-1"]);
    expect(model.accountSections[0]?.groups.map((group) => group.title)).toEqual([
      "Individual holdings",
      "Index",
    ]);
    expect(model.accountSections[1]?.groups.map((group) => group.title)).toEqual([
      "Individual holdings",
    ]);
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
