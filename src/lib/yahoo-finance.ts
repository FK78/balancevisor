/* eslint-disable @typescript-eslint/no-explicit-any */
import YahooFinanceClass from "yahoo-finance2";
import { logger } from "@/lib/logger";
import { normalizeSubUnitCurrency } from "@/lib/currency";

const yahooFinance: any = new (YahooFinanceClass as any)();

export type YahooQuote = {
  ticker: string;
  name: string;
  currentPrice: number;
  currency: string;
};

export async function getQuote(ticker: string): Promise<YahooQuote | null> {
  try {
    const result: any = await yahooFinance.quote(ticker);
    if (!result || !result.regularMarketPrice) return null;

    const normalized = normalizeSubUnitCurrency(
      result.regularMarketPrice,
      result.currency ?? "GBP",
    );

    return {
      ticker: result.symbol,
      name: result.shortName ?? result.longName ?? ticker,
      currentPrice: normalized.price,
      currency: normalized.currency,
    };
  } catch (err) {
    logger.warn("yahoo-finance", "Quote fetch failed", { ticker, error: err instanceof Error ? err.message : String(err) });
    return null;
  }
}

export async function getQuotes(tickers: string[]): Promise<Map<string, YahooQuote>> {
  const results = new Map<string, YahooQuote>();
  if (tickers.length === 0) return results;

  const promises = tickers.map(async (ticker) => {
    const quote = await getQuote(ticker);
    if (quote) results.set(ticker, quote);
  });

  await Promise.all(promises);
  return results;
}

export async function searchTicker(query: string) {
  try {
    const result: any = await yahooFinance.search(query, { newsCount: 0 });
    return ((result.quotes ?? []) as any[])
      .filter((q: any) => q.quoteType === "EQUITY" || q.quoteType === "ETF")
      .slice(0, 8)
      .map((q: any) => ({
        ticker: q.symbol as string,
        name: (q.shortname ?? q.longname ?? q.symbol) as string,
        exchange: q.exchDisp as string | undefined,
      }));
  } catch (err) {
    logger.warn("yahoo-finance", "Ticker search failed", { query, error: err instanceof Error ? err.message : String(err) });
    return [];
  }
}
