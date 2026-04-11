"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, ClipboardCopy, Check, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface PageErrorProps {
  title: string;
  description: string;
  error: Error & { digest?: string };
  reset: () => void;
  backHref?: string;
  backLabel?: string;
}

function buildSafeReport(error: Error & { digest?: string }): string {
  const lines = [
    `--- BalanceVisor Error Report ---`,
    `Time: ${new Date().toISOString()}`,
    `Page: ${typeof window !== "undefined" ? window.location.pathname : "unknown"}`,
    `Error: ${error.name ?? "Unknown"}`,
    error.digest ? `Ref: ${error.digest}` : null,
    `Browser: ${typeof navigator !== "undefined" ? navigator.userAgent : "unknown"}`,
    `---`,
    `Please send this report to the BalanceVisor team so we can investigate.`,
  ];
  return lines.filter(Boolean).join("\n");
}

export default function PageError({
  title,
  description,
  error,
  reset,
  backHref = "/dashboard",
  backLabel = "Back to dashboard",
}: PageErrorProps) {
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    router.refresh();
    reset();
    setTimeout(() => setRetrying(false), 1500);
  }, [router, reset]);

  const handleCopyReport = useCallback(async () => {
    const report = buildSafeReport(error);
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
      toast.success("Error report copied to clipboard");
      setTimeout(() => setCopied(false), 2500);
    } catch {
      toast.error("Could not copy — please take a screenshot instead");
    }
  }, [error]);

  const handleBack = useCallback(() => {
    window.location.href = backHref;
  }, [backHref]);

  return (
    <div className="mx-auto max-w-7xl p-6 md:p-10">
      <Card className="mx-auto max-w-xl">
        <CardHeader className="text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10 text-destructive">
            <AlertTriangle className="h-6 w-6" />
          </div>
          <CardTitle>{title}</CardTitle>
          <CardDescription>{description}</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-center gap-2">
            <Button onClick={handleRetry} disabled={retrying}>
              <RefreshCw
                className={`h-4 w-4 ${retrying ? "animate-spin" : ""}`}
              />
              {retrying ? "Retrying…" : "Try again"}
            </Button>
            <Button variant="outline" onClick={handleBack}>
              {backLabel}
            </Button>
          </div>

          {error.digest && (
            <p className="text-center text-xs text-muted-foreground">
              Ref: {error.digest}
            </p>
          )}

          <div className="flex justify-center">
            <Button
              variant="ghost"
              size="sm"
              className="text-xs text-muted-foreground"
              onClick={handleCopyReport}
            >
              {copied ? (
                <Check className="h-3.5 w-3.5" />
              ) : (
                <ClipboardCopy className="h-3.5 w-3.5" />
              )}
              {copied ? "Copied!" : "Copy error report for support"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
