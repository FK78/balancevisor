// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";

describe("SecondaryPageIntro", () => {
  it("renders the hero, action shelf, optional support panel, and priority stack", () => {
    render(
      <SecondaryPageIntro
        heroEyebrow="Budgets"
        heroTitle="Keep your category limits ahead of the month"
        heroDescription="The page should lead with the current budget story, then make the next action obvious."
        heroAction={<button type="button">Review budgets</button>}
        actionShelfEyebrow="Next step"
        actionShelfTitle="Adjust the few categories that matter most"
        actionShelfDescription="Stats and actions stay together so the page feels guided instead of scattered."
        actionShelfContent={<div>Budget stats</div>}
        supportPanel={{
          eyebrow: "Suggestions",
          title: "Smart nudges stay nearby",
          description: "Advice can stay visible without competing with the main action flow.",
          content: <div>Suggestion banner</div>,
        }}
        priorities={{
          eyebrow: "Priority stack",
          title: "See what needs attention first",
          description: "The page should summarise the main budget risks before the deeper tools begin.",
          items: [
            {
              id: "at-risk",
              title: "2 budgets are at risk",
              description: "Food and transport are the two categories most likely to need changes this month.",
            },
            {
              id: "remaining",
              title: "Plenty of headroom remains",
              description: "Most categories still have comfortable room left.",
            },
          ],
        }}
      />,
    );

    expect(
      screen.getByRole("heading", { name: "Keep your category limits ahead of the month" }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "Adjust the few categories that matter most" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Suggestion banner")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { name: "See what needs attention first" }),
    ).toBeInTheDocument();
    expect(screen.getByText("2 budgets are at risk")).toBeInTheDocument();
  });
});
