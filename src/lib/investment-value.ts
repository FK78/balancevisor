import { getTrading212Connection, getManualHoldings } from "@/db/queries/investments";
import { getT212AccountSummary } from "@/lib/trading212";
import { getQuotes } from "@/lib/yahoo-finance";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { logger } from "@/lib/logger";

export async function getInvestmentValue(userId: string): Promise<number> {
  const [t212Connection, manualHoldings] = await Promise.all([
    getTrading212Connection(userId),
    getManualHoldings(userId),
  ]);

  let value = 0;

  if (t212Connection) {
    try {
      const userKey = await getUserKey(userId);
      const apiKey = decryptForUser(t212Connection.api_key_encrypted, userKey);
      const apiSecret = decryptForUser(t212Connection.api_secret_encrypted, userKey);
      const summary = await getT212AccountSummary(apiKey, apiSecret, t212Connection.environment);
      value += summary.totalValue;
    } catch (err) {
      logger.error("investment-value", "T212 fetch failed", err);
    }
  }

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

  return value;
}
