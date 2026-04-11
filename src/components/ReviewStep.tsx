"use client";

import { useTransition } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import {
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  ShieldOff,
  Sparkles,
  TriangleAlert,
} from "lucide-react";
import { completeOnboardingAndRedirectWithFeatures } from "@/db/mutations/onboarding";
import posthog from "posthog-js";
import { hasCoreOnboardingSetup } from "@/lib/onboarding-flow";

interface ReviewStepProps {
  accountsCount: number;
  categoriesCount: number;
  budgetsCount: number;
  goalsCount: number;
  debtsCount: number;
  subscriptionsCount: number;
  selectedFeatures: string[];
  aiEnabled: boolean;
  backHref: string;
}

export function ReviewStep({
  accountsCount,
  categoriesCount,
  budgetsCount,
  goalsCount,
  debtsCount,
  subscriptionsCount,
  selectedFeatures,
  aiEnabled,
  backHref,
}: ReviewStepProps) {
  const [isSubmitting, startTransition] = useTransition();
  const coreSetupReady = hasCoreOnboardingSetup({
    accountsCount,
    categoriesCount,
  });

  return (
    <div className="space-y-5">
      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="space-y-2">
            <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--workspace-accent)_18%,white)] text-[var(--workspace-shell)]">
              {coreSetupReady ? (
                <CheckCircle2 className="h-7 w-7" />
              ) : (
                <TriangleAlert className="h-7 w-7" />
              )}
            </div>
            <div className="space-y-1">
              <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
                {coreSetupReady ? "Your workspace is ready" : "Almost ready to start"}
              </h2>
              <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
                {coreSetupReady
                  ? "You’ve covered the core setup, so the dashboard should feel useful right away."
                  : "You can finish onboarding now, but adding both accounts and categories will make the dashboard much more helpful on day one."}
              </p>
            </div>
          </div>

          <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,white)] px-4 py-3 text-sm">
            <p className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Readiness</p>
            <p className="mt-1 font-semibold text-foreground">
              {coreSetupReady ? "Core setup complete" : "Setup incomplete"}
            </p>
          </div>
        </div>
      </section>

      {!coreSetupReady && (
        <section className="rounded-[1.5rem] border border-amber-300/50 bg-amber-50 px-5 py-4 text-amber-950 shadow-sm dark:border-amber-700/50 dark:bg-amber-950/30 dark:text-amber-100">
          <div className="flex items-start gap-3">
            <TriangleAlert className="mt-0.5 h-5 w-5 shrink-0" />
            <div className="space-y-1">
              <p className="text-sm font-semibold">Core setup still needs attention</p>
              <p className="text-sm leading-6">
                Add at least one account and one category for a smoother first dashboard experience.
              </p>
            </div>
          </div>
        </section>
      )}

      <section className="grid gap-4 lg:grid-cols-[1.3fr_1fr]">
        <div className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
          <div className="space-y-4">
            <div>
              <h3 className="text-lg font-semibold tracking-tight text-foreground">Core setup</h3>
              <p className="text-sm text-muted-foreground">
                These are the pieces that shape your dashboard from day one.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-background p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Accounts</p>
                <p className="mt-2 text-2xl font-semibold">{accountsCount}</p>
              </div>
              <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-background p-4 shadow-sm">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">Categories</p>
                <p className="mt-2 text-2xl font-semibold">{categoriesCount}</p>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-semibold text-foreground">Optional setup</h4>
              <div className="mt-3 grid grid-cols-2 gap-3 sm:grid-cols-4">
                {[
                  ["Budgets", budgetsCount],
                  ["Goals", goalsCount],
                  ["Debts", debtsCount],
                  ["Subscriptions", subscriptionsCount],
                ].map(([label, count]) => (
                  <div
                    key={label}
                    className="rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,white)] p-4 text-center"
                  >
                    <p className="text-lg font-semibold">{count}</p>
                    <p className="text-xs text-muted-foreground">{label}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
            <h3 className="text-lg font-semibold tracking-tight text-foreground">Preferences</h3>
            {aiEnabled ? (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,white)] p-4 text-sm text-muted-foreground">
                <Sparkles className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  AI features are enabled. You can change this anytime from Settings.
                </span>
              </div>
            ) : (
              <div className="mt-4 flex items-start gap-3 rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,white)] p-4 text-sm text-muted-foreground">
                <ShieldOff className="mt-0.5 h-4 w-4 shrink-0" />
                <span>
                  AI features are disabled. You can re-enable them anytime from Settings.
                </span>
              </div>
            )}

            <div className="mt-4 rounded-2xl border border-[var(--workspace-card-border)] bg-background p-4 shadow-sm">
              <p className="text-sm font-semibold text-foreground">Feature focus</p>
              <p className="mt-1 text-sm text-muted-foreground">
                {selectedFeatures.length > 0
                  ? `We’ll point you toward ${selectedFeatures.join(", ")} after onboarding.`
                  : "No optional feature focus selected yet. You can set this up later from the dashboard."}
              </p>
            </div>
          </section>
        </div>
      </section>

      <OnboardingActionBar>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-xs text-muted-foreground">
            {coreSetupReady
              ? "You can still add more setup items later from the dashboard."
              : "You can finish now, but going back to money setup is recommended."}
          </p>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button asChild variant="outline">
              <Link href={backHref}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back to money setup
              </Link>
            </Button>
            <form
              action={() => {
                startTransition(async () => {
                  posthog.capture("onboarding_completed", {
                    accounts_count: accountsCount,
                    categories_count: categoriesCount,
                    budgets_count: budgetsCount,
                    goals_count: goalsCount,
                    debts_count: debtsCount,
                    subscriptions_count: subscriptionsCount,
                    ai_enabled: aiEnabled,
                  });
                  const remainingFeatures = selectedFeatures.slice(1);
                  const firstFeature = selectedFeatures.length > 0 ? selectedFeatures[0] : undefined;
                  await completeOnboardingAndRedirectWithFeatures(
                    remainingFeatures,
                    firstFeature,
                    aiEnabled,
                  );
                });
              }}
            >
              <Button type="submit" disabled={isSubmitting}>
                Go to dashboard
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </form>
          </div>
        </div>
      </OnboardingActionBar>
    </div>
  );
}
