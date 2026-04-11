// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen, within } from "@testing-library/react";
import { OtherAssetsSection } from "@/components/OtherAssetsSection";

vi.mock("@/components/OtherAssetFormDialog", () => ({
  OtherAssetFormDialog: () => <button type="button">Asset action</button>,
}));

vi.mock("@/components/DeleteOtherAssetButton", () => ({
  DeleteOtherAssetButton: () => <button type="button">Delete asset</button>,
}));

describe("OtherAssetsSection", () => {
  it("frames assets outside broker feeds as portfolio support with value-first cards", () => {
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

    expect(screen.getByRole("heading", { name: "Assets outside broker feeds" })).toBeInTheDocument();
    expect(
      screen.getByText(/keep non-broker wealth in the portfolio story/i),
    ).toBeInTheDocument();
    expect(screen.getByText(/Total value/i)).toHaveTextContent("Total value: £5,200.00");

    const card = screen.getByText("Gold Bar").closest('[data-slot="card"]') as HTMLElement | null;
    expect(card).toBeTruthy();
    if (!card) return;

    const cardContent = within(card);
    const value = cardContent.getByText("£5,200.00");
    const type = cardContent.getByText("Gold", { selector: '[data-slot="badge"]' });
    expect(card.textContent).toContain("Zakat relevant");
    expect(card.textContent).toContain("Review with market prices");
    expect(value.compareDocumentPosition(type) & Node.DOCUMENT_POSITION_FOLLOWING).toBeTruthy();
    expect(cardContent.getByText("Stored in safe deposit")).toBeInTheDocument();
  });
});
