"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  TrendingUp,
  Trophy,
  CreditCard,
  Flame,
  Target,
  Share2,
  Award,
  Laugh,
  Sparkles,
} from "lucide-react";
import { ShareSnapshotDialog } from "@/components/ShareSnapshotDialog";
import type { Milestone, MilestoneKind } from "@/lib/milestones";

// ---------------------------------------------------------------------------
// Config
// ---------------------------------------------------------------------------

const KIND_ICON: Record<MilestoneKind, typeof TrendingUp> = {
  net_worth_growth: TrendingUp,
  goal_completed: Trophy,
  debt_paid_off: CreditCard,
  savings_streak: Flame,
  budget_adherence: Target,
  funny: Laugh,
};

const ACCENT_BG: Record<Milestone["accent"], string> = {
  blue: "bg-blue-500/10 text-blue-600 dark:text-blue-400",
  emerald: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  amber: "bg-amber-500/10 text-amber-600 dark:text-amber-400",
  violet: "bg-violet-500/10 text-violet-600 dark:text-violet-400",
  rose: "bg-rose-500/10 text-rose-600 dark:text-rose-400",
};

const ACCENT_TEXT: Record<Milestone["accent"], string> = {
  blue: "text-blue-600 dark:text-blue-400",
  emerald: "text-emerald-600 dark:text-emerald-400",
  amber: "text-amber-600 dark:text-amber-400",
  violet: "text-violet-600 dark:text-violet-400",
  rose: "text-rose-600 dark:text-rose-400",
};

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function RegularMilestoneRow({
  milestone,
  onShare,
}: {
  readonly milestone: Milestone;
  readonly onShare: () => void;
}) {
  const Icon = KIND_ICON[milestone.kind];
  return (
    <div className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5">
      <div
        className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_BG[milestone.accent]}`}
      >
        <Icon className="h-4 w-4" />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span className="text-sm font-medium truncate">
            {milestone.title}
          </span>
          <span
            className={`text-xs font-bold tabular-nums shrink-0 ${ACCENT_TEXT[milestone.accent]}`}
          >
            {milestone.stat}
          </span>
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {milestone.subtitle}
        </p>
      </div>

      <Button
        variant="ghost"
        size="icon"
        className="h-8 w-8 shrink-0 cursor-pointer"
        onClick={onShare}
      >
        <Share2 className="h-3.5 w-3.5" />
        <span className="sr-only">Share</span>
      </Button>
    </div>
  );
}

function FunnyMilestoneCard({
  milestone,
  onShare,
}: {
  readonly milestone: Milestone;
  readonly onShare: () => void;
}) {
  return (
    <div className="group relative overflow-hidden rounded-xl bg-gradient-to-br from-rose-500/10 via-amber-500/5 to-violet-500/10 p-[1px] transition-shadow duration-200 hover:shadow-md hover:shadow-rose-500/5 dark:from-rose-500/20 dark:via-amber-500/10 dark:to-violet-500/20">
      <div className="relative overflow-hidden rounded-[11px] bg-background px-4 py-3.5">
        {/* Decorative corner sparkle */}
        <div className="pointer-events-none absolute -right-3 -top-3 h-16 w-16 rounded-full bg-gradient-to-bl from-rose-500/8 to-transparent blur-xl" />

        <div className="relative flex items-start gap-3">
          {/* Icon with gradient ring */}
          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500/15 to-amber-500/15 ring-1 ring-rose-500/20">
            <Laugh className="h-5 w-5 text-rose-500 dark:text-rose-400" />
          </div>

          <div className="flex-1 min-w-0">
            {/* Badge + stat row */}
            <div className="flex items-center gap-2 mb-0.5">
              <span className="inline-flex items-center gap-1 rounded-full bg-gradient-to-r from-rose-500/10 to-amber-500/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-rose-600 dark:text-rose-400">
                <Sparkles className="h-2.5 w-2.5" />
                Fun Fact
              </span>
              <span className="ml-auto text-sm font-bold tabular-nums text-rose-600 dark:text-rose-400">
                {milestone.stat}
              </span>
            </div>

            {/* Title */}
            <h4 className="text-sm font-semibold leading-snug">
              {milestone.title}
            </h4>

            {/* Subtitle */}
            <p className="mt-0.5 text-xs text-muted-foreground">
              {milestone.subtitle}
            </p>

            {/* Detail (the extra quip) */}
            {milestone.detail && (
              <p className="mt-1.5 text-xs italic text-muted-foreground/70">
                {milestone.detail}
              </p>
            )}
          </div>

          {/* Share button */}
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 shrink-0 cursor-pointer opacity-0 transition-opacity duration-150 group-hover:opacity-100 focus-visible:opacity-100"
            onClick={onShare}
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="sr-only">Share</span>
          </Button>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface DashboardMilestonesProps {
  readonly milestones: readonly Milestone[];
  readonly displayName?: string;
}

export function DashboardMilestones({
  milestones,
  displayName,
}: DashboardMilestonesProps) {
  const [sharingMilestone, setSharingMilestone] = useState<Milestone | null>(
    null,
  );

  if (milestones.length === 0) return null;

  const regularMilestones = milestones.filter((m) => m.kind !== "funny");
  const funnyMilestones = milestones.filter((m) => m.kind === "funny");

  return (
    <>
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2.5">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary/10">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div>
              <CardTitle className="text-base">Milestones</CardTitle>
              <CardDescription className="text-xs">
                {milestones.length} achievement
                {milestones.length !== 1 ? "s" : ""} unlocked — share your
                progress
              </CardDescription>
            </div>
          </div>
        </CardHeader>

        <CardContent className="space-y-2.5">
          {/* Regular milestones */}
          {regularMilestones.map((m, i) => (
            <RegularMilestoneRow
              key={`${m.kind}-${i}`}
              milestone={m}
              onShare={() => setSharingMilestone(m)}
            />
          ))}

          {/* Fun Facts section */}
          {funnyMilestones.length > 0 && (
            <>
              {regularMilestones.length > 0 && (
                <div className="flex items-center gap-2 pt-1">
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                  <span className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground/60">
                    AI-powered fun facts
                  </span>
                  <div className="h-px flex-1 bg-gradient-to-r from-transparent via-rose-500/20 to-transparent" />
                </div>
              )}

              {funnyMilestones.map((m, i) => (
                <FunnyMilestoneCard
                  key={`funny-${i}`}
                  milestone={m}
                  onShare={() => setSharingMilestone(m)}
                />
              ))}
            </>
          )}
        </CardContent>
      </Card>

      {sharingMilestone && (
        <ShareSnapshotDialog
          open={!!sharingMilestone}
          onOpenChange={(open) => {
            if (!open) setSharingMilestone(null);
          }}
          milestone={sharingMilestone}
          displayName={displayName}
        />
      )}
    </>
  );
}
