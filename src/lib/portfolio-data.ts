import { getTrading212Connection, getManualHoldings, getHoldingSales } from "@/db/queries/investments";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getT212AccountSummary, getT212Positions, type T212Position } from "@/lib/trading212";
import { getQuotes } from "@/lib/yahoo-finance";
import { decryptForUser, getUserKey } from "@/lib/encryption";
import { formatCurrency } from "@/lib/formatCurrency";
import { logger } from "@/lib/logger";

export type PortfolioHolding = {
  ticker: string | null;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  investmentType: "stock" | "real_estate" | "private_equity" | "other";
  source: "trading212" | "manual";
  groupName?: string | null;
};

export type PortfolioSnapshot = {
  holdings: PortfolioHolding[];
  totalValue: number;
  totalCost: number;
  totalGainLoss: number;
  totalGainLossPercent: number;
  totalRealizedGain: number;
  salesCount: number;
  t212Cash: number;
  baseCurrency: string;
};

export async function getPortfolioSnapshot(userId: string): Promise<PortfolioSnapshot> {
  const [t212Connection, manualHoldings, baseCurrency, allGroups, sales] = await Promise.all([
    getTrading212Connection(userId),
    getManualHoldings(userId),
    getUserBaseCurrency(userId),
    getGroupsByUser(userId),
    getHoldingSales(userId),
  ]);

  const groupMap = new Map(allGroups.map((g) => [g.id, g]));

  let t212Positions: T212Position[] = [];
  let t212Cash = 0;

  if (t212Connection) {
    try {
      const userKey = await getUserKey(userId);
      const apiKey = decryptForUser(t212Connection.api_key_encrypted, userKey);
      const apiSecret = decryptForUser(t212Connection.api_secret_encrypted, userKey);
      const [summary, positions] = await Promise.all([
        getT212AccountSummary(apiKey, apiSecret, t212Connection.environment),
        getT212Positions(apiKey, apiSecret, t212Connection.environment),
      ]);
      t212Positions = positions;
      t212Cash = summary.cash.availableToTrade;
    } catch (err) {
      logger.error("portfolio-data", "T212 fetch failed", err);
    }
  }

  // Refresh stale manual holding prices
  const now = new Date();
  const staleTickers = manualHoldings
    .filter((h) => {
      if ((h.investment_type ?? "stock") !== "stock" || !h.ticker) return false;
      if (!h.last_price_update) return true;
      return now.getTime() - new Date(h.last_price_update).getTime() > 15 * 60 * 1000;
    })
    .map((h) => h.ticker!)
    .filter((ticker): ticker is string => ticker !== null);

  const freshQuotes = staleTickers.length > 0 ? await getQuotes(staleTickers) : new Map();

  const holdings: PortfolioHolding[] = [];

  for (const pos of t212Positions) {
    const avgPrice = parseFloat(String(pos.averagePricePaid));
    const cost = avgPrice * pos.quantity;
    const value = pos.walletImpact?.currentValue ?? pos.currentPrice * pos.quantity;
    const gainLoss = pos.walletImpact?.profitLoss ?? value - cost;
    const gainLossPercent = pos.walletImpact?.profitLossPercent ?? (cost > 0 ? (gainLoss / cost) * 100 : 0);

    holdings.push({
      ticker: pos.instrument.ticker,
      name: pos.instrument.name ?? pos.instrument.shortName ?? pos.instrument.ticker,
      quantity: pos.quantity,
      averagePrice: avgPrice,
      currentPrice: pos.currentPrice,
      currency: pos.instrument.currencyCode ?? baseCurrency,
      value,
      gainLoss,
      gainLossPercent,
      investmentType: "stock",
      source: "trading212",
    });
  }

  for (const h of manualHoldings) {
    const quote = freshQuotes.get(h.ticker);
    const currentPrice = quote?.currentPrice ?? h.current_price ?? h.average_price;
    const value = currentPrice * h.quantity;
    const cost = h.average_price * h.quantity;
    const gainLoss = value - cost;
    const gainLossPercent = cost > 0 ? (gainLoss / cost) * 100 : 0;

    holdings.push({
      ticker: h.ticker,
      name: h.name,
      quantity: h.quantity,
      averagePrice: h.average_price,
      currentPrice,
      currency: h.currency,
      value,
      gainLoss,
      gainLossPercent,
      investmentType: h.investment_type ?? "stock",
      source: "manual",
      groupName: h.group_id ? groupMap.get(h.group_id)?.name ?? null : null,
    });
  }

  const totalValue = holdings.reduce((s, h) => s + h.value, 0) + t212Cash;
  const totalCost = holdings.reduce((s, h) => s + h.averagePrice * h.quantity, 0);
  const totalGainLoss = holdings.reduce((s, h) => s + h.gainLoss, 0);
  const totalGainLossPercent = totalCost > 0 ? (totalGainLoss / totalCost) * 100 : 0;
  const totalRealizedGain = sales.reduce((sum, s) => sum + s.realized_gain, 0);

  return {
    holdings: [...holdings].sort((a, b) => b.value - a.value),
    totalValue,
    totalCost,
    totalGainLoss,
    totalGainLossPercent,
    totalRealizedGain,
    salesCount: sales.length,
    t212Cash,
    baseCurrency,
  };
}

export function formatPortfolioContext(snapshot: PortfolioSnapshot): string {
  const { holdings, totalValue, totalCost, totalGainLoss, totalGainLossPercent, totalRealizedGain, salesCount, t212Cash, baseCurrency } = snapshot;

  const holdingLines = holdings.map((h) => {
    const weight = totalValue > 0 ? ((h.value / totalValue) * 100).toFixed(1) : "0.0";
    const typeLabel = h.investmentType === "stock" ? "Stock" : h.investmentType === "real_estate" ? "Real Estate" : h.investmentType === "private_equity" ? "Private Equity" : "Other";
    return `- ${h.ticker ?? h.name} (${h.name}): ${typeLabel}, ${h.quantity} units, avg ${formatCurrency(h.averagePrice, h.currency)}, current ${formatCurrency(h.currentPrice, h.currency)}, value ${formatCurrency(h.value, baseCurrency)} (${weight}%), gain/loss ${h.gainLoss >= 0 ? "+" : ""}${formatCurrency(Math.abs(h.gainLoss), baseCurrency)} (${h.gainLossPercent >= 0 ? "+" : ""}${h.gainLossPercent.toFixed(2)}%)`;
  });

  const sorted = [...holdings].sort((a, b) => b.gainLossPercent - a.gainLossPercent);
  const top3 = sorted.slice(0, 3);
  const bottom3 = sorted.slice(-3).reverse();

  const typeBreakdown = new Map<string, number>();
  for (const h of holdings) {
    const key = h.investmentType;
    typeBreakdown.set(key, (typeBreakdown.get(key) ?? 0) + h.value);
  }

  return `
### Investment Portfolio (${holdings.length} holdings)
- Total value: ${formatCurrency(totalValue, baseCurrency)}${t212Cash > 0 ? ` (incl. ${formatCurrency(t212Cash, baseCurrency)} cash)` : ""}
- Total cost basis: ${formatCurrency(totalCost, baseCurrency)}
- Total gain/loss: ${totalGainLoss >= 0 ? "+" : ""}${formatCurrency(Math.abs(totalGainLoss), baseCurrency)} (${totalGainLossPercent >= 0 ? "+" : ""}${totalGainLossPercent.toFixed(2)}%)
- Realized gains: ${formatCurrency(Math.abs(totalRealizedGain), baseCurrency)} from ${salesCount} sale${salesCount !== 1 ? "s" : ""}

### Holdings Detail
${holdingLines.join("\n")}

### Type Breakdown
${[...typeBreakdown.entries()].map(([type, val]) => `- ${type}: ${formatCurrency(val, baseCurrency)} (${totalValue > 0 ? ((val / totalValue) * 100).toFixed(1) : "0.0"}%)`).join("\n")}

### Top 3 Performers
${top3.map((h) => `- ${h.ticker ?? h.name}: ${h.gainLossPercent >= 0 ? "+" : ""}${h.gainLossPercent.toFixed(2)}% (${h.gainLoss >= 0 ? "+" : ""}${formatCurrency(Math.abs(h.gainLoss), baseCurrency)})`).join("\n")}

### Bottom 3 Performers
${bottom3.map((h) => `- ${h.ticker ?? h.name}: ${h.gainLossPercent >= 0 ? "+" : ""}${h.gainLossPercent.toFixed(2)}% (${h.gainLoss >= 0 ? "+" : ""}${formatCurrency(Math.abs(h.gainLoss), baseCurrency)})`).join("\n")}
`.trim();
}
