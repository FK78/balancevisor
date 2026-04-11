"use client";

import { useState } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  ArrowRight,
  Building2,
  CheckCircle2,
  Layers,
  PenLine,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import {
  buildOnboardingHref,
  type AccountMethod,
} from "@/lib/onboarding-flow";
import { cn } from "@/lib/utils";

interface AccountMethodStepProps {
  readonly aiEnabled: boolean;
  readonly backHref: string;
}

const METHOD_OPTIONS: readonly {
  readonly value: AccountMethod;
  readonly icon: React.ElementType;
  readonly title: string;
  readonly description: string;
  readonly badge?: string;
}[] = [
  {
    value: "auto",
    icon: Building2,
    title: "Open Banking",
    description:
      "Connect your banks via TrueLayer. Accounts and transactions import automatically — no manual entry needed.",
    badge: "Recommended",
  },
  {
    value: "manual",
    icon: PenLine,
    title: "Manual",
    description:
      "Add accounts by hand and enter transactions manually or import them from CSV files.",
  },
  {
    value: "hybrid",
    icon: Layers,
    title: "Both",
    description:
      "Connect banks for automatic imports and also add manual accounts for things like cash or crypto.",
  },
] as const;

export function AccountMethodStep({
  aiEnabled,
  backHref,
}: AccountMethodStepProps) {
  const [selected, setSelected] = useState<AccountMethod | null>(null);

  const continueHref = selected
    ? buildOnboardingHref("setup", { aiEnabled, method: selected })
    : "#";

  return (
    <div className="space-y-5">
      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="grid gap-3 sm:grid-cols-3">
          {METHOD_OPTIONS.map((option) => {
            const Icon = option.icon;
            const isSelected = selected === option.value;

            return (
              <button
                key={option.value}
                type="button"
                onClick={() => setSelected(option.value)}
                className={cn(
                  "relative flex flex-col items-start gap-3 rounded-[1.35rem] border p-5 text-left transition-all duration-200",
                  isSelected
                    ? "border-[var(--workspace-shell)] bg-[color-mix(in_srgb,var(--workspace-shell)_10%,var(--card))] shadow-sm"
                    : "border-[var(--workspace-card-border)] bg-background hover:border-[var(--workspace-shell)]/22 hover:bg-accent/40",
                )}
              >
                {option.badge && (
                  <span className="absolute right-3 top-3 rounded-full bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))] px-2.5 py-0.5 text-[10px] font-semibold text-primary">
                    {option.badge}
                  </span>
                )}

                <div
                  className={cn(
                    "flex h-12 w-12 items-center justify-center rounded-2xl transition-colors",
                    isSelected
                      ? "bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))] text-primary"
                      : "bg-muted/70 text-muted-foreground",
                  )}
                >
                  <Icon className="h-5 w-5" />
                </div>

                <div className="space-y-1.5">
                  <div className="flex items-center gap-2">
                    <p className="text-sm font-semibold text-foreground">
                      {option.title}
                    </p>
                    {isSelected && (
                      <CheckCircle2 className="h-4 w-4 text-primary" />
                    )}
                  </div>
                  <p className="text-xs leading-5 text-muted-foreground">
                    {option.description}
                  </p>
                </div>
              </button>
            );
          })}
        </div>
      </section>

      {selected && (
        <section className="workspace-card animate-fade-in-up rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))] text-primary">
              <CheckCircle2 className="h-4 w-4" />
            </div>
            <div className="space-y-1">
              <p className="text-sm font-semibold text-foreground">
                {selected === "auto" && "You'll connect your bank in the next step"}
                {selected === "manual" && "You'll add accounts manually in the next step"}
                {selected === "hybrid" && "You'll connect banks and add manual accounts next"}
              </p>
              <p className="text-xs leading-5 text-muted-foreground">
                {selected === "auto" &&
                  "We'll redirect you to TrueLayer's secure Open Banking screen. Your bank credentials are never shared with us."}
                {selected === "manual" &&
                  "Pick from common account templates or create custom ones. You can always connect a bank later from Settings."}
                {selected === "hybrid" &&
                  "Start with Open Banking for your main accounts, then add any accounts your bank doesn't cover."}
              </p>
            </div>
          </div>
        </section>
      )}

      <OnboardingActionBar>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <Button asChild variant="outline">
            <Link href={backHref}>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back
            </Link>
          </Button>
          <Button asChild disabled={!selected}>
            <Link
              href={continueHref}
              aria-disabled={!selected}
              className={cn(!selected && "pointer-events-none opacity-50")}
            >
              Continue to money setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </OnboardingActionBar>
    </div>
  );
}
