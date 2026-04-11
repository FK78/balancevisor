import type { BrokerAdapter, BrokerCredentials, BrokerPosition, BrokerSummary, BrokerValidationResult } from "./types";
import { getT212AccountSummary, getT212Positions, validateT212ApiKey } from "@/lib/trading212";
import { getSubUnitDivisor, toMajorCurrency } from "@/lib/currency";

export const trading212Adapter: BrokerAdapter = {
  source: "trading212",
  label: "Trading 212",
  authType: "api_key",

  async validateCredentials(creds: BrokerCredentials): Promise<BrokerValidationResult> {
    const result = await validateT212ApiKey(creds.apiKey, creds.apiSecret, creds.environment);
    if (result.valid) return { valid: true };
    return { valid: false, message: result.error.message, code: result.error.code };
  },

  async getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]> {
    const positions = await getT212Positions(creds.apiKey, creds.apiSecret, creds.environment);

    return positions.map((pos) => {
      const rawCurrency = pos.instrument.currencyCode ?? "GBP";
      const divisor = getSubUnitDivisor(rawCurrency);
      const currency = toMajorCurrency(rawCurrency);

      const avgPrice = parseFloat(String(pos.averagePricePaid)) / divisor;
      const currentPrice = pos.currentPrice / divisor;
      const cost = avgPrice * pos.quantity;
      const value = currentPrice * pos.quantity;
      const gainLoss = value - cost;
      const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

      return {
        ticker: pos.instrument.ticker,
        name: pos.instrument.name ?? pos.instrument.shortName ?? pos.instrument.ticker,
        quantity: pos.quantity,
        averagePrice: avgPrice,
        currentPrice,
        currency,
        value,
        gainLoss,
        gainLossPercent,
        investmentType: "stock" as const,
      };
    });
  },

  async getSummary(creds: BrokerCredentials): Promise<BrokerSummary> {
    const [summary, positions] = await Promise.all([
      getT212AccountSummary(creds.apiKey, creds.apiSecret, creds.environment),
      this.getPositions(creds),
    ]);

    return {
      totalValue: summary.totalValue,
      cash: summary.cash.availableToTrade,
      positions,
    };
  },
};
