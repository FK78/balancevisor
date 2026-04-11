// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { OtherAssetsSection } from "@/components/OtherAssetsSection";

vi.mock("@/components/OtherAssetFormDialog", () => ({
  OtherAssetFormDialog: () => <button type="button">Asset action</button>,
}));

vi.mock("@/components/DeleteOtherAssetButton", () => ({
  DeleteOtherAssetButton: () => <button type="button">Delete asset</button>,
}));

describe("OtherAssetsSection", () => {
  it("shows a zero total when assets exist but sum to zero", () => {
    render(
      <OtherAssetsSection
        baseCurrency="GBP"
        assets={[
          {
            id: "oa-1",
            name: "Dormant Holding",
            asset_type: "other",
            value: 0,
            weight_grams: null,
            is_zakatable: false,
            notes: null,
          },
        ]}
      />,
    );

    expect(screen.getByRole("heading", { name: "Assets outside broker feeds" })).toBeInTheDocument();
    expect(screen.getByText(/keep non-broker wealth in the portfolio story/i)).toBeInTheDocument();
    expect(screen.getByText(/Total value:\s*£0\.00/i)).toBeInTheDocument();

    const amount = screen.getByText("£0.00");
    const name = screen.getByText("Dormant Holding");
    expect(amount.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
  });

  it("frames the empty state as a useful portfolio extension", () => {
    render(<OtherAssetsSection baseCurrency="GBP" assets={[]} />);

    expect(screen.getByRole("heading", { name: "Assets outside broker feeds" })).toBeInTheDocument();
    expect(screen.getByText(/extend your portfolio view beyond broker feeds/i)).toBeInTheDocument();
    expect(screen.getByText("No assets outside broker feeds yet")).toBeInTheDocument();
    expect(screen.getByText(/add property, gold, pensions/i)).toBeInTheDocument();
  });

  it("keeps the card value visually ahead of the asset name", () => {
    render(
      <OtherAssetsSection
        baseCurrency="GBP"
        assets={[
          {
            id: "oa-1",
            name: "Gold Bar",
            asset_type: "gold",
            value: 5200,
            weight_grams: 100,
            is_zakatable: true,
            notes: "Stored in safe deposit",
          },
        ]}
      />,
    );

    const amount = screen.getByText("£5,200.00");
    const name = screen.getByText("Gold Bar");
    const type = screen.getByText("Gold", { exact: true });
    expect(amount.compareDocumentPosition(name) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(amount.compareDocumentPosition(type) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(screen.getByText("Zakat relevant")).toBeInTheDocument();
    expect(screen.getByText("Review with market prices")).toBeInTheDocument();
  });
});
