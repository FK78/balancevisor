"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import PageError from "@/components/PageError";

export default function RetirementError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "retirement_route_error",
      error_digest: error.digest,
    });
    logger.error("retirement", "Retirement page error", error);
  }, [error]);

  return (
    <PageError
      title="Couldn't load retirement data"
      description="We couldn't fetch your retirement profile. This is usually temporary — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
    />
  );
}
