import type { BrokerAdapter, BrokerCredentials, BrokerPosition, BrokerSummary } from "./types";
import { getSubUnitDivisor, toMajorCurrency } from "@/lib/currency";

const BASE_URL = "https://api.ibkr.com/v1/api";

type IBKRPosition = {
  acctId: string;
  conid: number;
  contractDesc: string;
  ticker: string;
  position: number;
  mktPrice: number;
  mktValue: number;
  avgCost: number;
  avgPrice: number;
  unrealizedPnl: number;
  currency: string;
  assetClass: string;
};

type IBKRAccount = {
  id: string;
  accountId: string;
  type: string;
};

type IBKRAccountSummary = {
  [key: string]: {
    amount: number;
    currency: string;
    isNull: boolean;
  };
};

async function ibkrFetch<T>(
  creds: BrokerCredentials,
  path: string,
): Promise<T> {
  const token = creds.accessToken;
  if (!token) {
    throw new Error("IBKR requires an OAuth access token. Please reconnect your account.");
  }

  const res = await fetch(`${BASE_URL}${path}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(15_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`IBKR API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const ibkrAdapter: BrokerAdapter = {
  source: "ibkr",
  label: "Interactive Brokers",
  authType: "oauth",

  async getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]> {
    // Get accounts first
    const accounts = await ibkrFetch<IBKRAccount[]>(creds, "/portfolio/accounts");
    if (accounts.length === 0) return [];

    const accountId = accounts[0].id;
    const positions = await ibkrFetch<IBKRPosition[]>(
      creds,
      `/portfolio/${accountId}/positions/0`,
    );

    return positions.map((pos) => {
      const rawCurrency = pos.currency ?? "USD";
      const divisor = getSubUnitDivisor(rawCurrency);
      const currency = toMajorCurrency(rawCurrency);

      const avgPrice = pos.avgPrice / divisor;
      const currentPrice = pos.mktPrice / divisor;
      const value = pos.mktValue / divisor;
      const cost = pos.avgCost * pos.position / divisor;
      const gainLoss = pos.unrealizedPnl / divisor;
      const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

      let investmentType: BrokerPosition["investmentType"] = "stock";
      if (pos.assetClass === "CRYPTO") investmentType = "crypto";
      else if (pos.assetClass === "ETF" || pos.assetClass === "FUT") investmentType = "etf";

      return {
        ticker: pos.ticker ?? pos.contractDesc,
        name: pos.contractDesc,
        quantity: pos.position,
        averagePrice: avgPrice,
        currentPrice,
        currency,
        value,
        gainLoss,
        gainLossPercent,
        investmentType,
      };
    });
  },

  async getSummary(creds: BrokerCredentials): Promise<BrokerSummary> {
    const [positions, accounts] = await Promise.all([
      this.getPositions(creds),
      ibkrFetch<IBKRAccount[]>(creds, "/portfolio/accounts"),
    ]);

    let cash = 0;
    let totalValue = 0;

    if (accounts.length > 0) {
      try {
        const accountId = accounts[0].id;
        const summary = await ibkrFetch<IBKRAccountSummary>(
          creds,
          `/portfolio/${accountId}/summary`,
        );
        totalValue = summary?.totalcashvalue?.amount ?? 0;
        cash = summary?.availablefunds?.amount ?? 0;
        const positionsValue = positions.reduce((s, p) => s + p.value, 0);
        totalValue = positionsValue + cash;
      } catch {
        totalValue = positions.reduce((s, p) => s + p.value, 0);
      }
    }

    return {
      totalValue,
      cash,
      positions,
    };
  },
};
