export type OnboardingStage = "basics" | "account-method" | "accounts" | "categories" | "features" | "review";

export type AccountMethod = "auto" | "manual" | "hybrid";

export function normalizeAccountMethod(raw?: string): AccountMethod {
  if (raw === "auto" || raw === "manual" || raw === "hybrid") return raw;
  return "manual";
}

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
    value: "account-method",
    label: "Accounts",
    title: "How do you want to add accounts?",
    description: "Choose between automatic Open Banking, manual entry, or a mix of both.",
  },
  {
    value: "accounts",
    label: "Accounts",
    title: "Add your accounts",
    description: "Connect your bank or add accounts manually so your dashboard has real data.",
  },
  {
    value: "categories",
    label: "Categories",
    title: "Set up your categories",
    description: "Give your spending a structure so transactions are organised from day one.",
  },
  {
    value: "features",
    label: "Features",
    title: "Pick your focus areas",
    description: "Choose the areas you care about most to shape your first dashboard experience.",
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
  "account-method": "account-method",
  accounts: "accounts",
  categories: "categories",
  features: "features",
  setup: "accounts",
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
    readonly method?: AccountMethod;
  },
) {
  const params = new URLSearchParams({ stage });

  if (options?.features && options.features.length > 0) {
    params.set("features", options.features.join(","));
  }

  if (options?.aiEnabled === false) {
    params.set("ai", "0");
  }

  if (options?.method) {
    params.set("method", options.method);
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
