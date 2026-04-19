"use client";

import Link from "next/link";
import { type ReactNode } from "react";
import { ArrowLeft, ArrowRight, Building2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OnboardingActionBar } from "@/components/OnboardingLayout";
import { type AccountMethod, buildOnboardingHref } from "@/lib/onboarding-flow";

interface OnboardingAccountsStageProps {
  readonly aiEnabled: boolean;
  readonly accountMethod: AccountMethod;
  readonly accountsSection: ReactNode;
  readonly backHref: string;
}

export function OnboardingAccountsStage({
  aiEnabled,
  accountMethod,
  accountsSection,
  backHref,
}: OnboardingAccountsStageProps) {
  const showOpenBanking = accountMethod === "auto" || accountMethod === "hybrid";
  const showManualAccounts = accountMethod === "manual" || accountMethod === "hybrid";

  return (
    <div className="space-y-5">
      {showOpenBanking && (
        <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              Open Banking
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              Connect your bank automatically
            </h3>
          </div>
          <div className="mt-5 space-y-3">
            <p className="text-sm leading-6 text-muted-foreground">
              TrueLayer securely connects to your bank and imports your accounts and transactions.
              Your bank credentials are never shared with us.
            </p>
            <Button asChild>
              <a href="/api/truelayer/connect?return_to=onboarding">
                <Building2 className="mr-2 h-4 w-4" />
                Connect your bank
              </a>
            </Button>
          </div>
        </section>
      )}

      {showManualAccounts && (
        <section className="workspace-card rounded-[1.75rem] border border-[var(--workspace-card-border)] px-5 py-5 shadow-sm">
          <div className="space-y-1">
            <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-muted-foreground">
              {showOpenBanking ? "Manual accounts" : "Accounts"}
            </p>
            <h3 className="text-lg font-semibold tracking-tight text-foreground">
              {showOpenBanking
                ? "Add accounts your bank doesn\u2019t cover"
                : "Add the accounts you want to track first"}
            </h3>
          </div>
          <div className="mt-5">{accountsSection}</div>
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
          <Button asChild>
            <Link href={buildOnboardingHref("features", { aiEnabled, method: accountMethod })}>
              Continue to features
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </OnboardingActionBar>
    </div>
  );
}
