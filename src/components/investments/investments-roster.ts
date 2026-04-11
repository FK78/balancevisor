import type { ReactNode } from "react";

import type { HoldingsRosterSection } from "@/components/investments/HoldingsRoster";
import type { InvestmentsCockpitModel } from "@/components/investments/investments-cockpit";
import type { BrokerSource } from "@/lib/brokers/types";
import { formatCurrency } from "@/lib/formatCurrency";

export type InvestmentsRosterHoldingInput = {
  id: string;
  source: BrokerSource | "manual";
  ticker: string | null;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  investmentType: "stock" | "crypto" | "etf" | "real_estate" | "private_equity" | "other";
  estimatedReturnPercent?: number | null;
  notes?: string | null;
  manualId?: string;
  accountId?: string | null;
  accountName?: string | null;
  groupId?: string | null;
  groupName?: string | null;
  groupColor?: string | null;
  pricePending?: boolean;
};

type GroupInput = {
  id: string;
  name: string;
  color: string;
  account_id: string | null;
};

type InvestmentAccountOption = {
  id: string;
  accountName: string;
};

type GroupOption = {
  id: string;
  name: string;
  color: string;
  account_id: string | null;
};

type BuildInvestmentsRosterSectionsParams = {
  accountSections: InvestmentsCockpitModel["accountSections"];
  holdings: readonly InvestmentsRosterHoldingInput[];
  allGroups: readonly GroupInput[];
  investmentAccounts: InvestmentAccountOption[];
  groupOptions: GroupOption[];
  baseCurrency: string;
  renderGroupActions?: (params: {
    group: GroupInput;
    investmentAccounts: InvestmentAccountOption[];
  }) => ReactNode;
  renderHoldingActions?: (params: {
    holding: InvestmentsRosterHoldingInput;
    investmentAccounts: InvestmentAccountOption[];
    groupOptions: GroupOption[];
  }) => ReactNode;
  getSourceLabel?: (holding: InvestmentsRosterHoldingInput) => string;
  getInvestmentTypeLabel: (investmentType: InvestmentsRosterHoldingInput["investmentType"]) => string;
  getGainTone: (
    holding: InvestmentsRosterHoldingInput,
  ) => "neutral" | "positive" | "negative" | "warning";
};

function formatSignedCurrency(value: number, currency: string) {
  return `${value >= 0 ? "+" : "−"}${formatCurrency(Math.abs(value), currency)}`;
}

function findHoldingForStory(params: {
  holdings: readonly InvestmentsRosterHoldingInput[];
  accountId: string | null;
  groupId: string | null;
  storyHoldingId: string;
}) {
  return params.holdings.find((holding) => {
    const matchesAccount = (holding.accountId ?? null) === params.accountId;
    const matchesId = holding.id === params.storyHoldingId;
    const matchesGroup = params.groupId
      ? (holding.groupId ?? null) === params.groupId
      : (holding.groupId ?? null) === null;

    return matchesAccount && matchesId && matchesGroup;
  });
}

export function buildInvestmentsRosterSections({
  accountSections,
  holdings,
  allGroups,
  investmentAccounts,
  groupOptions,
  baseCurrency,
  renderGroupActions,
  renderHoldingActions,
  getSourceLabel,
  getInvestmentTypeLabel,
  getGainTone,
}: BuildInvestmentsRosterSectionsParams): HoldingsRosterSection[] {
  const groupMap = new Map(allGroups.map((group) => [group.id, group]));

  return accountSections.map((section) => ({
    accountId: section.accountId,
    accountName: section.accountName,
    groups: section.groups.map((group) => {
      const groupMeta = group.id ? groupMap.get(group.id) ?? null : null;

      return {
        id: group.id,
        title: group.title,
        actions:
          groupMeta && renderGroupActions
            ? renderGroupActions({
                group: groupMeta,
                investmentAccounts,
              })
            : undefined,
        holdings: group.holdings.flatMap((storyHolding) => {
          const holding = findHoldingForStory({
            holdings,
            accountId: section.accountId,
            groupId: group.id,
            storyHoldingId: storyHolding.id,
          });

          if (!holding) {
            return [];
          }

          return [
            {
              id: holding.id,
              ticker: holding.ticker,
              name: holding.name,
              quantity: holding.quantity,
              value: holding.value,
              interpretation: storyHolding.interpretation,
              contextLabel: getInvestmentTypeLabel(holding.investmentType),
              sourceLabel: getSourceLabel?.(holding),
              currentPriceLabel: holding.pricePending
                ? `Current ${formatCurrency(holding.currentPrice, holding.currency)} · Price pending`
                : `Current ${formatCurrency(holding.currentPrice, holding.currency)}`,
              gainLossLabel: `${formatSignedCurrency(holding.gainLoss, baseCurrency)} (${holding.gainLossPercent >= 0 ? "+" : ""}${holding.gainLossPercent.toFixed(2)}%)`,
              gainLossTone: getGainTone(holding),
              actions: renderHoldingActions
                ? renderHoldingActions({
                    holding,
                    investmentAccounts,
                    groupOptions,
                  })
                : undefined,
            },
          ];
        }),
      };
    }),
  }));
}
