import { describe, expect, it } from "vitest";
import {
  getSetupChecklist,
  normalizeOnboardingStage,
} from "@/lib/onboarding-flow";

describe("normalizeOnboardingStage", () => {
  it("prefers a valid stage query param", () => {
    expect(normalizeOnboardingStage("review")).toBe("review");
  });

  it("maps legacy step values into the new stage model", () => {
    expect(normalizeOnboardingStage(undefined, "welcome")).toBe("basics");
    expect(normalizeOnboardingStage(undefined, "accounts")).toBe("setup");
    expect(normalizeOnboardingStage(undefined, "categories")).toBe("setup");
    expect(normalizeOnboardingStage(undefined, "features")).toBe("setup");
    expect(normalizeOnboardingStage(undefined, "review")).toBe("review");
  });
});

describe("getSetupChecklist", () => {
  it("marks accounts and categories as recommended when core setup is incomplete", () => {
    const checklist = getSetupChecklist({
      accountsCount: 0,
      categoriesCount: 0,
      selectedFeaturesCount: 0,
    });

    expect(checklist.find((item) => item.key === "accounts")?.status).toBe("recommended");
    expect(checklist.find((item) => item.key === "categories")?.status).toBe("recommended");
    expect(checklist.find((item) => item.key === "features")?.status).toBe("optional");
  });

  it("marks all sections as done when the user has completed core setup and chosen features", () => {
    const checklist = getSetupChecklist({
      accountsCount: 2,
      categoriesCount: 8,
      selectedFeaturesCount: 2,
    });

    expect(checklist.every((item) => item.status === "done")).toBe(true);
  });
});
