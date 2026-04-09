"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { ArrowRight, CheckCircle2, Sparkles } from "lucide-react";
import { setBaseCurrency, skipOnboarding } from "@/db/mutations/onboarding";
import type { BaseCurrency } from "@/lib/currency";
import { currencyLabels } from "@/lib/labels";

interface WelcomeStepProps {
  baseCurrency: string;
  supportedCurrencies: readonly BaseCurrency[];
  defaultAiEnabled: boolean;
}

export function WelcomeStep({ baseCurrency, supportedCurrencies, defaultAiEnabled }: WelcomeStepProps) {
  const [aiEnabled, setAiEnabled] = useState(defaultAiEnabled);

  return (
    <Card>
      <CardHeader className="text-center">
        <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10">
          <CheckCircle2 className="h-8 w-8 text-primary" />
        </div>
        <CardTitle className="text-2xl">Welcome to BalanceVisor</CardTitle>
        <CardDescription className="text-base">
          {"Let's get your finances set up in just a few quick steps."}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-3">
          <p className="text-sm text-muted-foreground">
            First, choose your base currency. All amounts in the app will use this currency.
          </p>
          <form
            action={async (formData: FormData) => {
              formData.set("ai_enabled", aiEnabled ? "1" : "0");
              await setBaseCurrency(formData);
            }}
            className="space-y-4"
          >
            <div className="grid gap-2">
              <Label htmlFor="base_currency">Base Currency</Label>
              <select
                id="base_currency"
                name="base_currency"
                className="border-input bg-background rounded-md border px-3 py-2 text-sm"
                defaultValue={baseCurrency}
              >
                {supportedCurrencies.map((currencyCode) => (
                  <option key={currencyCode} value={currencyCode}>
                    {currencyLabels[currencyCode]}
                  </option>
                ))}
              </select>
            </div>

            <div className="rounded-xl border p-4 space-y-3">
              <div className="flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-primary/10">
                    <Sparkles className="h-4 w-4 text-primary" />
                  </div>
                  <div className="space-y-0.5">
                    <Label htmlFor="ai_toggle" className="text-sm font-medium">
                      AI-powered features
                    </Label>
                    <p className="text-xs text-muted-foreground">
                      Financial assistant, smart parsing &amp; spending analysis
                    </p>
                  </div>
                </div>
                <Switch
                  id="ai_toggle"
                  checked={aiEnabled}
                  onCheckedChange={setAiEnabled}
                />
              </div>
              {!aiEnabled && (
                <p className="text-xs text-muted-foreground pl-12">
                  AI features will be disabled. You can re-enable them anytime from{" "}
                  <strong className="text-foreground">Settings</strong>.
                </p>
              )}
            </div>

            <Button type="submit" className="w-full">
              Save &amp; Continue
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>
        </div>

        <div className="text-center">
          <form
            action={async () => {
              await skipOnboarding(aiEnabled);
            }}
          >
            <Button type="submit" variant="link" className="text-muted-foreground">
              Skip setup and go to dashboard
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
}
