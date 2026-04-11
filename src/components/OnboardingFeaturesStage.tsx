"use client";

import Link from "next/link";
import { useState } from "react";
import { ArrowLeft, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import { FeaturesStep } from "@/components/FeaturesStep";
import { type AccountMethod, buildOnboardingHref } from "@/lib/onboarding-flow";

interface OnboardingFeaturesStageProps {
  readonly aiEnabled: boolean;
  readonly accountMethod: AccountMethod;
  readonly initialSelectedFeatures?: string[];
  readonly backHref: string;
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

export function OnboardingFeaturesStage({
  aiEnabled,
  accountMethod,
  initialSelectedFeatures = [],
  backHref,
}: OnboardingFeaturesStageProps) {
  const [selectedFeatures, setSelectedFeatures] = useState(initialSelectedFeatures);

  const reviewBaseHref = buildOnboardingHref("review", { aiEnabled, method: accountMethod });
  const reviewHref = withFeatures(reviewBaseHref, selectedFeatures);

  return (
    <div className="space-y-5">
      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <FeaturesStep
          aiEnabled={aiEnabled}
          selectedFeatures={selectedFeatures}
          onChange={setSelectedFeatures}
        />
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
            <Link href={reviewHref}>
              Continue to review
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </OnboardingActionBar>
    </div>
  );
}
