import { createHmac } from "crypto";
import type { BrokerAdapter, BrokerCredentials, BrokerPosition, BrokerSummary } from "./types";

const BASE_URL = "https://api.binance.com";

type BinanceBalance = {
  asset: string;
  free: string;
  locked: string;
};

type BinanceAccountInfo = {
  balances: BinanceBalance[];
};

type BinanceTickerPrice = {
  symbol: string;
  price: string;
};

function signQuery(secret: string, queryString: string): string {
  return createHmac("sha256", secret).update(queryString).digest("hex");
}

async function binanceFetch<T>(
  creds: BrokerCredentials,
  path: string,
  params: Record<string, string> = {},
): Promise<T> {
  const timestamp = Date.now().toString();
  const allParams = { ...params, timestamp, recvWindow: "5000" };
  const queryString = new URLSearchParams(allParams).toString();
  const signature = signQuery(creds.apiSecret, queryString);
  const url = `${BASE_URL}${path}?${queryString}&signature=${signature}`;

  const res = await fetch(url, {
    headers: {
      "X-MBX-APIKEY": creds.apiKey,
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Binance API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

async function getPrices(): Promise<Map<string, number>> {
  const res = await fetch(`${BASE_URL}/api/v3/ticker/price`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return new Map();

  const tickers = (await res.json()) as BinanceTickerPrice[];
  const prices = new Map<string, number>();
  for (const t of tickers) {
    prices.set(t.symbol, parseFloat(t.price));
  }
  return prices;
}

export const binanceAdapter: BrokerAdapter = {
  source: "binance",
  label: "Binance",
  authType: "api_key",

  async getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]> {
    const [accountInfo, prices] = await Promise.all([
      binanceFetch<BinanceAccountInfo>(creds, "/api/v3/account"),
      getPrices(),
    ]);

    const nonZero = accountInfo.balances.filter((b) => {
      const total = parseFloat(b.free) + parseFloat(b.locked);
      return total > 0;
    });

    return nonZero.map((b) => {
      const quantity = parseFloat(b.free) + parseFloat(b.locked);
      // Try to get USDT price; stablecoins map to 1
      const usdtPair = `${b.asset}USDT`;
      const priceUsd = b.asset === "USDT" || b.asset === "BUSD" || b.asset === "USDC"
        ? 1
        : prices.get(usdtPair) ?? 0;
      const value = quantity * priceUsd;

      return {
        ticker: b.asset,
        name: b.asset,
        quantity,
        averagePrice: priceUsd,
        currentPrice: priceUsd,
        currency: "USD",
        value,
        gainLoss: 0,
        gainLossPercent: 0,
        investmentType: "crypto" as const,
      };
    });
  },

  async getSummary(creds: BrokerCredentials): Promise<BrokerSummary> {
    const positions = await this.getPositions(creds);
    const totalValue = positions.reduce((sum, p) => sum + p.value, 0);

    return {
      totalValue,
      cash: 0,
      positions,
    };
  },
};
