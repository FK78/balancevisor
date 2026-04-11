// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen, within } from "@testing-library/react";

import { HoldingsRoster } from "@/components/investments/HoldingsRoster";

const sections = [
  {
    accountId: "acct-isa",
    accountName: "Stocks and Shares ISA",
    groups: [
      {
        id: null,
        title: "Individual holdings",
        holdings: [
          {
            id: "holding-msft",
            ticker: "MSFT",
            name: "Microsoft",
            quantity: 4,
            value: 1320,
            interpretation: "Largest position in portfolio",
            contextLabel: "Stock",
            gainLossLabel: "+£120.00 (+10.00%)",
          },
        ],
      },
      {
        id: "group-dividends",
        title: "Dividend basket",
        holdings: [
          {
            id: "holding-unilever",
            ticker: "ULVR",
            name: "Unilever",
            quantity: 12,
            value: 510,
            interpretation: null,
            contextLabel: "Stock",
            gainLossLabel: "-£24.00 (-4.50%)",
          },
        ],
      },
    ],
  },
];

describe("HoldingsRoster", () => {
  it("renders mobile decision cards and a desktop comparison table for the same holdings", () => {
    render(<HoldingsRoster accountSections={sections} currency="GBP" />);

    expect(
      screen.getByRole("heading", { name: "Stocks and Shares ISA" }),
    ).toBeInTheDocument();
    const mobileRoster = screen.getByTestId("holdings-roster-mobile");
    expect(within(mobileRoster).getByText("Largest position in portfolio")).toBeInTheDocument();
    expect(within(mobileRoster).getByText("Dividend basket")).toBeInTheDocument();
    expect(within(mobileRoster).getByRole("heading", { name: "Microsoft" })).toBeInTheDocument();
    expect(within(mobileRoster).getByText("MSFT")).toBeInTheDocument();
    expect(within(mobileRoster).getByText("4 shares")).toBeInTheDocument();
    expect(within(mobileRoster).getByText("\u00a31,320.00")).toBeInTheDocument();

    const desktopTables = screen.getAllByRole("table", { name: "Holdings comparison" });
    expect(desktopTables).toHaveLength(2);
    const desktopTable = desktopTables[0];
    expect(within(desktopTable).getByRole("columnheader", { name: "Holding" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("columnheader", { name: "Context" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("columnheader", { name: "Value" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("columnheader", { name: "Gain / Loss" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("cell", { name: "Microsoft MSFT" })).toBeInTheDocument();
    expect(within(desktopTable).getByText("Largest position in portfolio")).toBeInTheDocument();
    expect(within(desktopTable).getByText("+£120.00 (+10.00%)")).toBeInTheDocument();
  });

  it("keeps grouped and ungrouped holdings in separate sections without empty ungrouped mobile groups", () => {
    render(
      <HoldingsRoster
        currency="GBP"
        accountSections={[
          {
            accountId: "acct-gia",
            accountName: "General Investment Account",
            groups: [
              {
                id: null,
                title: "Individual holdings",
                holdings: [],
              },
              {
                id: "group-core",
                title: "Core ETF",
                holdings: [
                  {
                    id: "holding-vwrl",
                    ticker: "VWRL",
                    name: "Vanguard FTSE All-World",
                    quantity: 8,
                    value: 910,
                    interpretation: null,
                    contextLabel: "ETF",
                    gainLossLabel: "+£80.00 (+9.60%)",
                  },
                ],
              },
              {
                id: "group-satellite",
                title: "Satellite picks",
                holdings: [
                  {
                    id: "holding-nvda",
                    ticker: "NVDA",
                    name: "NVIDIA",
                    quantity: 2,
                    value: 640,
                    interpretation: "Largest position in portfolio",
                    contextLabel: "Stock",
                    gainLossLabel: "+£110.00 (+20.75%)",
                  },
                ],
              },
            ],
          },
        ]}
      />,
    );

    const mobileRoster = screen.getByTestId("holdings-roster-mobile");
    expect(within(mobileRoster).queryByText("Individual holdings")).not.toBeInTheDocument();
    expect(within(mobileRoster).getByText("Core ETF")).toBeInTheDocument();
    expect(within(mobileRoster).getByText("Satellite picks")).toBeInTheDocument();

    const desktopTables = screen.getAllByRole("table", { name: "Holdings comparison" });
    expect(desktopTables).toHaveLength(2);
    expect(screen.getAllByText("Core ETF")).toHaveLength(2);
    expect(screen.getAllByText("Satellite picks")).toHaveLength(2);
  });
});
