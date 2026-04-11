// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import {
  OnboardingActionBar,
  OnboardingLayout,
} from "@/components/OnboardingLayout";

describe("OnboardingLayout", () => {
  it("renders milestone progress and a sticky mobile action bar", () => {
    render(
      <OnboardingLayout
        currentStage="setup"
        stageTitle="Money setup"
        stageDescription="Finish your core setup before heading to the dashboard."
        skipAction={<button type="button">Skip</button>}
      >
        <div>Stage content</div>
        <OnboardingActionBar>
          <button type="button">Continue</button>
        </OnboardingActionBar>
      </OnboardingLayout>,
    );

    expect(screen.getByText("Basics")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /money setup/i })).toBeInTheDocument();
    expect(screen.getByText("Review")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /skip/i })).toBeInTheDocument();
    expect(screen.getByText("Stage content")).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: /continue/i }).closest("[data-slot='onboarding-action-bar']"),
    ).toHaveAttribute("data-mobile-sticky", "true");
  });

  it("uses readable text for the active light progress pill", () => {
    render(
      <OnboardingLayout
        currentStage="basics"
        stageTitle="Set up your basics"
        stageDescription="Choose your base currency and decide whether AI features should be enabled."
      >
        <div>Stage content</div>
      </OnboardingLayout>,
    );

    const activePill = screen.getAllByText("Basics")[0].closest("[data-state='active']");
    expect(activePill).toBeInTheDocument();
    expect(screen.getAllByText("Basics")[0]).toHaveClass("text-foreground");
  });
});
