"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import PageError from "@/components/PageError";

export default function ReportsError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "reports_route_error",
      error_digest: error.digest,
    });
    logger.error("reports", "Reports page error", error);
  }, [error]);

  return (
    <PageError
      title="Couldn't load reports"
      description="We couldn't fetch your report data. This is usually temporary — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
    />
  );
}
