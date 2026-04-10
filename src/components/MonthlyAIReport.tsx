"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { useAiEnabled } from "@/components/AiSettingsProvider";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Sparkles, RefreshCw, Loader2 } from "lucide-react";
import { formatMarkdown } from "@/lib/formatMarkdown";

type ReportState = {
  text: string;
  loading: boolean;
  error: string | null;
};

function getMonthOptions(): Array<{ label: string; value: string; monthsAgo: number }> {
  const options: Array<{ label: string; value: string; monthsAgo: number }> = [];
  const now = new Date();
  for (let i = 0; i < 12; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const label = new Intl.DateTimeFormat("en-GB", { month: "long", year: "numeric" }).format(d);
    options.push({ label: i === 0 ? `${label} (current)` : label, value: String(i), monthsAgo: i });
  }
  return options;
}

export function MonthlyAIReport() {
  const aiEnabled = useAiEnabled();
  const monthOptions = useMemo(() => getMonthOptions(), []);
  const [selectedMonth, setSelectedMonth] = useState("1"); // default: last completed month
  const [state, setState] = useState<ReportState>({
    text: "",
    loading: true,
    error: null,
  });
  const abortRef = useRef<AbortController | null>(null);
  const hasFetched = useRef(false);

  const fetchReport = useCallback(async (monthsAgo: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setState({ text: "", loading: true, error: null });

    try {
      const res = await fetch("/api/monthly-report", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ monthsAgo: Number(monthsAgo) }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const body = await res.json().catch(() => ({}));
        throw new Error(body.error ?? `Request failed (${res.status})`);
      }

      const contentType = res.headers.get("content-type") ?? "";

      if (contentType.includes("application/json")) {
        const data = await res.json();
        setState({ text: data.report, loading: false, error: null });
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

      setState({ text: accumulated, loading: false, error: null });
    } catch (err) {
      if ((err as Error).name === "AbortError") return;
      setState((prev) => ({
        ...prev,
        loading: false,
        error: err instanceof Error ? err.message : "Failed to load report",
      }));
    }
  }, []);

  useEffect(() => {
    if (hasFetched.current) return;
    hasFetched.current = true;
    fetchReport(selectedMonth);
  }, [fetchReport, selectedMonth]);

  const handleMonthChange = (value: string) => {
    setSelectedMonth(value);
    fetchReport(value);
  };

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const currentLabel = monthOptions.find((o) => o.value === selectedMonth)?.label ?? "";

  if (!aiEnabled) return null;

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-lg">AI Monthly Report</CardTitle>
              <CardDescription>
                {state.loading
                    ? `Generating report for ${currentLabel}...`
                    : "Personalised financial summary powered by AI"}
              </CardDescription>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Select value={selectedMonth} onValueChange={handleMonthChange}>
              <SelectTrigger className="w-[200px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthOptions.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              disabled={state.loading}
              onClick={() => fetchReport(selectedMonth)}
              className="gap-1.5"
            >
              {state.loading ? (
                <Loader2 className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <RefreshCw className="h-3.5 w-3.5" />
              )}
              {state.loading ? "Generating" : "Refresh"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {state.error ? (
          <div className="rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3">
            <p className="text-sm text-destructive">{state.error}</p>
          </div>
        ) : state.loading && !state.text ? (
          <div className="space-y-3">
            {[...Array(6)].map((_, i) => (
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
