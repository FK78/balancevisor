"use client";

import { useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { ArrowRight, ArrowLeft, Sparkles, ShieldOff } from "lucide-react";
import { completeOnboardingAndRedirectWithFeatures } from "@/db/mutations/onboarding";
import { ONBOARDING_FEATURE_IDS } from "@/components/InterestPicker";

interface ReviewStepProps {
  accountsCount: number;
  categoriesCount: number;
  budgetsCount: number;
  goalsCount: number;
  debtsCount: number;
  subscriptionsCount: number;
  selectedFeatures: string[];
  aiEnabled: boolean;
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
}: ReviewStepProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleComplete = async () => {
    setIsSubmitting(true);
    const remainingFeatures = selectedFeatures.slice(1);
    const firstFeature = selectedFeatures.length > 0 ? selectedFeatures[0] : undefined;
    const disabledFeatures = ONBOARDING_FEATURE_IDS.filter(
      (id) => !selectedFeatures.includes(id),
    );
    await completeOnboardingAndRedirectWithFeatures(
      remainingFeatures,
      firstFeature,
      disabledFeatures,
      aiEnabled,
    );
  };

  const backParams = new URLSearchParams({ step: "features" });
  if (!aiEnabled) backParams.set("ai", "0");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{"You're all set!"}</CardTitle>
        <CardDescription>
          {"Here's a summary of what you've set up."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold">{accountsCount}</p>
            <p className="text-muted-foreground text-xs">Accounts</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold">{categoriesCount}</p>
            <p className="text-muted-foreground text-xs">Categories</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold">{budgetsCount}</p>
            <p className="text-muted-foreground text-xs">Budgets</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold">{goalsCount}</p>
            <p className="text-muted-foreground text-xs">Goals</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold">{debtsCount}</p>
            <p className="text-muted-foreground text-xs">Debts</p>
          </div>
          <div className="rounded-lg border p-3 text-center">
            <p className="text-2xl font-semibold">{subscriptionsCount}</p>
            <p className="text-muted-foreground text-xs">Subscriptions</p>
          </div>
        </div>

        {!aiEnabled && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/50 p-3 text-xs text-muted-foreground">
            <ShieldOff className="h-3.5 w-3.5 shrink-0" />
            <span>
              AI features will be <strong className="text-foreground">disabled</strong>.
              You can re-enable them anytime from Settings.
            </span>
          </div>
        )}

        {aiEnabled && (
          <div className="flex items-center gap-2.5 rounded-lg border border-border/60 bg-muted/50 p-3 text-xs text-muted-foreground">
            <Sparkles className="h-3.5 w-3.5 shrink-0" />
            <span>
              AI features are <strong className="text-foreground">enabled</strong>.
              You can change this anytime from Settings.
            </span>
          </div>
        )}

        <p className="text-muted-foreground text-sm text-center">
          You can always add more from the dashboard.
        </p>

        <div className="flex flex-col gap-2 sm:flex-row">
          <form action={handleComplete} className="flex-1">
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              Go to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <Button asChild variant="outline" className="sm:w-auto">
            <Link href={`/onboarding?${backParams.toString()}`}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
