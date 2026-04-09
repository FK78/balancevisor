"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestPicker } from "@/components/InterestPicker";
import { ArrowRight, Info } from "lucide-react";
import { completeOnboardingAndRedirectWithFeatures } from "@/db/mutations/onboarding";

export function FeaturesStep() {
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const remainingFeatures = selectedFeatures.slice(1);
    const firstFeature = selectedFeatures.length > 0 ? selectedFeatures[0] : undefined;
    await completeOnboardingAndRedirectWithFeatures(remainingFeatures, firstFeature);
  };

  const handleSkip = async () => {
    setIsSubmitting(true);
    await completeOnboardingAndRedirectWithFeatures([]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>What would you like to set up?</CardTitle>
        <CardDescription>
          Select the features you want to configure now. You can skip and add them later.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <InterestPicker
          selectedFeatures={selectedFeatures}
          onChange={setSelectedFeatures}
        />

        <div className="flex items-start gap-2.5 rounded-lg border border-border/60 bg-muted/50 p-3 text-xs text-muted-foreground">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0" />
          <span>
            BalanceVisor includes AI-powered features like a financial assistant,
            smart transaction parsing, and spending analysis. You can disable all
            AI features anytime from{" "}
            <strong className="text-foreground">Settings &gt; AI Features</strong>.
          </span>
        </div>

        <div className="flex gap-2">
          <form action={handleSubmit}>
            <Button type="submit" disabled={isSubmitting}>
              {selectedFeatures.length > 0 ? "Set up selected" : "Continue to review"}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
          <form action={handleSkip}>
            <Button type="submit" variant="outline" disabled={isSubmitting}>
              Skip for now
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
