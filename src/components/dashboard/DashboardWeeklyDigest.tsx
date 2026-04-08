"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { useInView } from "@/hooks/useInView";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CalendarDays, RefreshCw, Loader2 } from "lucide-react";

type DigestState = {
  text: string;
  loading: boolean;
  error: string | null;
  cached: boolean;
};

export function DashboardWeeklyDigest() {
  const { ref: viewRef, inView } = useInView<HTMLDivElement>();
  const [state, setState] = useState<DigestState>({
    text: "",
    loading: true,
    error: null,
    cached: false,
  });
  const abortRef = useRef<AbortController | null>(null);
  const hasFetched = useRef(false);

  const fetchDigest = useCallback(async (refresh: boolean) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ text: "", loading: true, error: null, cached: false });

    try {
      const res = await fetch("/api/weekly-digest", {
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

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setState({ text: data.digest, loading: false, error: null, cached: data.cached ?? false });
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
        setState((prev) => ({ ...prev, text: accumulated }));
      }

      setState({ text: accumulated, loading: false, error: null, cached: false });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load digest",
      }));
    }
  }, []);

  useEffect(() => {
    if (!inView || hasFetched.current) return;
    hasFetched.current = true;
    fetchDigest(false);
  }, [inView, fetchDigest]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  return (
    <Card ref={viewRef}>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-violet-500/10">
              <CalendarDays className="h-4 w-4 text-violet-600" />
            </div>
            <div>
              <CardTitle className="text-base">Weekly Digest</CardTitle>
              <CardDescription className="text-xs">
                {state.cached
                  ? "Cached — click refresh for latest"
                  : state.loading
                    ? "Summarising your week..."
                    : "Your last 7 days at a glance"}
              </CardDescription>
            </div>
          </div>
          <Button
            size="sm"
            variant="ghost"
            disabled={state.loading}
            onClick={() => fetchDigest(true)}
            className="h-8 w-8 p-0"
          >
            {state.loading ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {state.error ? (
          <p className="text-sm text-destructive">{state.error}</p>
        ) : state.loading && !state.text ? (
          <div className="space-y-2">
            <div className="h-3 w-full animate-pulse rounded bg-muted" />
            <div className="h-3 w-4/5 animate-pulse rounded bg-muted" />
            <div className="h-3 w-3/5 animate-pulse rounded bg-muted" />
          </div>
        ) : (
          <p className="text-sm leading-relaxed text-muted-foreground">{state.text}</p>
        )}
      </CardContent>
    </Card>
  );
}
