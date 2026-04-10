import type { ReactNode } from "react";

type DecisionMetricCardProps = {
  eyebrow: string;
  title: string;
  subtitle?: string;
  interpretation?: string;
  action?: ReactNode;
};

export function DecisionMetricCard({
  eyebrow,
  title,
  subtitle,
  interpretation,
  action,
}: DecisionMetricCardProps) {
  return (
    <article className="decision-metric-card">
      <p className="decision-eyebrow">{eyebrow}</p>
      <h3 className="text-lg font-semibold tracking-tight text-foreground">{title}</h3>
      {subtitle ? (
        <p className="text-sm leading-relaxed text-muted-foreground">{subtitle}</p>
      ) : null}
      {interpretation ? (
        <p className="decision-interpretation">{interpretation}</p>
      ) : null}
      {action ? <div className="pt-2">{action}</div> : null}
    </article>
  );
}
