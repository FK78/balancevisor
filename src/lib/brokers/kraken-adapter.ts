import { createHmac, createHash } from "crypto";
import type { BrokerAdapter, BrokerCredentials, BrokerPosition, BrokerSummary } from "./types";

const BASE_URL = "https://api.kraken.com";

type KrakenBalanceResult = Record<string, string>;

type KrakenTickerInfo = {
  c: [string, string]; // [price, lot volume] — last trade close
};

type KrakenResponse<T> = {
  error: string[];
  result: T;
};

function signRequest(
  path: string,
  nonce: string,
  postData: string,
  privateKey: string,
): string {
  const sha256Hash = createHash("sha256")
    .update(nonce + postData)
    .digest();
  const message = Buffer.concat([Buffer.from(path), sha256Hash]);
  const hmac = createHmac("sha512", Buffer.from(privateKey, "base64"));
  return hmac.update(message).digest("base64");
}

async function krakenFetch<T>(
  creds: BrokerCredentials,
  path: string,
  body: Record<string, string> = {},
): Promise<T> {
  const nonce = (Date.now() * 1000).toString();
  const postData = new URLSearchParams({ ...body, nonce }).toString();
  const signature = signRequest(path, nonce, postData, creds.apiSecret);

  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: {
      "API-Key": creds.apiKey,
      "API-Sign": signature,
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: postData,
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    throw new Error(`Kraken API error ${res.status}: ${text}`);
  }

  const json = (await res.json()) as KrakenResponse<T>;
  if (json.error.length > 0) {
    throw new Error(`Kraken API error: ${json.error.join(", ")}`);
  }

  return json.result;
}

async function getTickerPrices(pairs: string[]): Promise<Map<string, number>> {
  if (pairs.length === 0) return new Map();

  const pairStr = pairs.join(",");
  const res = await fetch(`${BASE_URL}/0/public/Ticker?pair=${pairStr}`, {
    next: { revalidate: 60 },
    signal: AbortSignal.timeout(10_000),
  });

  if (!res.ok) return new Map();

  const json = (await res.json()) as KrakenResponse<Record<string, KrakenTickerInfo>>;
  const prices = new Map<string, number>();
  for (const [pair, info] of Object.entries(json.result)) {
    prices.set(pair, parseFloat(info.c[0]));
  }
  return prices;
}

// Kraken asset names sometimes have X/Z prefixes
function normalizeAsset(asset: string): string {
  if (asset.length === 4 && (asset.startsWith("X") || asset.startsWith("Z"))) {
    return asset.slice(1);
  }
  return asset;
}

const STABLECOINS = new Set(["USDT", "USDC", "USD", "ZUSD"]);

export const krakenAdapter: BrokerAdapter = {
  source: "kraken",
  label: "Kraken",
  authType: "api_key",

  async getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]> {
    const balances = await krakenFetch<KrakenBalanceResult>(creds, "/0/private/Balance");

    const nonZero = Object.entries(balances).filter(
      ([, amount]) => parseFloat(amount) > 0,
    );

    // Build USD pair names for price lookup
    const pairs = nonZero
      .filter(([asset]) => !STABLECOINS.has(asset) && !STABLECOINS.has(normalizeAsset(asset)))
      .map(([asset]) => `${asset}USD`);

    const prices = await getTickerPrices(pairs);

    return nonZero.map(([asset, amount]) => {
      const quantity = parseFloat(amount);
      const normalized = normalizeAsset(asset);
      const isStable = STABLECOINS.has(asset) || STABLECOINS.has(normalized);
      const pairKey = `${asset}USD`;

      // Try multiple pair name formats
      const priceUsd = isStable
        ? 1
        : prices.get(pairKey) ?? prices.get(`X${asset}ZUSD`) ?? 0;
      const value = quantity * priceUsd;

      return {
        ticker: normalized,
        name: normalized,
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
