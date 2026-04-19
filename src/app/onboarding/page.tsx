import { redirect } from "next/navigation";
import { Button } from "@/components/ui/button";
import { getCurrentUserId } from "@/lib/auth";
import { getAccountsWithDetails } from "@/db/queries/accounts";
import { getBrokerConnections, getManualHoldings } from "@/db/queries/investments";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getOnboardingState } from "@/db/queries/onboarding";
import { addAccount, deleteAccount } from "@/db/mutations/accounts";
import { skipOnboarding } from "@/db/mutations/onboarding";
import { normalizeBaseCurrency, SUPPORTED_BASE_CURRENCIES } from "@/lib/currency";
import { OnboardingLayout } from "@/components/OnboardingLayout";
import { OnboardingAccountsStage } from "@/components/OnboardingAccountsStage";
import { OnboardingFeaturesStage } from "@/components/OnboardingFeaturesStage";
import { AccountQuickAdd } from "@/components/AccountQuickAdd";
import { WelcomeStep } from "@/components/WelcomeStep";
import { AccountMethodStep } from "@/components/AccountMethodStep";
import {
  buildOnboardingHref,
  normalizeAccountMethod,
  normalizeOnboardingStage,
  ONBOARDING_STAGE_META,
} from "@/lib/onboarding-flow";

export default async function OnboardingPage({
  searchParams,
}: {
  searchParams?: Promise<{
    step?: string;
    stage?: string;
    ai?: string;
    features?: string;
    method?: string;
  }>;
}) {
  const userId = await getCurrentUserId();
  const resolvedSearchParams = await searchParams;
  const stage = normalizeOnboardingStage(
    resolvedSearchParams?.stage,
    resolvedSearchParams?.step,
  );
  const aiEnabled = resolvedSearchParams?.ai !== "0";

  const [onboardingState, accounts] = await Promise.all([
    getOnboardingState(userId),
    getAccountsWithDetails(userId),
    // These are kept to warm caches for downstream dashboard queries
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

      {stage === "accounts" && (
        <OnboardingAccountsStage
          aiEnabled={aiEnabled}
          accountMethod={accountMethod}
          backHref={buildOnboardingHref("account-method", { aiEnabled })}
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
        />
      )}

      {stage === "features" && (
        <OnboardingFeaturesStage
          aiEnabled={aiEnabled}
          accountMethod={accountMethod}
          initialSelectedFeatures={selectedFeatures}
          backHref={buildOnboardingHref("accounts", {
            aiEnabled,
            method: accountMethod,
          })}
        />
      )}

      {stage === "review" && (
        <ReviewSummary
          accountsCount={accounts.length}
          selectedFeatures={selectedFeatures}
          aiEnabled={aiEnabled}
          backHref={buildOnboardingHref("features", {
            aiEnabled,
            method: accountMethod,
            features: selectedFeatures,
          })}
        />
      )}
    </OnboardingLayout>
  );
}

function ReviewSummary({
  accountsCount,
  selectedFeatures,
  aiEnabled,
  backHref,
}: {
  accountsCount: number;
  selectedFeatures: string[];
  aiEnabled: boolean;
  backHref: string;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <SummaryTile
          label="Accounts"
          value={accountsCount > 0 ? `${accountsCount} added` : "None yet"}
        />
        <SummaryTile
          label="Focus areas"
          value={selectedFeatures.length > 0 ? selectedFeatures.join(", ") : "All"}
        />
        <SummaryTile
          label="AI assistance"
          value={aiEnabled ? "Enabled" : "Disabled"}
        />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <Button variant="ghost" asChild>
          <a href={backHref}>Back</a>
        </Button>
        <form
          action={async () => {
            "use server";
            await skipOnboarding(aiEnabled);
          }}
        >
          <Button type="submit">Go to dashboard</Button>
        </form>
      </div>
    </div>
  );
}

function SummaryTile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_26%,var(--card))] p-4">
      <p className="text-[11px] uppercase tracking-[0.18em] text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  );
}
