"use client";

import { useState, useTransition } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, CheckCircle2, Coins, ShieldCheck, Sparkles } from "lucide-react";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import { setBaseCurrency, skipOnboarding } from "@/db/mutations/onboarding";
import type { BaseCurrency } from "@/lib/currency";
import { currencyLabels } from "@/lib/labels";

interface WelcomeStepProps {
  baseCurrency: string;
  supportedCurrencies: readonly BaseCurrency[];
  defaultAiEnabled: boolean;
  formId?: string;
}

const REASSURANCE_POINTS = [
  {
    icon: Coins,
    title: "Five-minute setup",
    description: "Start with the essentials and refine details later.",
  },
  {
    icon: CheckCircle2,
    title: "Everything stays editable",
    description: "Accounts, categories, and feature choices can all be changed later.",
  },
  {
    icon: ShieldCheck,
    title: "Private by default",
    description: "Your setup choices stay inside your workspace unless you share them.",
  },
] as const;

export function WelcomeStep({
  baseCurrency,
  supportedCurrencies,
  defaultAiEnabled,
  formId = "onboarding-basics-form",
}: WelcomeStepProps) {
  const [aiEnabled, setAiEnabled] = useState(defaultAiEnabled);
  const [isSkipping, startSkipTransition] = useTransition();

  return (
    <form
      id={formId}
      action={async (formData: FormData) => {
        formData.set("ai_enabled", aiEnabled ? "1" : "0");
        await setBaseCurrency(formData);
      }}
      className="space-y-5"
    >
      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="flex h-14 w-14 items-center justify-center rounded-3xl bg-[color-mix(in_srgb,var(--workspace-accent)_18%,var(--card))] text-primary">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <div className="mt-5 space-y-2">
          <h2 className="text-2xl font-semibold tracking-tight text-foreground sm:text-3xl">
            Welcome to BalanceVisor
          </h2>
          <p className="max-w-2xl text-sm leading-6 text-muted-foreground">
            We&apos;ll get your workspace ready in three guided stages: basics, money setup,
            and a quick readiness check before you land in the dashboard.
          </p>
        </div>

        <div className="mt-5 grid gap-3 sm:grid-cols-3">
          {REASSURANCE_POINTS.map((point) => {
            const Icon = point.icon;

            return (
              <div
                key={point.title}
                className="rounded-2xl border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_34%,var(--card))] p-4"
              >
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                  <Icon className="h-4 w-4" />
                </div>
                <p className="mt-3 text-sm font-semibold text-foreground">{point.title}</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">{point.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
        <div className="grid gap-5">
          <div className="grid gap-2">
            <Label htmlFor="base_currency">Base currency</Label>
            <p className="text-sm text-muted-foreground">
              All balances and reports will default to this currency across the app.
            </p>
            <select
              id="base_currency"
              name="base_currency"
              className="border-input bg-background rounded-xl border px-3 py-3 text-sm"
              defaultValue={baseCurrency}
            >
              {supportedCurrencies.map((currencyCode) => (
                <option key={currencyCode} value={currencyCode}>
                  {currencyLabels[currencyCode]}
                </option>
              ))}
            </select>
          </div>

          <div className="rounded-[1.5rem] border border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_36%,var(--card))] p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-background text-primary shadow-sm">
                  <Sparkles className="h-4 w-4" />
                </div>
                <div className="space-y-1">
                  <Label htmlFor="ai_toggle" className="text-sm font-semibold">
                    AI-powered features
                  </Label>
                  <p className="text-sm text-muted-foreground">
                    Turn on the assistant, smart parsing, and AI insights now, or leave them off for a more manual start.
                  </p>
                </div>
              </div>
              <Switch
                id="ai_toggle"
                checked={aiEnabled}
                onCheckedChange={setAiEnabled}
              />
            </div>
            <p className="mt-3 text-xs text-muted-foreground">
              {aiEnabled
                ? "AI is on. You can still disable it anytime from Settings."
                : "AI is off. You can turn it back on anytime from Settings."}
            </p>
          </div>
        </div>
      </section>

      <OnboardingActionBar>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="text-xs text-muted-foreground">
            You can still change these choices later from Settings.
          </div>
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button type="submit">
              Continue to money setup
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
            <Button
              type="button"
              variant="ghost"
              className="w-full sm:w-auto"
              disabled={isSkipping}
              onClick={() => {
                startSkipTransition(async () => {
                  await skipOnboarding(aiEnabled);
                });
              }}
            >
              Skip to dashboard
            </Button>
          </div>
        </div>
      </OnboardingActionBar>
    </form>
  );
}
