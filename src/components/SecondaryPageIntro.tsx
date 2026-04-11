"use client";

import type { ReactNode } from "react";
import {
  ActionShelf,
  CockpitHero,
  PriorityCard,
  PriorityStack,
  SoftPanel,
} from "@/components/ui/cockpit";

interface SecondaryPagePriorityItem {
  readonly id: string;
  readonly title: string;
  readonly description: string;
  readonly action?: ReactNode;
  readonly eyebrow?: string;
}

interface SecondaryPageSupportPanel {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
  readonly content: ReactNode;
}

interface SecondaryPagePrioritySection {
  readonly eyebrow: string;
  readonly title: string;
  readonly description?: string;
  readonly items: readonly SecondaryPagePriorityItem[];
}

interface SecondaryPageIntroProps {
  readonly heroEyebrow: string;
  readonly heroTitle: string;
  readonly heroDescription: string;
  readonly heroAction?: ReactNode;
  readonly heroAside?: ReactNode;
  readonly actionShelfEyebrow: string;
  readonly actionShelfTitle: string;
  readonly actionShelfDescription?: string;
  readonly actionShelfContent: ReactNode;
  readonly supportPanel?: SecondaryPageSupportPanel | null;
  readonly priorities: SecondaryPagePrioritySection;
}

export function SecondaryPageIntro({
  heroEyebrow,
  heroTitle,
  heroDescription,
  heroAction,
  heroAside,
  actionShelfEyebrow,
  actionShelfTitle,
  actionShelfDescription,
  actionShelfContent,
  supportPanel,
  priorities,
}: SecondaryPageIntroProps) {
  return (
    <div className="space-y-5 md:space-y-6">
      <CockpitHero
        eyebrow={heroEyebrow}
        title={heroTitle}
        description={heroDescription}
        action={heroAction}
        aside={heroAside}
        titleAs="h2"
      />

      <ActionShelf
        eyebrow={actionShelfEyebrow}
        title={actionShelfTitle}
        description={actionShelfDescription}
      >
        {actionShelfContent}
      </ActionShelf>

      {supportPanel ? (
        <SoftPanel
          eyebrow={supportPanel.eyebrow}
          title={supportPanel.title}
          description={supportPanel.description}
        >
          {supportPanel.content}
        </SoftPanel>
      ) : null}

      <PriorityStack
        eyebrow={priorities.eyebrow}
        title={priorities.title}
        description={priorities.description}
      >
        {priorities.items.map((item) => (
          <PriorityCard
            key={item.id}
            eyebrow={item.eyebrow}
            title={item.title}
            description={item.description}
            action={item.action}
          />
        ))}
      </PriorityStack>
    </div>
  );
}
