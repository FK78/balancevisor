"use client";

import { Sparkles } from "lucide-react";
import { Switch } from "@/components/ui/switch";
import { FEATURE_DEFINITIONS, type FeatureId } from "@/lib/features";

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
        <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))] text-primary">
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
        <div className="rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,var(--card))] p-4 text-sm text-muted-foreground">
          AI-assisted insights stay off, but you can still choose the areas you want to set up first.
        </div>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {FEATURE_DEFINITIONS.map((feature) => {
          const checked = selectedFeatures.includes(feature.id);
          const Icon = feature.icon;
          return (
            <label
              key={feature.id}
              className="flex cursor-pointer items-start gap-3 rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_26%,var(--card))] p-4 transition-colors hover:border-primary/40"
            >
              <Switch
                checked={checked}
                onCheckedChange={(isOn: boolean) => {
                  const nextList = isOn
                    ? Array.from(new Set([...selectedFeatures, feature.id as FeatureId]))
                    : selectedFeatures.filter((f) => f !== feature.id);
                  onChange(nextList);
                }}
                className="mt-1"
              />
              <div className="flex flex-col gap-1">
                <span className="inline-flex items-center gap-2 text-sm font-medium text-foreground">
                  <Icon className="h-4 w-4 text-primary" />
                  {feature.label}
                </span>
                <span className="text-xs text-muted-foreground">
                  {feature.description}
                </span>
              </div>
            </label>
          );
        })}
      </div>
    </div>
  );
}
