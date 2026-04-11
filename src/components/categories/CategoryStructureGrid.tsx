import type { ReactNode } from "react";

import { getCategoryIcon } from "@/lib/categoryIcons";

export type CategoryStructureCard = {
  readonly id: string;
  readonly name: string;
  readonly color: string;
  readonly icon: string | null;
  readonly spendShare: number;
  readonly spendLabel: string;
  readonly shareLabel: string;
  readonly structureSignal: string;
  readonly trendLabel: string;
  readonly actions?: ReactNode;
};

type CategoryStructureGridProps = {
  readonly categories: readonly CategoryStructureCard[];
  readonly emptyAction?: ReactNode;
};

export function CategoryStructureGrid({
  categories,
  emptyAction,
}: CategoryStructureGridProps) {
  if (categories.length === 0) {
    return (
      <div className="rounded-[1.75rem] border border-dashed border-border/70 bg-card/70 p-8 text-center shadow-sm">
        <div className="mx-auto max-w-md space-y-3">
          <p className="text-sm font-semibold tracking-tight text-foreground">
            No category structure yet
          </p>
          <p className="text-sm leading-6 text-muted-foreground">
            Start by adding the categories that explain how your spending is grouped, then come back for rules and refinements.
          </p>
          {emptyAction ? <div className="pt-1">{emptyAction}</div> : null}
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {categories.map((category) => {
        const Icon = getCategoryIcon(category.icon);

        return (
          <article
            key={category.id}
            data-testid={`category-structure-card-${category.id}`}
            className="rounded-[1.75rem] border border-border/70 bg-card/80 p-5 shadow-sm"
          >
            <div className="flex items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <div
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl"
                  style={{ backgroundColor: `${category.color}18` }}
                >
                  {Icon ? (
                    <Icon className="h-5 w-5" style={{ color: category.color }} />
                  ) : (
                    <span
                      className="inline-block h-3.5 w-3.5 rounded-full"
                      style={{ backgroundColor: category.color }}
                    />
                  )}
                </div>
                <div className="space-y-1">
                  <p className="text-lg font-semibold tracking-tight text-foreground">
                    {category.name}
                  </p>
                  <p className="text-sm text-muted-foreground">{category.spendLabel}</p>
                </div>
              </div>
              {category.actions ? <div className="shrink-0">{category.actions}</div> : null}
            </div>

            <div className="mt-5 grid gap-3 sm:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)]">
              <div className="rounded-2xl border border-border/60 bg-muted/30 p-4">
                <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                  Spend share
                </p>
                <p className="mt-2 text-2xl font-semibold tracking-tight text-foreground">
                  {Math.round(category.spendShare)}%
                </p>
                <p className="mt-1 text-sm text-muted-foreground">{category.shareLabel}</p>
                <div className="mt-3 h-2 overflow-hidden rounded-full bg-muted">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${Math.min(Math.max(category.spendShare, 0), 100)}%`,
                      backgroundColor: category.color,
                    }}
                  />
                </div>
              </div>

              <div className="grid gap-3">
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Structure signal
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                    {category.structureSignal}
                  </p>
                </div>
                <div className="rounded-2xl border border-border/60 p-4">
                  <p className="text-xs uppercase tracking-[0.18em] text-muted-foreground">
                    Trend
                  </p>
                  <p className="mt-2 text-sm font-medium leading-6 text-foreground">
                    {category.trendLabel}
                  </p>
                </div>
              </div>
            </div>
          </article>
        );
      })}
    </div>
  );
}
