import type { ReactNode } from "react";

import {
  ActionShelf,
  CockpitHero,
  PriorityStack,
} from "@/components/ui/cockpit";

interface ZakatPageContentProps {
  readonly heroAside?: ReactNode;
  readonly heroAction?: ReactNode;
  readonly actionShelf: ReactNode;
  readonly priorityCards: ReactNode;
  readonly detailContent: ReactNode;
}

export function ZakatPageContent({
  heroAside,
  heroAction,
  actionShelf,
  priorityCards,
  detailContent,
}: ZakatPageContentProps) {
  return (
    <div className="cockpit-page mx-auto max-w-7xl px-4 py-6 md:px-10 md:py-10">
      <div className="space-y-6 md:space-y-8">
        <CockpitHero
          eyebrow="Zakat"
          title="Know what is due and when to prepare"
          description="The due-now picture comes first, so your anniversary, nisab status, and next action stay clear before the deeper breakdown."
          action={heroAction}
          aside={heroAside}
        />

        <ActionShelf
          eyebrow="Due-now summary"
          title="Start from the obligation before opening the full breakdown"
          description="This top section keeps the calculation outcome, timing, and manual actions close together."
        >
          {actionShelf}
        </ActionShelf>

        <PriorityStack
          eyebrow="What matters most"
          title="Keep the next zakat decision simple"
          description="These cues frame whether you need to prepare funds, revisit assumptions, or simply wait for the next anniversary."
        >
          {priorityCards}
        </PriorityStack>

        <section className="space-y-4">
          <div className="space-y-1">
            <p className="cockpit-kicker">Detailed view</p>
            <h2 className="text-xl font-semibold tracking-tight text-foreground">
              Review the calculation breakdown only after the headline picture is clear.
            </h2>
          </div>
          {detailContent}
        </section>
      </div>
    </div>
  );
}
