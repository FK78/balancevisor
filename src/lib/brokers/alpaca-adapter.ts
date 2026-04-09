import type { BrokerAdapter, BrokerCredentials, BrokerPosition, BrokerSummary } from "./types";

const BASE_URLS: Record<string, string> = {
  live: "https://api.alpaca.markets",
  paper: "https://paper-api.alpaca.markets",
};

type AlpacaAccount = {
  id: string;
  portfolio_value: string;
  cash: string;
  equity: string;
};

type AlpacaPosition = {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  current_price: string;
  asset_marginable: boolean;
};

async function alpacaFetch<T>(
  creds: BrokerCredentials,
  path: string,
): Promise<T> {
  const baseUrl = BASE_URLS[creds.environment] ?? BASE_URLS.live;
  const res = await fetch(`${baseUrl}${path}`, {
    headers: {
      "APCA-API-KEY-ID": creds.apiKey,
      "APCA-API-SECRET-KEY": creds.apiSecret,
      Accept: "application/json",
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Alpaca API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const alpacaAdapter: BrokerAdapter = {
  source: "alpaca",
  label: "Alpaca",
  authType: "api_key",

  async getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]> {
    const positions = await alpacaFetch<AlpacaPosition[]>(creds, "/v2/positions");

    return positions.map((pos) => {
      const avgPrice = parseFloat(pos.avg_entry_price);
      const currentPrice = parseFloat(pos.current_price);
      const quantity = parseFloat(pos.qty);
      const value = parseFloat(pos.market_value);
      const gainLoss = parseFloat(pos.unrealized_pl);
      const gainLossPercent = parseFloat(pos.unrealized_plpc) * 100;

      return {
        ticker: pos.symbol,
        name: pos.symbol,
        quantity,
        averagePrice: avgPrice,
        currentPrice,
        currency: "USD",
        value,
        gainLoss,
        gainLossPercent,
        investmentType: pos.asset_class === "crypto" ? ("crypto" as const) : ("stock" as const),
      };
    });
  },

  async getSummary(creds: BrokerCredentials): Promise<BrokerSummary> {
    const [account, positions] = await Promise.all([
      alpacaFetch<AlpacaAccount>(creds, "/v2/account"),
      this.getPositions(creds),
    ]);

    return {
      totalValue: parseFloat(account.equity),
      cash: parseFloat(account.cash),
      positions,
    };
  },
};
