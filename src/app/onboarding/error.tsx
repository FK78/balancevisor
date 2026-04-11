"use client";

import { useEffect } from "react";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import { logger } from "@/lib/logger";
import PageError from "@/components/PageError";

export default function OnboardingError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "onboarding_route_error",
      error_digest: error.digest,
    });
    logger.error("onboarding", "Onboarding page error", error);
  }, [error]);

  return (
    <PageError
      title="Couldn't load onboarding"
      description="We ran into an issue setting things up. This is usually temporary — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
      backHref="/onboarding"
      backLabel="Reload onboarding"
    />
  );
}
