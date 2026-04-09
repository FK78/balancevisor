import { getBrokerConnections, getManualHoldings, decryptBrokerCredentials } from "@/db/queries/investments";
import { getQuotes } from "@/lib/yahoo-finance";
import { logger } from "@/lib/logger";
import { getCached, setCached, cacheKey } from "@/lib/cache";
import { getAdapter } from "@/lib/brokers";
import type { BrokerSource } from "@/lib/brokers/types";

const userTag = (userId: string) => `user:${userId}`;

export async function getInvestmentValue(userId: string): Promise<number> {
  const key = cacheKey('investment-value', userId);
  const cached = getCached<number>(key);
  if (cached !== undefined) return cached;

  const [brokerConnections, manualHoldings] = await Promise.all([
    getBrokerConnections(userId),
    getManualHoldings(userId),
  ]);

  let value = 0;

  // Sum values from all connected brokers
  const brokerPromises = brokerConnections.map(async (conn) => {
    try {
      const creds = await decryptBrokerCredentials(userId, conn.credentials_encrypted);
      const adapter = getAdapter(conn.broker as BrokerSource);
      const summary = await adapter.getSummary(creds);
      return summary.totalValue;
    } catch (err) {
      logger.error("investment-value", `${conn.broker} fetch failed`, err);
      return 0;
    }
  });

  const brokerValues = await Promise.all(brokerPromises);
  value += brokerValues.reduce((sum, v) => sum + v, 0);

  if (manualHoldings.length > 0) {
    // Only fetch quotes for stock holdings with a ticker
    const stockHoldings = manualHoldings.filter(
      (h) => (h.investment_type ?? 'stock') === 'stock' && h.ticker
    );
    const tickers = stockHoldings.map((h) => h.ticker!);
    const quotes = tickers.length > 0 ? await getQuotes(tickers) : new Map();
    for (const h of manualHoldings) {
      let price = h.current_price ?? h.average_price;
      if (h.ticker && (h.investment_type ?? 'stock') === 'stock') {
        price = quotes.get(h.ticker)?.currentPrice ?? price;
      }
      value += price * h.quantity;
    }
  }

  setCached(key, value, { ttlMs: 2 * 60 * 1000, tags: [userTag(userId)] });
  return value;
}
