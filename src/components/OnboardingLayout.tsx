"use client";

import Link from "next/link";
import { ProgressBar } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface OnboardingLayoutProps {
  children: React.ReactNode;
  currentStep: number;
  totalSteps: number;
  stepName: string;
  skipHref?: string;
  canSkip?: boolean;
}

export function OnboardingLayout({
  children,
  currentStep,
  totalSteps,
  stepName,
  skipHref,
  canSkip = true,
}: OnboardingLayoutProps) {
  const progress = ((currentStep - 1) / totalSteps) * 100;

  return (
    <div className="mx-auto max-w-2xl space-y-6 p-6 md:p-10">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight md:text-3xl">
            Set up your workspace
          </h1>
          <p className="text-muted-foreground mt-1 text-sm">
            Step {currentStep} of {totalSteps}: {stepName}
          </p>
        </div>
        {canSkip && skipHref && (
          <Button asChild variant="ghost" size="sm">
            <Link href={skipHref}>Skip</Link>
          </Button>
        )}
      </div>

      {/* Progress Bar */}
      <ProgressBar value={progress} max={100} className="mb-2" />

      {/* Step Content */}
      <div
        key={currentStep}
        className="animate-fade-in-up"
      >
        {children}
      </div>
    </div>
  );
}
