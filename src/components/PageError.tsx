"use client";

import { useCallback, useState } from "react";
import { useRouter } from "next/navigation";
import { AlertTriangle, Send, Check, RefreshCw, Loader2 } from "lucide-react";
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

function buildSafePayload(error: Error & { digest?: string }) {
  return {
    page:
      typeof window !== "undefined" ? window.location.pathname : "unknown",
    errorName: error.name ?? "Unknown",
    digest: error.digest ?? undefined,
    timestamp: new Date().toISOString(),
    userAgent:
      typeof navigator !== "undefined" ? navigator.userAgent : "unknown",
  };
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
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [retrying, setRetrying] = useState(false);

  const handleRetry = useCallback(() => {
    setRetrying(true);
    router.refresh();
    reset();
    setTimeout(() => setRetrying(false), 1500);
  }, [router, reset]);

  const handleSendReport = useCallback(async () => {
    setSending(true);
    try {
      const res = await fetch("/api/error-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(buildSafePayload(error)),
      });
      if (res.ok) {
        setSent(true);
        toast.success("Error report sent to the team — thank you!");
      } else {
        toast.error("Could not send report — please try again later");
      }
    } catch {
      toast.error("Could not send report — please try again later");
    } finally {
      setSending(false);
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
              onClick={handleSendReport}
              disabled={sending || sent}
            >
              {sent ? (
                <Check className="h-3.5 w-3.5" />
              ) : sending ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <Send className="h-3.5 w-3.5" />
              )}
              {sent
                ? "Report sent!"
                : sending
                  ? "Sending…"
                  : "Send report to team"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
