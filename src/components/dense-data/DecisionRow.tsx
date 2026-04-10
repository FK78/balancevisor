import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type DecisionRowProps = {
  title: string;
  amount: string;
  amountTone?: "neutral" | "positive" | "negative" | "warning";
  meta: string[];
  interpretation?: string;
  statusLabel?: string;
  action?: ReactNode;
  className?: string;
};

const amountToneClassMap = {
  neutral: "text-foreground",
  positive: "text-emerald-700 dark:text-emerald-400",
  negative: "text-rose-700 dark:text-rose-400",
  warning: "text-amber-700 dark:text-amber-400",
} as const;

export function DecisionRow({
  title,
  amount,
  amountTone = "neutral",
  meta,
  interpretation,
  statusLabel,
  action,
  className,
}: DecisionRowProps) {
  return (
    <article className={cn("decision-row", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <h3 className="decision-eyebrow text-[0.72rem]">{title}</h3>
          <p className={cn("decision-amount", amountToneClassMap[amountTone])}>
            {amount}
          </p>
        </div>
        {statusLabel ? (
          <span className="rounded-full border border-border/70 px-2 py-1 text-[0.65rem] font-medium uppercase tracking-[0.12em] text-muted-foreground">
            {statusLabel}
          </span>
        ) : null}
      </header>

      {meta.length > 0 ? (
        <ul className="decision-meta">
          {meta.map((item, index) => (
            <li key={`${item}-${index}`}>{item}</li>
          ))}
        </ul>
      ) : null}

      {interpretation ? (
        <p className="decision-interpretation">{interpretation}</p>
      ) : null}

      {action ? <div className="pt-1">{action}</div> : null}
    </article>
  );
}
