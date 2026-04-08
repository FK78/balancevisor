"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { formatMarkdown } from "@/lib/formatMarkdown";

export function DashboardMonthlyReport() {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>();
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const hasFetched = useRef(false);

  const fetchSummary = useCallback(async () => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const res = await fetch("/api/monthly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthsAgo: 1 }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setText(data.report);
        setLoading(false);
        return;
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setText(accumulated);
      }

      setLoading(false);
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setLoading(false);
      setError(err instanceof Error ? err.message : "Failed to load report");
    }
  }, []);

  useEffect(() => {
    if (!inView || hasFetched.current) return;
    hasFetched.current = true;
    fetchSummary();
  }, [inView, fetchSummary]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  // Extract first 2-3 paragraphs for the dashboard teaser
  const teaser = text
    ? text.split("\n").slice(0, 8).join("\n")
    : "";

  return (
    <Card ref={viewRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/8">
              <Sparkles className="h-3.5 w-3.5 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Monthly Report</CardTitle>
              <CardDescription className="text-xs">
                {loading ? "Generating last month's summary..." : "AI-powered financial summary"}
              </CardDescription>
            </div>
          </div>
          <Link
            href="/dashboard/reports"
            className="flex items-center gap-1 text-xs font-medium text-primary hover:underline"
          >
            Full report <ArrowRight className="h-3 w-3" />
          </Link>
        </div>
      </CardHeader>
      <CardContent>
        {error ? (
          <p className="text-sm text-muted-foreground">{error}</p>
        ) : loading && !text ? (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Analysing last month&apos;s finances...
          </div>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none line-clamp-6 [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(teaser) }}
          />
        )}
      </CardContent>
    </Card>
  );
}
