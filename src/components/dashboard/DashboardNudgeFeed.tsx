"use client";

import { useTransition } from "react";
import Link from "next/link";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  AlertTriangle,
  ArrowRight,
  Info,
  PartyPopper,
  PiggyBank,
  Repeat,
  Scissors,
  Target,
  TrendingDown,
  X,
  Zap,
} from "lucide-react";
import type { Nudge, NudgeCategory } from "@/lib/nudges/types";
import { dismissNudge } from "@/db/mutations/nudge-dismissals";

const ICON_MAP = {
  "alert-triangle": AlertTriangle,
  "trending-down": TrendingDown,
  "piggy-bank": PiggyBank,
  "party-popper": PartyPopper,
  info: Info,
  scissors: Scissors,
  repeat: Repeat,
  zap: Zap,
  target: Target,
} as const;

const CATEGORY_STYLES: Record<NudgeCategory, { bg: string; iconColor: string; border: string }> = {
  save: { bg: "bg-emerald-500/10", iconColor: "text-emerald-600", border: "border-emerald-200/50 dark:border-emerald-800/50" },
  watch: { bg: "bg-amber-500/10", iconColor: "text-amber-600", border: "border-amber-200/50 dark:border-amber-800/50" },
  celebrate: { bg: "bg-violet-500/10", iconColor: "text-violet-600", border: "border-violet-200/50 dark:border-violet-800/50" },
  info: { bg: "bg-blue-500/10", iconColor: "text-blue-600", border: "border-blue-200/50 dark:border-blue-800/50" },
};

const CATEGORY_LABELS: Record<NudgeCategory, string> = {
  save: "Savings opportunity",
  watch: "Needs attention",
  celebrate: "Nice work",
  info: "FYI",
};

function NudgeCard({ nudge }: { readonly nudge: Nudge }) {
  const [isPending, startTransition] = useTransition();
  const style = CATEGORY_STYLES[nudge.category];
  const Icon = ICON_MAP[nudge.icon];

  function handleDismiss() {
    startTransition(() => {
      dismissNudge(nudge.id);
    });
  }

  return (
    <div
      className={`relative flex gap-3 rounded-xl border p-3 transition-all ${style.border} ${isPending ? "opacity-40" : ""}`}
    >
      <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${style.bg}`}>
        <Icon className={`h-4 w-4 ${style.iconColor}`} />
      </div>
      <div className="min-w-0 flex-1 space-y-1">
        <div className="flex items-start justify-between gap-2">
          <div>
            <span className={`text-[10px] font-semibold uppercase tracking-wider ${style.iconColor}`}>
              {CATEGORY_LABELS[nudge.category]}
            </span>
            <p className="text-sm font-medium leading-tight">{nudge.title}</p>
          </div>
          {nudge.dismissible && (
            <button
              type="button"
              onClick={handleDismiss}
              disabled={isPending}
              className="shrink-0 rounded-md p-0.5 text-muted-foreground/50 hover:text-muted-foreground transition-colors"
              aria-label="Dismiss nudge"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
        <p className="text-xs leading-relaxed text-muted-foreground">{nudge.body}</p>
        {nudge.actionUrl && nudge.actionLabel && (
          <Button asChild variant="link" size="sm" className="h-auto p-0 text-xs">
            <Link href={nudge.actionUrl}>
              {nudge.actionLabel}
              <ArrowRight className="ml-1 h-3 w-3" />
            </Link>
          </Button>
        )}
      </div>
    </div>
  );
}

export function DashboardNudgeFeed({
  nudges,
}: {
  readonly nudges: readonly Nudge[];
}) {
  if (nudges.length === 0) return null;

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
            <Zap className="h-4 w-4 text-primary" />
          </div>
          <div>
            <CardTitle className="text-base">Smart Nudges</CardTitle>
            <p className="text-xs text-muted-foreground">
              {nudges.length} personalised insight{nudges.length !== 1 ? "s" : ""} based on your data
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {nudges.map((nudge) => (
          <NudgeCard key={nudge.id} nudge={nudge} />
        ))}
      </CardContent>
    </Card>
  );
}
