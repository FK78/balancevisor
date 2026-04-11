// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingSetupStage } from "@/components/OnboardingSetupStage";

describe("OnboardingSetupStage", () => {
  it("shows checklist guidance and incomplete copy when core setup is missing", () => {
    render(
      <OnboardingSetupStage
        aiEnabled
        accountsCount={0}
        categoriesCount={0}
        initialSelectedFeatures={[]}
        accountsSection={<div>Accounts section</div>}
        categoriesSection={<div>Categories section</div>}
        reviewBaseHref="/onboarding?stage=review"
      />,
    );

    expect(screen.getByText("Accounts section")).toBeInTheDocument();
    expect(screen.getByText("Categories section")).toBeInTheDocument();
    expect(screen.getByText("Features")).toBeInTheDocument();
    expect(screen.getAllByText("Recommended").length).toBeGreaterThanOrEqual(2);
    expect(screen.getByText(/you haven't finished accounts or categories yet/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /continue with setup incomplete/i })).toBeInTheDocument();
  });

  it("uses the confident continue copy once core setup is present", () => {
    render(
      <OnboardingSetupStage
        aiEnabled={false}
        accountsCount={2}
        categoriesCount={6}
        initialSelectedFeatures={["budgets"]}
        accountsSection={<div>Accounts section</div>}
        categoriesSection={<div>Categories section</div>}
        reviewBaseHref="/onboarding?stage=review&ai=0"
      />,
    );

    expect(screen.getByRole("link", { name: /continue to review/i })).toHaveAttribute(
      "href",
      "/onboarding?stage=review&ai=0&features=budgets",
    );
  });

  it("keeps completed checklist cards readable on their lighter background", () => {
    render(
      <OnboardingSetupStage
        aiEnabled={false}
        accountsCount={2}
        categoriesCount={6}
        initialSelectedFeatures={["budgets"]}
        accountsSection={<div>Accounts section</div>}
        categoriesSection={<div>Categories section</div>}
        reviewBaseHref="/onboarding?stage=review&ai=0"
      />,
    );

    expect(screen.getAllByText("Accounts")[0].parentElement?.parentElement).toHaveClass("text-primary");
  });
});
