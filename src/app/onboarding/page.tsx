import Link from "next/link";
import { redirect } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { OnboardingCategoryForm } from "@/components/OnboardingCategoryForm";
import { getCurrentUserId } from "@/lib/auth";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getCategoriesByUser } from "@/db/queries/categories";
import { getBudgets } from "@/db/queries/budgets";
import { getGoals } from "@/db/queries/goals";
import { getDebts } from "@/db/queries/debts";
import { getSubscriptions } from "@/db/queries/subscriptions";
import { getBrokerConnections, getManualHoldings } from "@/db/queries/investments";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getDefaultCategoryTemplates, getOnboardingState } from "@/db/queries/onboarding";
import { addAccount } from "@/db/mutations/accounts";
import { addCategory } from "@/db/mutations/categories";
import {
  continueFromCategories,
} from "@/db/mutations/onboarding";
import { normalizeBaseCurrency, SUPPORTED_BASE_CURRENCIES } from "@/lib/currency";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { AccountQuickAdd } from "@/components/AccountQuickAdd";
import { CategorySelector } from "@/components/CategorySelector";
import { FeaturesStep } from "@/components/FeaturesStep";
import { WelcomeStep } from "@/components/WelcomeStep";
import { ReviewStep } from "@/components/ReviewStep";
import { ArrowRight } from "lucide-react";

type Step = "welcome" | "accounts" | "categories" | "features" | "review";

const ALL_STEPS: Step[] = ["welcome", "accounts", "categories", "features", "review"];

const STEP_NAMES: Record<Step, string> = {
  welcome: "Welcome",
  accounts: "Accounts",
  categories: "Categories",
  features: "Features",
  review: "Review",
};

function normalizeStep(value?: string): Step {
  if (ALL_STEPS.includes(value as Step)) return value as Step;
  return "welcome";
}

async function addOnboardingAccount(formData: FormData) {
  "use server";
  await addAccount(formData);
}

async function addOnboardingCategory(formData: FormData) {
  "use server";
  await addCategory(formData);
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; ai?: string; features?: string }>;
}) {
  const userId = await getCurrentUserId();
  const resolvedSearchParams = await searchParams;
  const step = normalizeStep(resolvedSearchParams?.step);
  const aiEnabled = resolvedSearchParams?.ai !== "0";
  const aiParam = !aiEnabled ? "&ai=0" : "";

  const [onboardingState, accounts, categories, budgets, goals, debts, subscriptions, defaultTemplates] =
    await Promise.all([
      getOnboardingState(userId),
      getAccountsWithDetails(userId),
      getCategoriesByUser(userId),
      getBudgets(userId),
      getGoals(userId),
      getDebts(userId),
      getSubscriptions(userId),
      getDefaultCategoryTemplates(),
      getBrokerConnections(userId),
      getManualHoldings(userId),
      getGroupsByUser(userId),
    ]);

  if (onboardingState?.completed) {
    redirect("/dashboard");
  }

  const defaultCategoryPreference = onboardingState?.use_default_categories ?? false;
  const baseCurrency = normalizeBaseCurrency(onboardingState?.base_currency);

  const currentStepIndex = ALL_STEPS.indexOf(step);

  const selectedFeatures = resolvedSearchParams?.features
    ? resolvedSearchParams.features.split(",").filter(Boolean)
    : [];

  const navigateToStep = (targetStep: Step) => {
    return `/onboarding?step=${targetStep}${aiParam}`;
  };

  return (
    <OnboardingLayout
      currentStep={currentStepIndex + 1}
      totalSteps={ALL_STEPS.length}
      stepName={STEP_NAMES[step]}
      skipHref="/dashboard"
      canSkip={step !== "welcome"}
    >
      {/* Welcome Step */}
      {step === "welcome" && (
        <WelcomeStep
          baseCurrency={baseCurrency}
          supportedCurrencies={SUPPORTED_BASE_CURRENCIES}
          defaultAiEnabled={aiEnabled}
        />
      )}

      {/* Accounts Step */}
      {step === "accounts" && (
        <Card>
          <CardHeader>
            <CardTitle>Add your accounts</CardTitle>
            <CardDescription>
              Add the accounts you want to track. You can always add more later.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <form action={addOnboardingAccount} className="hidden">
              <input type="hidden" name="name" id="hidden-name" />
              <input type="hidden" name="type" id="hidden-type" />
              <input type="hidden" name="balance" id="hidden-balance" />
            </form>

            <AccountQuickAdd
              currency={baseCurrency}
              onAddAccount={async (data) => {
                "use server";
                const formData = new FormData();
                formData.set("name", data.name);
                formData.set("type", data.type);
                formData.set("balance", data.balance);
                await addAccount(formData);
              }}
              existingAccounts={accounts}
            />

            <div className="flex gap-2 pt-2">
              <Button asChild>
                <Link href={navigateToStep("categories")}>
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              {accounts.length === 0 && (
                <Button asChild variant="outline">
                  <Link href={navigateToStep("categories")}>
                    Skip for now
                  </Link>
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Categories Step */}
      {step === "categories" && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Set up categories</CardTitle>
              <CardDescription>
                Categories help you organize and track your spending.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <CategorySelector
                templates={defaultTemplates}
                existingCategories={categories}
                onAddDefaults={async () => {
                  "use server";
                  const formData = new FormData();
                  formData.set("use_default_categories", "on");
                  formData.set("intent", "apply");
                  if (!aiEnabled) formData.set("ai_enabled", "0");
                  await continueFromCategories(formData);
                }}
                canAddDefaults={categories.length < defaultTemplates.length}
              />

              <form action={continueFromCategories} className="flex flex-wrap gap-2">
                <input type="hidden" name="use_default_categories" value={defaultCategoryPreference ? "on" : ""} />
                {!aiEnabled && <input type="hidden" name="ai_enabled" value="0" />}
                <Button type="submit" name="intent" value="continue">
                  Continue
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
                {categories.length === 0 && (
                  <Button type="submit" name="intent" value="continue" variant="outline">
                    Skip for now
                  </Button>
                )}
              </form>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Add custom category</CardTitle>
              <CardDescription>
                Create your own categories with custom colors and icons.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <OnboardingCategoryForm action={addOnboardingCategory} />
            </CardContent>
          </Card>
        </div>
      )}

      {/* Features Step */}
      {step === "features" && (
        <FeaturesStep aiEnabled={aiEnabled} />
      )}

      {/* Review Step */}
      {step === "review" && (
        <ReviewStep
          accountsCount={accounts.length}
          categoriesCount={categories.length}
          budgetsCount={budgets.length}
          goalsCount={goals.length}
          debtsCount={debts.length}
          subscriptionsCount={subscriptions.length}
          selectedFeatures={selectedFeatures}
          aiEnabled={aiEnabled}
        />
      )}
    </OnboardingLayout>
  );
}
