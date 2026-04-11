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
  const cleanMeta = meta
    .filter((item): item is string => Boolean(item && item.trim()))
    .map((item) => item.trim());
  const cleanStatusLabel = statusLabel?.trim();

  return (
    <article className={cn("decision-row", className)}>
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          {cleanStatusLabel ? (
            <p className="decision-eyebrow">
              <span className="decision-status-pill">{cleanStatusLabel}</span>
            </p>
          ) : null}
          <h3 className="text-base font-semibold tracking-tight text-foreground sm:text-lg">
            {title}
          </h3>
        </div>
        <p className={cn("decision-amount text-right", amountToneClassMap[amountTone])}>
          {amount}
        </p>
      </header>

      {cleanMeta.length > 0 ? (
        <ul className="decision-meta">
          {cleanMeta.map((item, index) => (
            <li key={`${item}-${index}`}>
              <span className="decision-meta-pill">{item}</span>
            </li>
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
