import type { ReactNode } from "react";

import { SecondaryPageIntro } from "@/components/SecondaryPageIntro";
import type { InvestmentsCockpitModel } from "@/components/investments/investments-cockpit";
import { formatCurrency } from "@/lib/formatCurrency";

type InvestmentsCockpitIntroProps = {
  readonly model: InvestmentsCockpitModel;
  readonly totalInvestmentValue: number;
  readonly totalGainLoss: number;
  readonly totalGainLossPercent: number;
  readonly totalRealizedGain: number;
  readonly currency: string;
  readonly actionShelfContent: ReactNode;
  readonly heroAction?: ReactNode;
};

export function InvestmentsCockpitIntro({
  model,
  totalInvestmentValue,
  totalGainLoss,
  totalGainLossPercent,
  totalRealizedGain,
  currency,
  actionShelfContent,
  heroAction,
}: InvestmentsCockpitIntroProps) {
  return (
    <SecondaryPageIntro
      heroEyebrow="Portfolio health"
      heroTitle={model.heroTitle}
      heroDescription={model.heroDescription}
      heroAction={heroAction}
      heroAside={(
        <div className="grid gap-2 sm:grid-cols-3">
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Portfolio value</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {formatCurrency(totalInvestmentValue, currency)}
            </p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Open return</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {totalGainLoss >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(totalGainLoss), currency)}
            </p>
            <p className="mt-1 text-xs text-white/65">
              {totalGainLossPercent >= 0 ? "+" : ""}
              {totalGainLossPercent.toFixed(2)}% overall
            </p>
          </div>
          <div className="workspace-hero-panel rounded-2xl p-3">
            <p className="text-xs uppercase tracking-[0.18em] text-white/60">Realised gains</p>
            <p className="mt-1 text-lg font-semibold text-white">
              {totalRealizedGain >= 0 ? "+" : "−"}
              {formatCurrency(Math.abs(totalRealizedGain), currency)}
            </p>
          </div>
        </div>
      )}
      actionShelfEyebrow="Portfolio tools"
      actionShelfTitle="Keep maintenance, grouping, and adds close at hand"
      actionShelfDescription="These controls stay nearby so concentration, data quality, and realised gains can stay above the chart and table detail."
      actionShelfContent={actionShelfContent}
      priorities={{
        eyebrow: "Priority stack",
        title: "Keep concentration, data quality, and realised gains visible first",
        description: "Read the portfolio story here before you move into confirmation charts and the full holdings roster.",
        items: model.priorityCards.map((card) => ({
          id: card.id,
          title: card.title,
          description: card.description,
        })),
      }}
    />
  );
}
