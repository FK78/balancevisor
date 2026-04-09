"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { InterestPicker } from "@/components/InterestPicker";
import { ArrowRight } from "lucide-react";

interface FeaturesStepProps {
  aiEnabled: boolean;
}

export function FeaturesStep({ aiEnabled }: FeaturesStepProps) {
  const router = useRouter();
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([]);

  const buildReviewUrl = (features: string[]) => {
    const params = new URLSearchParams({ step: "review" });
    if (features.length > 0) params.set("features", features.join(","));
    if (!aiEnabled) params.set("ai", "0");
    return `/onboarding?${params.toString()}`;
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

        <div className="flex gap-2">
          <Button onClick={() => router.push(buildReviewUrl(selectedFeatures))}>
            {selectedFeatures.length > 0 ? "Set up selected" : "Continue to review"}
            <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
          <Button variant="outline" onClick={() => router.push(buildReviewUrl([]))}>
            Skip for now
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
