import { redirect } from "next/navigation";
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
import { addAccount, deleteAccount } from "@/db/mutations/accounts";
import { addCategory } from "@/db/mutations/categories";
import {
  continueFromCategories,
  skipOnboarding,
} from "@/db/mutations/onboarding";
import { normalizeBaseCurrency, SUPPORTED_BASE_CURRENCIES } from "@/lib/currency";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { OnboardingSetupStage } from "@/components/OnboardingSetupStage";
import { AccountQuickAdd } from "@/components/AccountQuickAdd";
import { CategorySelector } from "@/components/CategorySelector";
import { WelcomeStep } from "@/components/WelcomeStep";
import { ReviewStep } from "@/components/ReviewStep";
import { AccountMethodStep } from "@/components/AccountMethodStep";
import { TrueLayerImportTrigger } from "@/components/TrueLayerImportTrigger";
import {
  buildOnboardingHref,
  normalizeAccountMethod,
  normalizeOnboardingStage,
  ONBOARDING_STAGE_META,
} from "@/lib/onboarding-flow";

async function addOnboardingCategory(formData: FormData) {
  "use server";
  await addCategory(formData);
}

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{ step?: string; stage?: string; ai?: string; features?: string; method?: string }>;
}) {
  const userId = await getCurrentUserId();
  const resolvedSearchParams = await searchParams;
  const stage = normalizeOnboardingStage(
    resolvedSearchParams?.stage,
    resolvedSearchParams?.step,
  );
  const aiEnabled = resolvedSearchParams?.ai !== "0";

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
  const baseCurrency = normalizeBaseCurrency(onboardingState?.base_currency);

  const accountMethod = normalizeAccountMethod(resolvedSearchParams?.method);

  const selectedFeatures = resolvedSearchParams?.features
    ? resolvedSearchParams.features.split(",").filter(Boolean)
    : [];
  const stageMeta = ONBOARDING_STAGE_META.find((item) => item.value === stage)!;
  const canUseTopSkip = stage !== "basics";
  const skipAction = canUseTopSkip ? (
    <form
      action={async () => {
        "use server";
        await skipOnboarding(aiEnabled);
      }}
    >
      <Button type="submit" variant="ghost" size="sm">
        Skip
      </Button>
    </form>
  ) : undefined;

  return (
    <OnboardingLayout
      currentStage={stage}
      stageTitle={stageMeta.title}
      stageDescription={stageMeta.description}
      skipAction={skipAction}
      canSkip={canUseTopSkip}
    >
      <TrueLayerImportTrigger />

      {stage === "basics" && (
        <WelcomeStep
          baseCurrency={baseCurrency}
          supportedCurrencies={SUPPORTED_BASE_CURRENCIES}
          defaultAiEnabled={aiEnabled}
        />
      )}

      {stage === "account-method" && (
        <AccountMethodStep
          aiEnabled={aiEnabled}
          backHref={buildOnboardingHref("basics", { aiEnabled })}
        />
      )}

      {stage === "setup" && (
        <OnboardingSetupStage
          aiEnabled={aiEnabled}
          accountMethod={accountMethod}
          accountsCount={accounts.length}
          categoriesCount={categories.length}
          initialSelectedFeatures={selectedFeatures}
          backHref={buildOnboardingHref("account-method", { aiEnabled })}
          reviewBaseHref={buildOnboardingHref("review", { aiEnabled, method: accountMethod })}
          accountsSection={(
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
              onDeleteAccount={async (id) => {
                "use server";
                await deleteAccount(id);
              }}
              existingAccounts={accounts}
            />
          )}
          categoriesSection={(
            <div className="space-y-4">
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

              <OnboardingCategoryForm action={addOnboardingCategory} />
            </div>
          )}
        />
      )}

      {stage === "review" && (
        <ReviewStep
          accountsCount={accounts.length}
          categoriesCount={categories.length}
          budgetsCount={budgets.length}
          goalsCount={goals.length}
          debtsCount={debts.length}
          subscriptionsCount={subscriptions.length}
          selectedFeatures={selectedFeatures}
          aiEnabled={aiEnabled}
          backHref={buildOnboardingHref("setup", {
            aiEnabled,
            method: accountMethod,
            features: selectedFeatures,
          })}
        />
      )}
    </OnboardingLayout>
  );
}
