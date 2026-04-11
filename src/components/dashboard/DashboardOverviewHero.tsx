import { ArrowUpRight, PiggyBank, TrendingDown } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { formatCompactCurrency, formatCurrency } from "@/lib/formatCurrency";
import { cn } from "@/lib/utils";

interface DashboardOverviewHeroProps {
  readonly displayName: string;
  readonly monthName: string;
  readonly netWorth: number;
  readonly totalAssets: number;
  readonly totalLiabilities: number;
  readonly investmentValue: number;
  readonly currency: string;
}

export function DashboardOverviewHero({
  displayName,
  monthName,
  netWorth,
  totalAssets,
  totalLiabilities,
  investmentValue,
  currency,
}: DashboardOverviewHeroProps) {
  const initials = displayName.trim().charAt(0).toUpperCase() || "W";

  return (
    <section className="workspace-hero rounded-[2rem] px-5 py-5 sm:px-6 sm:py-6">
      <div className="flex flex-col gap-5 sm:flex-row sm:items-start sm:justify-between">
        <div className="space-y-3">
          <Badge className="workspace-accent-chip border-0">{monthName} overview</Badge>
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.24em] text-white/70">
              Net worth
            </p>
            <h2 className={cn("mt-2 text-4xl font-semibold tracking-tight text-white sm:text-5xl", "font-display")}>
              {netWorth < 0 ? "−" : ""}
              {formatCurrency(netWorth, currency)}
            </h2>
            <p className="mt-2 max-w-xl text-sm text-white/75 sm:text-base">
              Your fixed dashboard snapshot stays visible while the workspace tabs below switch the deeper modules.
            </p>
          </div>
        </div>
        <div className="flex items-start justify-between gap-4 sm:flex-col sm:items-end">
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 text-sm font-semibold text-white backdrop-blur">
            {initials}
          </div>
          <div className="rounded-2xl bg-white/8 px-4 py-3 text-right backdrop-blur">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-white/60">
              Workspace
            </p>
            <p className="mt-1 text-base font-semibold text-white">
              {displayName ? `${displayName}'s dashboard` : "Wealth dashboard"}
            </p>
          </div>
        </div>
      </div>

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div className="workspace-hero-panel rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">Assets</span>
            <ArrowUpRight className="h-4 w-4 text-emerald-200" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatCompactCurrency(totalAssets, currency)}
          </p>
        </div>
        <div className="workspace-hero-panel rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">Liabilities</span>
            <TrendingDown className="h-4 w-4 text-rose-200" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatCompactCurrency(totalLiabilities, currency)}
          </p>
        </div>
        <div className="workspace-hero-panel rounded-3xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-white/70">Investments</span>
            <PiggyBank className="h-4 w-4 text-amber-200" />
          </div>
          <p className="mt-3 text-2xl font-semibold text-white">
            {formatCompactCurrency(investmentValue, currency)}
          </p>
        </div>
      </div>
    </section>
  );
}
