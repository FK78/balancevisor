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
          {milestones.map((m, i) => {
            const Icon = KIND_ICON[m.kind];
            return (
              <div
                key={`${m.kind}-${i}`}
                className="flex items-center gap-3 rounded-lg bg-secondary/40 px-3 py-2.5"
              >
                <div
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${ACCENT_BG[m.accent]}`}
                >
                  <Icon className="h-4 w-4" />
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate">
                      {m.title}
                    </span>
                    <span
                      className={`text-xs font-bold tabular-nums shrink-0 ${ACCENT_TEXT[m.accent]}`}
                    >
                      {m.stat}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    {m.subtitle}
                  </p>
                </div>

                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 shrink-0"
                  onClick={() => setSharingMilestone(m)}
                >
                  <Share2 className="h-3.5 w-3.5" />
                  <span className="sr-only">Share</span>
                </Button>
              </div>
            );
          })}
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
