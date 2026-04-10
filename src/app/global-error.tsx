"use client";

import NextError from "next/error";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { capturePostHogException } from "@/lib/posthog-error-tracking";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    capturePostHogException(error, {
      source: "global_route_error",
      error_digest: error.digest,
    });
  }, [error]);

  return (
    <html lang="en">
      <body className="flex min-h-screen flex-col items-center justify-center gap-4 bg-background px-6 text-foreground">
        <NextError statusCode={0} />
        <Button onClick={() => reset()}>Try again</Button>
      </body>
    </html>
  );
}
