import type { ReactNode } from "react";

import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";
import type { CategoriesCockpitModel } from "@/components/categories/categories-cockpit";
import { formatCurrency } from "@/lib/formatCurrency";

type CategoriesCockpitIntroProps = {
  readonly model: CategoriesCockpitModel;
  readonly totalTrackedSpend: number;
  readonly categoryCount: number;
  readonly ruleCount: number;
  readonly currency: string;
  readonly actionShelfContent: ReactNode;
  readonly heroAction?: ReactNode;
};

export function CategoriesCockpitIntro({
  model,
  totalTrackedSpend,
  categoryCount,
  ruleCount,
  currency,
  actionShelfContent,
  heroAction,
}: CategoriesCockpitIntroProps) {
  return (
    <SecondaryPageIntro
      heroEyebrow="Spending structure"
      heroTitle={model.heroTitle}
      heroDescription={model.heroDescription}
      heroAction={heroAction}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Tracked spend</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(totalTrackedSpend, currency)}
            </p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Categories</p>
            <p className="mt-1 text-lg font-semibold text-white">{categoryCount}</p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Rules</p>
            <p className="mt-1 text-lg font-semibold text-white">{ruleCount}</p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Category tools"
      actionShelfTitle="Keep maintenance nearby, but let structure lead the page"
      actionShelfDescription="Use these controls to add categories and automation once the charts and structure cards have told you what is actually changing."
      actionShelfContent={actionShelfContent}
      priorities={{
        eyebrow: "Priority stack",
        title: "Read structure, automation, and movement before maintenance lists",
        description: "These cards keep the main story visible before you drop into the category grid and rule quality control.",
        items: model.priorityCards,
      }}
    />
  );
}
