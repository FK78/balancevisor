"use client";

import { Sparkles } from "lucide-react";
import { InterestPicker } from "@/components/InterestPicker";

interface FeaturesStepProps {
  aiEnabled: boolean;
  selectedFeatures: string[];
  onChange: (features: string[]) => void;
}

export function FeaturesStep({
  aiEnabled,
  selectedFeatures,
  onChange,
}: FeaturesStepProps) {
  return (
    <div className="space-y-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--workspace-accent)_18%,white)] text-[var(--workspace-shell)]">
          <Sparkles className="h-4 w-4" />
        </div>
        <div className="space-y-1">
          <h3 className="text-lg font-semibold tracking-tight text-foreground">
            What do you want help with next?
          </h3>
          <p className="text-sm text-muted-foreground">
            Pick the areas you care about most. We&apos;ll use them to shape your first destination after onboarding.
          </p>
        </div>
      </div>

      {!aiEnabled && (
        <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,white)] p-4 text-sm text-muted-foreground">
          AI-assisted insights stay off, but you can still choose the areas you want to set up first.
        </div>
      )}

      <InterestPicker
        selectedFeatures={selectedFeatures}
        onChange={onChange}
      />
    </div>
  );
}
