// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { ReviewStep } from "@/components/ReviewStep";

vi.mock("posthog-js", () => ({
  default: {
    capture: vi.fn(),
  },
}));

vi.mock("@/db/mutations/onboarding", () => ({
  completeOnboardingAndRedirectWithFeatures: vi.fn(),
}));

describe("ReviewStep", () => {
  it("shows a warning when core setup is incomplete", () => {
    render(
      <ReviewStep
        accountsCount={0}
        categoriesCount={0}
        budgetsCount={0}
        goalsCount={0}
        debtsCount={0}
        subscriptionsCount={0}
        selectedFeatures={[]}
        aiEnabled
        backHref="/onboarding?stage=setup"
      />,
    );

    expect(screen.getByText(/core setup still needs attention/i)).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back to money setup/i })).toHaveAttribute(
      "href",
      "/onboarding?stage=setup",
    );
  });

  it("shows a ready state when accounts and categories are set up", () => {
    render(
      <ReviewStep
        accountsCount={2}
        categoriesCount={8}
        budgetsCount={1}
        goalsCount={1}
        debtsCount={0}
        subscriptionsCount={0}
        selectedFeatures={["budgets", "goals"]}
        aiEnabled={false}
        backHref="/onboarding?stage=setup&ai=0&features=budgets,goals"
      />,
    );

    expect(screen.getByText(/your workspace is ready/i)).toBeInTheDocument();
    expect(screen.getByText(/ai features are disabled/i)).toBeInTheDocument();
  });
});
