"use client";

import {
  TrendingUp,
  Trophy,
  CreditCard,
  Flame,
  Target,
  Laugh,
  Sparkles,
} from "lucide-react";
import type { Milestone, MilestoneKind } from "@/lib/milestones";

// ---------------------------------------------------------------------------
// Accent config per milestone kind
// ---------------------------------------------------------------------------

const ACCENT_CONFIG: Record<
  Milestone["accent"],
  { gradient: string; glow: string; badge: string }
> = {
  blue: {
    gradient: "from-[#1e3a5f] via-[#0f172a] to-[#1a1a2e]",
    glow: "bg-blue-500/10",
    badge: "bg-blue-500/15 text-blue-400",
  },
  emerald: {
    gradient: "from-[#0d3320] via-[#0a0f0f] to-[#0d2818]",
    glow: "bg-emerald-500/10",
    badge: "bg-emerald-500/15 text-emerald-400",
  },
  amber: {
    gradient: "from-[#3d2800] via-[#0f0a0a] to-[#2d1f00]",
    glow: "bg-amber-500/10",
    badge: "bg-amber-500/15 text-amber-400",
  },
  violet: {
    gradient: "from-[#2d1b5e] via-[#0f0a1a] to-[#1a1030]",
    glow: "bg-violet-500/10",
    badge: "bg-violet-500/15 text-violet-400",
  },
  rose: {
    gradient: "from-[#4a1225] via-[#0f0a0c] to-[#2d0f1a]",
    glow: "bg-rose-500/10",
    badge: "bg-rose-500/15 text-rose-400",
  },
};

const KIND_ICON: Record<MilestoneKind, typeof TrendingUp> = {
  net_worth_growth: TrendingUp,
  goal_completed: Trophy,
  debt_paid_off: CreditCard,
  savings_streak: Flame,
  budget_adherence: Target,
  funny: Laugh,
};

const KIND_LABEL: Record<MilestoneKind, string> = {
  net_worth_growth: "Milestone",
  goal_completed: "Goal Reached",
  debt_paid_off: "Achievement",
  savings_streak: "Streak",
  budget_adherence: "Discipline",
  funny: "Fun Fact",
};

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

interface ShareSnapshotCardProps {
  readonly milestone: Milestone;
  readonly displayName?: string;
}

export function ShareSnapshotCard({ milestone, displayName }: ShareSnapshotCardProps) {
  const dateLabel = new Date().toLocaleDateString("en-GB", {
    month: "long",
    year: "numeric",
  });

  if (milestone.kind === "funny") {
    return <FunnyShareCard milestone={milestone} displayName={displayName} dateLabel={dateLabel} />;
  }

  const accent = ACCENT_CONFIG[milestone.accent];
  const Icon = KIND_ICON[milestone.kind];
  const label = KIND_LABEL[milestone.kind];

  return (
    <div
      className={`relative w-[400px] overflow-hidden rounded-2xl bg-gradient-to-br ${accent.gradient} p-6 text-white`}
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Glow blob */}
      <div
        className={`pointer-events-none absolute -right-8 -top-8 h-32 w-32 rounded-full ${accent.glow} blur-2xl`}
      />

      <div className="relative">
        {/* Badge row */}
        <div className="mb-4 flex items-center gap-2">
          <Icon className="h-5 w-5 opacity-80" />
          <span
            className={`rounded-full px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider ${accent.badge}`}
          >
            {label}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold leading-tight">{milestone.title}</h3>
        <p className="mt-1 text-sm text-white/60">{milestone.subtitle}</p>

        {/* Detail */}
        {milestone.detail && (
          <p className="mt-3 text-sm text-white/50">{milestone.detail}</p>
        )}

        {/* Branding footer */}
        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-violet-500 text-xs font-bold">
            W
          </div>
          <div>
            <span className="text-xs font-medium text-white/70">
              {displayName ? `${displayName} · ` : ""}Tracked with Wealth
            </span>
            <span className="block text-[10px] text-white/40">{dateLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Funny milestone share card — warmer palette, prominent stat, playful layout
// ---------------------------------------------------------------------------

function FunnyShareCard({
  milestone,
  displayName,
  dateLabel,
}: {
  readonly milestone: Milestone;
  readonly displayName?: string;
  readonly dateLabel: string;
}) {
  return (
    <div
      className="relative w-[400px] overflow-hidden rounded-2xl bg-gradient-to-br from-[#4a1225] via-[#1a0a14] to-[#2d1040] p-6 text-white"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}
    >
      {/* Dual glow blobs for warmer feel */}
      <div className="pointer-events-none absolute -right-6 -top-6 h-28 w-28 rounded-full bg-rose-500/15 blur-2xl" />
      <div className="pointer-events-none absolute -left-4 bottom-8 h-20 w-20 rounded-full bg-amber-500/10 blur-2xl" />

      <div className="relative">
        {/* Badge row */}
        <div className="mb-3 flex items-center gap-2">
          <Laugh className="h-5 w-5 text-rose-400" />
          <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-semibold uppercase tracking-wider text-rose-400">
            <Sparkles className="h-3 w-3" />
            Fun Fact
          </span>
        </div>

        {/* Big stat */}
        <div className="mb-3 text-3xl font-extrabold tracking-tight text-rose-300">
          {milestone.stat}
        </div>

        {/* Title */}
        <h3 className="text-lg font-bold leading-tight">{milestone.title}</h3>
        <p className="mt-1 text-sm text-white/60">{milestone.subtitle}</p>

        {/* Detail quip */}
        {milestone.detail && (
          <p className="mt-2.5 text-sm italic text-white/40">
            “{milestone.detail}”
          </p>
        )}

        {/* Branding footer */}
        <div className="mt-6 flex items-center gap-3 border-t border-white/10 pt-4">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-to-br from-rose-500 to-amber-500 text-xs font-bold">
            W
          </div>
          <div>
            <span className="text-xs font-medium text-white/70">
              {displayName ? `${displayName} · ` : ""}Tracked with Wealth
            </span>
            <span className="block text-[10px] text-white/40">{dateLabel}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
