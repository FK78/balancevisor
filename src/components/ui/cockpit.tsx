"use client";

import type { ComponentPropsWithoutRef, ElementType, ReactNode } from "react";

import { cn } from "@/lib/utils";

type HeadingLevel = "h1" | "h2" | "h3";

interface CockpitHeroProps extends ComponentPropsWithoutRef<"section"> {
  readonly eyebrow: string;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly aside?: ReactNode;
  readonly titleAs?: HeadingLevel;
}

export function CockpitHero({
  eyebrow,
  title,
  description,
  action,
  aside,
  titleAs = "h1",
  className,
  children,
  ...props
}: CockpitHeroProps) {
  const TitleTag = titleAs as ElementType;

  return (
    <section className={cn("cockpit-hero", className)} data-slot="cockpit-hero" {...props}>
      <div className="cockpit-hero-copy">
        <p className="cockpit-kicker">{eyebrow}</p>
        <TitleTag className="cockpit-title">{title}</TitleTag>
        <p className="cockpit-body">{description}</p>
        {action ? <div className="pt-1">{action}</div> : null}
        {children ? <div className="pt-1">{children}</div> : null}
      </div>
      {aside ? <div className="cockpit-hero-aside">{aside}</div> : null}
    </section>
  );
}

interface SectionPanelProps extends ComponentPropsWithoutRef<"section"> {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
  readonly titleAs?: HeadingLevel;
}

export function ActionShelf({
  eyebrow,
  title,
  description,
  titleAs = "h2",
  className,
  children,
  ...props
}: SectionPanelProps) {
  const TitleTag = titleAs as ElementType;

  return (
    <section className={cn("action-shelf", className)} data-slot="action-shelf" {...props}>
      <div className="space-y-1.5">
        <p className="cockpit-kicker">{eyebrow}</p>
        <TitleTag className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </TitleTag>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="action-shelf-content">{children}</div>
    </section>
  );
}

export function PriorityStack({
  eyebrow,
  title,
  description,
  titleAs = "h2",
  className,
  children,
  ...props
}: SectionPanelProps) {
  const TitleTag = titleAs as ElementType;

  return (
    <section className={cn("priority-stack", className)} data-slot="priority-stack" {...props}>
      <div className="space-y-1.5">
        <p className="cockpit-kicker">{eyebrow}</p>
        <TitleTag className="text-xl font-semibold tracking-tight text-foreground">
          {title}
        </TitleTag>
        {description ? (
          <p className="text-sm leading-6 text-muted-foreground">{description}</p>
        ) : null}
      </div>
      <div className="priority-stack-grid">{children}</div>
    </section>
  );
}

interface PriorityCardProps extends ComponentPropsWithoutRef<"article"> {
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly eyebrow?: string;
}

export function PriorityCard({
  title,
  description,
  action,
  eyebrow,
  className,
  ...props
}: PriorityCardProps) {
  return (
    <article className={cn("priority-card", className)} data-slot="priority-card" {...props}>
      {eyebrow ? <p className="cockpit-kicker text-[10px]">{eyebrow}</p> : null}
      <h3 className="text-base font-semibold tracking-tight text-foreground">{title}</h3>
      <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      {action ? <div className="pt-1">{action}</div> : null}
    </article>
  );
}

export function SectionHeader({
  eyebrow,
  title,
  description,
  titleAs = "h2",
  className,
  ...props
}: Omit<SectionPanelProps, "children">) {
  const TitleTag = titleAs as ElementType;

  return (
    <header className={cn("space-y-1.5", className)} data-slot="section-header" {...props}>
      <p className="cockpit-kicker">{eyebrow}</p>
      <TitleTag className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </TitleTag>
      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
    </header>
  );
}

export function SoftPanel({
  eyebrow,
  title,
  description,
  titleAs = "h2",
  className,
  children,
  ...props
}: SectionPanelProps) {
  const TitleTag = titleAs as ElementType;

  return (
    <section className={cn("soft-panel", className)} data-slot="soft-panel" {...props}>
      <p className="cockpit-kicker">{eyebrow}</p>
      <TitleTag className="text-xl font-semibold tracking-tight text-foreground">
        {title}
      </TitleTag>
      {description ? (
        <p className="text-sm leading-6 text-muted-foreground">{description}</p>
      ) : null}
      {children ? <div className="pt-2">{children}</div> : null}
    </section>
  );
}
