import { formatCurrency } from "@/lib/formatCurrency";

type HoldingInput = {
  id: string;
  source: string;
  ticker: string | null;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  investmentType: string;
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

type BrokerErrorInput = {
  broker: string;
  message: string;
};

type PrimaryActionKey =
  | "reconnect-broker"
  | "refresh-prices"
  | "review-concentration"
  | "add-holding";

type PrimaryAction = {
  key: PrimaryActionKey;
  label: string;
  description: string;
};

type PriorityCard = {
  id: string;
  title: string;
  description: string;
};

type ModelHolding = {
  id: string;
  ticker: string | null;
  name: string;
  quantity: number;
  value: number;
  interpretation: string | null;
};

type ModelGroup = {
  id: string | null;
  title: string;
  holdings: ModelHolding[];
};

type AccountSection = {
  accountId: string | null;
  accountName: string | null;
  groups: ModelGroup[];
};

export type InvestmentsCockpitModel = {
  heroTitle: string;
  heroDescription: string;
  primaryAction: PrimaryAction;
  priorityCards: PriorityCard[];
  accountSections: AccountSection[];
};

type BuildInvestmentsCockpitModelParams = {
  holdings: HoldingInput[];
  brokerErrors: BrokerErrorInput[];
  brokerCash: number;
  totalRealizedGain: number;
  baseCurrency: string;
  allGroups: GroupInput[];
};

function selectPrimaryAction(params: {
  brokerErrors: BrokerErrorInput[];
  stalePriceCount: number;
  concentrationShare: number;
}): PrimaryAction {
  if (params.brokerErrors.length > 0) {
    return {
      key: "reconnect-broker",
      label: "Reconnect broker",
      description: "Restore sync before reviewing the rest of the portfolio.",
    };
  }

  if (params.stalePriceCount > 0) {
    return {
      key: "refresh-prices",
      label: "Refresh prices",
      description: "Bring stale manual prices up to date before making decisions.",
    };
  }

  if (params.concentrationShare >= 0.35) {
    return {
      key: "review-concentration",
      label: "Review concentration",
      description: "Check whether the largest position has become too dominant.",
    };
  }

  return {
    key: "add-holding",
    label: "Add holding",
    description: "Keep building the portfolio when you are ready.",
  };
}

function buildHeroCopy(primaryAction: PrimaryAction, brokerErrorCount: number, stalePriceCount: number, concentrationShare: number) {
  if (primaryAction.key === "reconnect-broker") {
    return {
      heroTitle: "Your broker connection needs attention",
      heroDescription:
        brokerErrorCount === 1
          ? "One broker feed is failing, so recover the connection before trusting the rest of the portfolio story."
          : "Multiple broker feeds are failing, so recover those connections before trusting the rest of the portfolio story.",
    };
  }

  if (primaryAction.key === "refresh-prices") {
    return {
      heroTitle: "Some holdings need fresher prices",
      heroDescription:
        stalePriceCount === 1
          ? "One manual holding is waiting on a price refresh, so update data before treating the portfolio as settled."
          : "Several manual holdings are waiting on price refreshes, so update data before treating the portfolio as settled.",
    };
  }

  if (primaryAction.key === "review-concentration") {
    return {
      heroTitle: "A large position is shaping the portfolio",
      heroDescription: `The biggest holding makes up ${Math.round(concentrationShare * 100)}% of the portfolio, so check whether the mix still feels comfortable.`,
    };
  }

  return {
    heroTitle: "Portfolio balance looks calm",
    heroDescription:
      "The portfolio is stable for now, so keep the next action lightweight and easy to return to.",
  };
}

function buildPriorityCards(params: {
  brokerErrors: BrokerErrorInput[];
  stalePriceCount: number;
  concentrationShare: number;
  totalRealizedGain: number;
  baseCurrency: string;
}): PriorityCard[] {
  const cards: PriorityCard[] = [
    {
      id: "broker-health",
      title:
        params.brokerErrors.length > 0
          ? `${params.brokerErrors.length} broker connection issue${params.brokerErrors.length === 1 ? "" : "s"}`
          : params.stalePriceCount > 0
            ? `${params.stalePriceCount} holding${params.stalePriceCount === 1 ? "" : "s"} need fresher prices`
            : params.concentrationShare >= 0.35
              ? `${Math.round(params.concentrationShare * 100)}% in the largest position`
              : "Broker feeds are calm",
      description:
        params.brokerErrors.length > 0
          ? "Fix broken connections first so the rest of the portfolio data can be trusted."
          : "Keep data quality visible before deeper analysis.",
    },
    {
      id: "concentration",
      title:
        params.concentrationShare >= 0.35
          ? "Concentration deserves a look"
          : "No single position is dominating",
      description: "Holdings are easier to interpret when the largest position is obvious.",
    },
    {
      id: "realized-gains",
      title:
        params.totalRealizedGain < 0
          ? `-${formatCurrency(params.totalRealizedGain, params.baseCurrency)} realised`
          : `${formatCurrency(params.totalRealizedGain, params.baseCurrency)} realised`,
      description: "Closed gains stay visible alongside the open portfolio story.",
    },
  ];

  return cards;
}

function buildAccountSections(holdings: HoldingInput[], allGroups: GroupInput[]): AccountSection[] {
  const sortedHoldings = [...holdings].sort((a, b) => b.value - a.value);
  const largestHoldingId = sortedHoldings[0]?.id ?? null;
  const accountSummaries = Array.from(
    new Map(
      sortedHoldings.map((holding) => {
        const accountKey = holding.accountId ?? "__ungrouped__";
        return [
          accountKey,
          {
            accountKey,
            accountId: holding.accountId ?? null,
            accountName: holding.accountName ?? null,
            totalValue: 0,
          },
        ] as const;
      }),
    ).values(),
  );

  for (const holding of sortedHoldings) {
    const accountKey = holding.accountId ?? "__ungrouped__";
    const summary = accountSummaries.find((entry) => entry.accountKey === accountKey);
    if (summary) {
      summary.totalValue += holding.value;
    }
  }

  const accountOrder = accountSummaries
    .sort((a, b) => b.totalValue - a.totalValue || (a.accountName ?? a.accountKey).localeCompare(b.accountName ?? b.accountKey))
    .map((summary) => summary.accountKey);

  return accountOrder.map((accountKey) => {
    const accountId = accountKey === "__ungrouped__" ? null : accountKey;
    const accountHoldings = sortedHoldings.filter((holding) => (holding.accountId ?? "__ungrouped__") === accountKey);
    const accountName = accountHoldings[0]?.accountName ?? null;
    const accountGroups = allGroups.filter((group) => group.account_id === accountId);

    const ungroupedHoldings = accountHoldings.filter(
      (holding) => !holding.groupId || !accountGroups.some((group) => group.id === holding.groupId),
    );

    const groups: ModelGroup[] = [
      {
        id: null,
        title: "Individual holdings",
        holdings: ungroupedHoldings.map((holding) => ({
          id: holding.id,
          ticker: holding.ticker,
          name: holding.name,
          quantity: holding.quantity,
          value: holding.value,
          interpretation: holding.pricePending
            ? "Manual price needs refreshing"
            : holding.id === largestHoldingId
              ? "Largest position in portfolio"
              : null,
        })),
      },
      ...accountGroups.map((group) => ({
        id: group.id,
        title: group.name,
        holdings: accountHoldings
          .filter((holding) => holding.groupId === group.id)
          .map((holding) => ({
            id: holding.id,
            ticker: holding.ticker,
            name: holding.name,
            quantity: holding.quantity,
            value: holding.value,
            interpretation: holding.pricePending
              ? "Manual price needs refreshing"
              : holding.id === largestHoldingId
                ? "Largest position in portfolio"
                : null,
          })),
      })),
    ];

    return {
      accountId,
      accountName,
      groups,
    };
  });
}

export function buildInvestmentsCockpitModel(params: BuildInvestmentsCockpitModelParams): InvestmentsCockpitModel {
  const stalePriceCount = params.holdings.filter((holding) => holding.pricePending).length;
  const totalValue = params.holdings.reduce((sum, holding) => sum + holding.value, 0) + params.brokerCash;
  const largestHoldingShare = totalValue > 0 ? params.holdings.reduce((max, holding) => Math.max(max, holding.value), 0) / totalValue : 0;

  const primaryAction = selectPrimaryAction({
    brokerErrors: params.brokerErrors,
    stalePriceCount,
    concentrationShare: largestHoldingShare,
  });

  const { heroTitle, heroDescription } = buildHeroCopy(
    primaryAction,
    params.brokerErrors.length,
    stalePriceCount,
    largestHoldingShare,
  );

  return {
    heroTitle,
    heroDescription,
    primaryAction,
    priorityCards: buildPriorityCards({
      brokerErrors: params.brokerErrors,
      stalePriceCount,
      concentrationShare: largestHoldingShare,
      totalRealizedGain: params.totalRealizedGain,
      baseCurrency: params.baseCurrency,
    }),
    accountSections: buildAccountSections(params.holdings, params.allGroups),
  };
}
