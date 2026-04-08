"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { formatMarkdown } from "@/lib/formatMarkdown";

type AnalysisState = {
  text: string;
  loading: boolean;
  error: string | null;
  cached: boolean;
};

export function PortfolioAIAnalysis() {
  const [state, setState] = useState<AnalysisState>({
    text: "",
    loading: true,
    error: null,
    cached: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const hasFetched = useRef(false);

  const fetchAnalysis = useCallback(async (refresh: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ text: "", loading: true, error: null, cached: false });

    try {
      const res = await fetch("/api/portfolio-analysis", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ refresh }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const contentType = res.headers.get("content-type") ?? "";

      // Cached response comes as JSON
      if (contentType.includes("application/json")) {
        const data = await res.json();
        setState({ text: data.analysis, loading: false, error: null, cached: data.cached ?? false });
        return;
      }

      // Streamed response
      const reader = res.body?.getReader();
      if (!reader) throw new Error("No response body");

      const decoder = new TextDecoder();
      let accumulated = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        accumulated += decoder.decode(value, { stream: true });
        setState((prev) => ({ ...prev, text: accumulated }));
      }

      setState({ text: accumulated, loading: false, error: null, cached: false });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load analysis",
      }));
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchAnalysis(false);
  }, [fetchAnalysis]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Portfolio Analysis</CardTitle>
              <CardDescription>
                {state.cached
                  ? "Cached insight — click refresh for latest"
                  : state.loading
                    ? "Analysing your portfolio..."
                    : "Personalised insights powered by AI"}
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="outline"
            disabled={state.loading}
            onClick={() => fetchAnalysis(true)}
            className="gap-1.5"
          >
            {state.loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            {state.loading ? "Analysing" : "Re-analyse"}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {state.error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        ) : state.loading && !state.text ? (
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="space-y-2">
                <div className="h-4 w-1/3 animate-pulse rounded bg-muted" />
                <div className="h-3 w-full animate-pulse rounded bg-muted" />
                <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
              </div>
            ))}
          </div>
        ) : (
          <div
            className="prose prose-sm dark:prose-invert max-w-none [&>*:first-child]:mt-0 [&>*:last-child]:mb-0"
            dangerouslySetInnerHTML={{ __html: formatMarkdown(state.text) }}
          />
        )}
      </CardContent>
    </Card>
  );
}
