export type OnboardingStage = "basics" | "setup" | "review";

export const ONBOARDING_STAGE_META: readonly {
  readonly value: OnboardingStage;
  readonly label: string;
  readonly title: string;
  readonly description: string;
}[] = [
  {
    value: "basics",
    label: "Basics",
    title: "Set up your basics",
    description: "Choose your base currency and decide whether AI features should be enabled.",
  },
  {
    value: "setup",
    label: "Money setup",
    title: "Finish your money setup",
    description: "Add the essentials that make your dashboard useful from day one.",
  },
  {
    value: "review",
    label: "Review",
    title: "Review your workspace",
    description: "Check what is ready now and what you can safely finish later.",
  },
] as const;

const LEGACY_STEP_MAP: Record<string, OnboardingStage> = {
  welcome: "basics",
  accounts: "setup",
  categories: "setup",
  features: "setup",
  review: "review",
};

export function normalizeOnboardingStage(
  stage?: string,
  legacyStep?: string,
): OnboardingStage {
  if (ONBOARDING_STAGE_META.some((item) => item.value === stage)) {
    return stage as OnboardingStage;
  }

  if (legacyStep && LEGACY_STEP_MAP[legacyStep]) {
    return LEGACY_STEP_MAP[legacyStep];
  }

  return "basics";
}

export function buildOnboardingHref(
  stage: OnboardingStage,
  options?: {
    readonly aiEnabled?: boolean;
    readonly features?: string[];
  },
) {
  const params = new URLSearchParams({ stage });

  if (options?.features && options.features.length > 0) {
    params.set("features", options.features.join(","));
  }

  if (options?.aiEnabled === false) {
    params.set("ai", "0");
  }

  return `/onboarding?${params.toString()}`;
}

export type SetupChecklistStatus = "done" | "recommended" | "optional";

export function hasCoreOnboardingSetup({
  accountsCount,
  categoriesCount,
}: {
  readonly accountsCount: number;
  readonly categoriesCount: number;
}) {
  return accountsCount > 0 && categoriesCount > 0;
}

export function getSetupChecklist({
  accountsCount,
  categoriesCount,
  selectedFeaturesCount,
}: {
  readonly accountsCount: number;
  readonly categoriesCount: number;
  readonly selectedFeaturesCount: number;
}) {
  return [
    {
      key: "accounts",
      label: "Accounts",
      status: accountsCount > 0 ? "done" : "recommended",
      helper: accountsCount > 0
        ? `${accountsCount} added`
        : "Recommended",
    },
    {
      key: "categories",
      label: "Categories",
      status: categoriesCount > 0 ? "done" : "recommended",
      helper: categoriesCount > 0
        ? `${categoriesCount} ready`
        : "Recommended",
    },
    {
      key: "features",
      label: "Features",
      status: selectedFeaturesCount > 0 ? "done" : "optional",
      helper: selectedFeaturesCount > 0
        ? `${selectedFeaturesCount} selected`
        : "Optional",
    },
  ] satisfies {
    key: "accounts" | "categories" | "features";
    label: string;
    status: SetupChecklistStatus;
    helper: string;
  }[];
}

export function getSetupContinueLabel({
  accountsCount,
  categoriesCount,
}: {
  readonly accountsCount: number;
  readonly categoriesCount: number;
}) {
  return hasCoreOnboardingSetup({ accountsCount, categoriesCount })
    ? "Continue to review"
    : "Continue with setup incomplete";
}
