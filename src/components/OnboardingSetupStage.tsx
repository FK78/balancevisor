"use client";

import Link from "next/link";
import { type ReactNode, useMemo, useState } from "react";
import { ArrowLeft, ArrowRight, CheckCircle2, ClipboardList } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import { FeaturesStep } from "@/components/FeaturesStep";
import {
  buildOnboardingHref,
  getSetupChecklist,
  getSetupContinueLabel,
  hasCoreOnboardingSetup,
} from "@/lib/onboarding-flow";
import { cn } from "@/lib/utils";

interface OnboardingSetupStageProps {
  readonly aiEnabled: boolean;
  readonly accountsCount: number;
  readonly categoriesCount: number;
  readonly initialSelectedFeatures?: string[];
  readonly accountsSection: ReactNode;
  readonly categoriesSection: ReactNode;
  readonly reviewBaseHref: string;
  readonly backHref?: string;
}

function withFeatures(baseHref: string, features: string[]) {
  const [pathname, rawQuery = ""] = baseHref.split("?");
  const params = new URLSearchParams(rawQuery);

  if (features.length > 0) {
    params.set("features", features.join(","));
  } else {
    params.delete("features");
  }

  const query = params.toString();
  return query ? `${pathname}?${query}` : pathname;
}

export function OnboardingSetupStage({
  aiEnabled,
  accountsCount,
  categoriesCount,
  initialSelectedFeatures = [],
  accountsSection,
  categoriesSection,
  reviewBaseHref,
  backHref,
}: OnboardingSetupStageProps) {
  const [selectedFeatures, setSelectedFeatures] = useState(initialSelectedFeatures);

  const checklist = useMemo(() => getSetupChecklist({
    accountsCount,
    categoriesCount,
    selectedFeaturesCount: selectedFeatures.length,
  }), [accountsCount, categoriesCount, selectedFeatures.length]);
  const coreReady = hasCoreOnboardingSetup({ accountsCount, categoriesCount });
  const continueLabel = getSetupContinueLabel({ accountsCount, categoriesCount });
  const reviewHref = withFeatures(reviewBaseHref, selectedFeatures);

  return (
    <div className="space-y-5">
      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="flex items-start gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))] text-primary">
            <ClipboardList className="h-5 w-5" />
          </div>
          <div className="space-y-1">
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Complete the core pieces first
            </h2>
            <p className="text-sm leading-6 text-muted-foreground">
              Accounts and categories make the biggest difference to your first dashboard. Feature interests are optional.
            </p>
          </div>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {checklist.map((item) => (
            <div
              key={item.key}
              className={cn(
                "rounded-[1.35rem] border p-4 transition-colors",
                item.status === "done"
                  ? "border-[var(--workspace-shell)]/18 bg-[color-mix(in_srgb,var(--workspace-shell)_7%,var(--card))] text-primary"
                  : "border-[var(--workspace-card-border)] bg-background",
              )}
            >
              <div className="flex items-center justify-between gap-3">
                <p className={cn("text-sm font-semibold", item.status === "done" ? "text-current" : "text-foreground")}>{item.label}</p>
                {item.status === "done" ? (
                  <span className="inline-flex items-center gap-1 rounded-full bg-[color-mix(in_srgb,var(--workspace-shell)_12%,var(--card))] px-2.5 py-1 text-[11px] font-medium text-primary">
                    <CheckCircle2 className="h-3.5 w-3.5" />
                    Done
                  </span>
                ) : (
                  <span className="rounded-full bg-[color-mix(in_srgb,var(--workspace-muted-surface)_48%,var(--card))] px-2.5 py-1 text-[11px] font-medium text-muted-foreground">
                    {item.helper}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Accounts
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Add the accounts you want to track first
          </h3>
        </div>
        <div className="mt-5">{accountsSection}</div>
      </section>

      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="space-y-1">
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
            Categories
          </p>
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            Give your spending a structure
          </h3>
        </div>
        <div className="mt-5">{categoriesSection}</div>
      </section>

      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <FeaturesStep
          aiEnabled={aiEnabled}
          selectedFeatures={selectedFeatures}
          onChange={setSelectedFeatures}
        />
      </section>

      <OnboardingActionBar>
        <div className="space-y-3">
          {!coreReady && (
            <p className="text-sm text-muted-foreground">
              You haven&apos;t finished accounts or categories yet. You can still continue, but the dashboard will feel more complete once both are set up.
            </p>
          )}
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <Button asChild variant="outline">
              <Link href={backHref ?? buildOnboardingHref("basics", { aiEnabled })}>
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Link>
            </Button>
            <Button asChild>
              <Link href={reviewHref}>
                {continueLabel}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </OnboardingActionBar>
    </div>
  );
}
