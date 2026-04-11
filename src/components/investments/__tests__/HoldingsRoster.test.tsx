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

    const desktopTable = screen.getByRole("table", { name: "Holdings comparison" });
    expect(within(desktopTable).getByRole("columnheader", { name: "Holding" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("columnheader", { name: "Context" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("columnheader", { name: "Value" })).toBeInTheDocument();
    expect(within(desktopTable).getByRole("cell", { name: "Microsoft MSFT" })).toBeInTheDocument();
    expect(within(desktopTable).getByText("Largest position in portfolio")).toBeInTheDocument();
  });
});
