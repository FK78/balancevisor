"use client";

import { useEffect } from "react";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import { logger } from "@/lib/logger";
import PageError from "@/components/PageError";

export default function InvestmentsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "investments_route_error",
      error_digest: error.digest,
    });
    logger.error("investments", "Investments page error", error);
  }, [error]);

  return (
    <PageError
      title="We hit a snag loading your portfolio"
      description="Your investments data has not been changed. This is usually a temporary issue with broker feeds — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
    />
  );
}
