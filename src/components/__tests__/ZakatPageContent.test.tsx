// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { ZakatPageContent } from "@/components/ZakatPageContent";

describe("ZakatPageContent", () => {
  it("keeps the due-now summary ahead of the detailed breakdown", () => {
    render(
      <ZakatPageContent
        heroAside={<div>Due in 12 days</div>}
        actionShelf={<div>Zakat summary cards</div>}
        priorityCards={<div>Zakat priorities</div>}
        detailContent={<div>Zakat breakdown and history</div>}
      />,
    );

    expect(
      screen.getByRole("heading", { name: /know what is due and when to prepare/i }),
    ).toBeInTheDocument();
    expect(screen.getByText("Zakat summary cards")).toBeInTheDocument();
    expect(screen.getByText("Zakat breakdown and history")).toBeInTheDocument();
  });
});
