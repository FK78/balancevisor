"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import { type AccountMethod, buildOnboardingHref } from "@/lib/onboarding-flow";

interface OnboardingCategoriesStageProps {
  readonly aiEnabled: boolean;
  readonly accountMethod: AccountMethod;
  readonly categoriesSection: ReactNode;
  readonly backHref: string;
}

export function OnboardingCategoriesStage({
  aiEnabled,
  accountMethod,
  categoriesSection,
  backHref,
}: OnboardingCategoriesStageProps) {
  return (
    <div className="space-y-5">
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

      <OnboardingActionBar>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button asChild>
            <Link href={buildOnboardingHref("features", { aiEnabled, method: accountMethod })}>
              Continue to features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </OnboardingActionBar>
    </div>
  );
}
