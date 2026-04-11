"use client";

import { useEffect } from "react";
import { logger } from "@/lib/logger";
import { capturePostHogException } from "@/lib/posthog-error-tracking";
import PageError from "@/components/PageError";

export default function ZakatError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "zakat_route_error",
      error_digest: error.digest,
    });
    logger.error("zakat", "Page error", error);
  }, [error]);

  return (
    <PageError
      title="Couldn't load zakat data"
      description="We couldn't fetch your zakat information. This is usually temporary — try refreshing, or copy the error report below to share with support."
      error={error}
      reset={reset}
    />
  );
}
