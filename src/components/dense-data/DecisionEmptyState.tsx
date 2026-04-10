import type { ReactNode } from "react";

type DecisionEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function DecisionEmptyState({
  title,
  description,
  action,
}: DecisionEmptyStateProps) {
  return (
    <section className="decision-empty-state">
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      {action ? <div className="pt-2">{action}</div> : null}
    </section>
  );
}
