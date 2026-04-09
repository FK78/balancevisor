import { createHmac } from "crypto";
import type { BrokerAdapter, BrokerCredentials, BrokerPosition, BrokerSummary } from "./types";

const BASE_URL = "https://api.coinbase.com";

type CoinbaseAccount = {
  id: string;
  name: string;
  balance: { amount: string; currency: string };
  native_balance: { amount: string; currency: string };
  type: string;
  currency: { code: string; name: string };
};

type CoinbaseResponse = {
  data: CoinbaseAccount[];
  pagination?: { next_uri: string | null };
};

function signRequest(
  secret: string,
  timestamp: string,
  method: string,
  path: string,
  body: string = "",
): string {
  const message = timestamp + method.toUpperCase() + path + body;
  return createHmac("sha256", secret).update(message).digest("hex");
}

async function coinbaseFetch<T>(
  creds: BrokerCredentials,
  method: string,
  path: string,
): Promise<T> {
  const timestamp = Math.floor(Date.now() / 1000).toString();
  const signature = signRequest(creds.apiSecret, timestamp, method, path);

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers: {
      "CB-ACCESS-KEY": creds.apiKey,
      "CB-ACCESS-SIGN": signature,
      "CB-ACCESS-TIMESTAMP": timestamp,
      "CB-VERSION": "2024-01-01",
      "Content-Type": "application/json",
    },
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Coinbase API error ${res.status}: ${text}`);
  }

  return res.json() as Promise<T>;
}

export const coinbaseAdapter: BrokerAdapter = {
  source: "coinbase",
  label: "Coinbase",
  authType: "api_key",

  async getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]> {
    const accounts: CoinbaseAccount[] = [];
    let nextUri: string | null = "/v2/accounts?limit=100";

    while (nextUri) {
      const response: CoinbaseResponse = await coinbaseFetch<CoinbaseResponse>(creds, "GET", nextUri);
      accounts.push(...response.data);
      nextUri = response.pagination?.next_uri ?? null;
    }

    return accounts
      .filter((a) => parseFloat(a.balance.amount) > 0)
      .map((a) => {
        const quantity = parseFloat(a.balance.amount);
        const nativeValue = parseFloat(a.native_balance.amount);
        // Coinbase doesn't provide cost basis via simple API — set average = current
        const currentPrice = quantity > 0 ? nativeValue / quantity : 0;

        return {
          ticker: a.currency.code,
          name: a.currency.name,
          quantity,
          averagePrice: currentPrice,
          currentPrice,
          currency: a.native_balance.currency,
          value: nativeValue,
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
