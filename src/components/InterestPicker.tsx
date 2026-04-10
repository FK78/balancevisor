"use client";

import { useState } from "react";
import { cn } from "@/lib/utils";
import {
  Target,
  Trophy,
  CreditCard,
  Repeat,
  TrendingUp,
  Check,
} from "lucide-react";

interface FeatureOption {
  id: string;
  label: string;
  description: string;
  icon: React.ElementType;
}

export const ONBOARDING_FEATURE_IDS = ["budgets", "goals", "debts", "subscriptions", "investments"] as const;

const FEATURE_OPTIONS: FeatureOption[] = [
  {
    id: "budgets",
    label: "Budgets",
    description: "Track spending limits per category",
    icon: Target,
  },
  {
    id: "goals",
    label: "Savings Goals",
    description: "Set targets and track progress",
    icon: Trophy,
  },
  {
    id: "debts",
    label: "Debts",
    description: "Monitor loans and payoff progress",
    icon: CreditCard,
  },
  {
    id: "subscriptions",
    label: "Subscriptions",
    description: "Track recurring payments like Netflix",
    icon: Repeat,
  },
  {
    id: "investments",
    label: "Investments",
    description: "Connect Trading 212 or add holdings",
    icon: TrendingUp,
  },
];

interface InterestPickerProps {
  defaultSelected?: string[];
  selectedFeatures?: string[];
  onChange?: (features: string[]) => void;
}

export function InterestPicker({ defaultSelected = [], selectedFeatures: controlledFeatures, onChange }: InterestPickerProps) {
  const [internalFeatures, setInternalFeatures] = useState<string[]>(defaultSelected);
  
  const isControlled = controlledFeatures !== undefined && onChange !== undefined;
  const features = isControlled ? controlledFeatures : internalFeatures;
  
  const setFeatures = (newFeatures: string[]) => {
    if (isControlled) {
      onChange(newFeatures);
    } else {
      setInternalFeatures(newFeatures);
    }
  };

  const toggleFeature = (id: string) => {
    if (features.includes(id)) {
      setFeatures(features.filter((f) => f !== id));
    } else {
      setFeatures([...features, id]);
    }
  };

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">
        Select the features you&apos;d like to focus on first. You can always add more later.
      </p>

      <div className="space-y-2.5">
        {FEATURE_OPTIONS.map((option) => {
          const isSelected = features.includes(option.id);
          const Icon = option.icon;
          return (
            <button
              key={option.id}
              type="button"
              className={cn(
                "flex w-full items-center gap-3 rounded-[1.35rem] border p-4 text-left transition-all duration-200",
                isSelected
                  ? "border-[var(--workspace-shell)]/25 bg-[color-mix(in_srgb,var(--workspace-shell)_8%,white)] shadow-sm"
                  : "border-[var(--workspace-card-border)] bg-background hover:border-[var(--workspace-shell)]/20 hover:bg-accent/40"
              )}
              onClick={() => toggleFeature(option.id)}
            >
              <div
                className={cn(
                  "flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl",
                  isSelected
                    ? "bg-[color-mix(in_srgb,var(--workspace-accent)_18%,white)] text-[var(--workspace-shell)]"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium">{option.label}</p>
                <p className="text-xs text-muted-foreground">{option.description}</p>
              </div>
              <div
                className={cn(
                  "flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-all",
                  isSelected
                    ? "border-[var(--workspace-shell)] bg-[var(--workspace-shell)] text-[var(--workspace-shell-foreground)]"
                    : "border-input"
                )}
              >
                {isSelected && <Check className="h-3 w-3" />}
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
