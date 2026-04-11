// @vitest-environment happy-dom
import { describe, expect, it } from "vitest";
import { render, screen } from "@testing-library/react";
import { OnboardingAccountsStage } from "@/components/OnboardingAccountsStage";

describe("OnboardingAccountsStage", () => {
  it("renders manual accounts section with navigation links", () => {
    render(
      <OnboardingAccountsStage
        aiEnabled
        accountMethod="manual"
        backHref="/onboarding?stage=account-method"
        accountsSection={<div>Accounts section</div>}
      />,
    );

    expect(screen.getByText("Accounts section")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /back/i })).toHaveAttribute(
      "href",
      "/onboarding?stage=account-method",
    );
    expect(screen.getByRole("link", { name: /continue to categories/i })).toBeInTheDocument();
  });

  it("shows Open Banking card for auto method", () => {
    render(
      <OnboardingAccountsStage
        aiEnabled
        accountMethod="auto"
        backHref="/onboarding?stage=account-method"
        accountsSection={<div>Accounts section</div>}
      />,
    );

    expect(screen.getByText("Connect your bank automatically")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: /connect your bank/i })).toBeInTheDocument();
  });

  it("shows both Open Banking and manual sections for hybrid method", () => {
    render(
      <OnboardingAccountsStage
        aiEnabled={false}
        accountMethod="hybrid"
        backHref="/onboarding?stage=account-method"
        accountsSection={<div>Accounts section</div>}
      />,
    );

    expect(screen.getByText("Connect your bank automatically")).toBeInTheDocument();
    expect(screen.getByText("Accounts section")).toBeInTheDocument();
  });
});
