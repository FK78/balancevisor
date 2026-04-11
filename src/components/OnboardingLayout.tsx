"use client";

import { cn } from "@/lib/utils";
import {
  ONBOARDING_STAGE_META,
  type OnboardingStage,
} from "@/lib/onboarding-flow";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStage: OnboardingStage;
  stageTitle: string;
  stageDescription: string;
  skipAction?: React.ReactNode;
  canSkip?: boolean;
}

export function OnboardingLayout({
  children,
  currentStage,
  stageTitle,
  stageDescription,
  skipAction,
  canSkip = true,
}: OnboardingLayoutProps) {
  return (
    <div className="min-h-screen bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--workspace-muted-surface)_86%,transparent)_0%,transparent_42%),linear-gradient(180deg,color-mix(in_srgb,var(--workspace-blue)_32%,transparent)_0%,transparent_34%)]">
      <div className="mx-auto flex min-h-screen w-full max-w-4xl flex-col px-4 pb-8 pt-4 sm:px-6 sm:pb-10 sm:pt-6">
        <div className="rounded-[2rem] border border-[var(--workspace-card-border)] bg-card/92 px-4 py-4 shadow-sm backdrop-blur sm:px-6 sm:py-5">
          <div className="flex items-center justify-between gap-3">
            <div className="space-y-1">
              <p className="cockpit-kicker">
                Onboarding
              </p>
              <p className="text-sm font-medium text-foreground">
                Guided setup
              </p>
            </div>
            {canSkip && skipAction}
          </div>

          <div className="mt-4 grid grid-cols-4 gap-2">
            {ONBOARDING_STAGE_META.map((stage, index) => {
              const currentIndex = ONBOARDING_STAGE_META.findIndex((item) => item.value === currentStage);
              const isActive = stage.value === currentStage;
              const isDone = index < currentIndex;

              return (
                <div
                  key={stage.value}
                  data-state={isActive ? "active" : isDone ? "done" : "upcoming"}
                  aria-current={isActive ? "step" : undefined}
                  className={cn(
                    "rounded-2xl border px-3 py-2 text-left transition-colors",
                    isActive
                      ? "border-[var(--workspace-shell)] bg-[color-mix(in_srgb,var(--workspace-shell)_10%,var(--card))]"
                      : isDone
                        ? "border-[var(--workspace-card-border)] bg-[color-mix(in_srgb,var(--workspace-muted-surface)_46%,var(--card))]"
                        : "border-[var(--workspace-card-border)] bg-background/70",
                  )}
                >
                  <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
                    0{index + 1}
                  </p>
                  <p className="mt-1 text-sm font-semibold text-foreground">
                    {stage.label}
                  </p>
                </div>
              );
            })}
          </div>
        </div>

        <div className="mt-5 rounded-[2rem] bg-[linear-gradient(135deg,var(--workspace-shell)_0%,color-mix(in_srgb,var(--workspace-shell)_78%,black)_100%)] px-5 py-5 text-[var(--workspace-shell-foreground)] shadow-[0_26px_60px_rgba(27,36,30,0.18)] sm:px-7 sm:py-6">
          <p className="cockpit-kicker text-[color:color-mix(in_srgb,var(--workspace-shell-foreground)_72%,transparent)]">
            {ONBOARDING_STAGE_META.find((stage) => stage.value === currentStage)?.label}
          </p>
          <h1 className="font-display mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">
            {stageTitle}
          </h1>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-[color:color-mix(in_srgb,var(--workspace-shell-foreground)_82%,transparent)]">
            {stageDescription}
          </p>
        </div>

        <div key={currentStage} className="animate-fade-in-up mt-5 flex-1">
          {children}
        </div>
      </div>
    </div>
  );
}

export function OnboardingActionBar({
  className,
  children,
}: {
  readonly className?: string;
  readonly children: React.ReactNode;
}) {
  return (
    <div
      data-slot="onboarding-action-bar"
      data-mobile-sticky="true"
      className={cn(
        "sticky bottom-0 z-20 -mx-5 mt-6 border-t border-[var(--workspace-card-border)] bg-card/96 px-5 pb-[calc(1rem+env(safe-area-inset-bottom))] pt-4 backdrop-blur sm:static sm:mx-0 sm:mt-0 sm:border-0 sm:bg-transparent sm:px-0 sm:pb-0 sm:pt-0",
        className,
      )}
    >
      {children}
    </div>
  );
}
