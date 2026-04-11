// @vitest-environment happy-dom
import { describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { WelcomeStep } from "@/components/WelcomeStep";

vi.mock("@/db/mutations/onboarding", () => ({
  setBaseCurrency: vi.fn(),
  skipOnboarding: vi.fn(),
}));

describe("WelcomeStep", () => {
  it("uses readable text inside the reassurance cards", () => {
    render(
      <WelcomeStep
        baseCurrency="GBP"
        supportedCurrencies={["GBP", "USD"]}
        defaultAiEnabled
      />,
    );

    expect(screen.getByText("Five-minute setup")).toHaveClass("text-foreground");
  });
});
