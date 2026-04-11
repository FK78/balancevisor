import { getBrokerConnections, getManualHoldings, getHoldingSales, decryptBrokerCredentials } from "@/db/queries/investments";
import { updateBrokerSyncStatus } from "@/db/mutations/investments";
import { getGroupsByUser } from "@/db/queries/investment-groups";
import { getUserBaseCurrency } from "@/db/queries/onboarding";
import { getQuotes } from "@/lib/yahoo-finance";
import { formatCurrency } from "@/lib/formatCurrency";
import { logger } from "@/lib/logger";
import { getAdapter } from "@/lib/brokers";
import type { BrokerSource } from "@/lib/brokers/types";

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
  investmentType: "stock" | "crypto" | "etf" | "real_estate" | "private_equity" | "other";
  source: BrokerSource | "manual";
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
  brokerCash: number;
  baseCurrency: string;
};

export async function getPortfolioSnapshot(userId: string): Promise<PortfolioSnapshot> {
  const [brokerConnections, manualHoldings, baseCurrency, allGroups, sales] = await Promise.all([
    getBrokerConnections(userId),
    getManualHoldings(userId),
    getUserBaseCurrency(userId),
    getGroupsByUser(userId),
    getHoldingSales(userId),
  ]);

  const groupMap = new Map(allGroups.map((g) => [g.id, g]));

  const holdings: PortfolioHolding[] = [];
  let brokerCash = 0;

  // Fetch positions from all connected brokers in parallel
  const brokerResults = await Promise.allSettled(
    brokerConnections.map(async (conn) => {
      const creds = await decryptBrokerCredentials(userId, conn.credentials_encrypted);
      const adapter = getAdapter(conn.broker as BrokerSource);
      const summary = await adapter.getSummary(creds);
      return { broker: conn.broker as BrokerSource, summary };
    }),
  );

  for (let i = 0; i < brokerResults.length; i++) {
    const result = brokerResults[i];
    const conn = brokerConnections[i];
    const brokerSource = conn.broker as BrokerSource;

    if (result.status === "rejected") {
      const errMsg = result.reason instanceof Error ? result.reason.message : String(result.reason);
      logger.error("portfolio-data", `${brokerSource} fetch failed`, result.reason);
      // Fire-and-forget: don't block portfolio render for status tracking
      updateBrokerSyncStatus(userId, brokerSource, { success: false, error: errMsg }).catch((err) => logger.warn('portfolio-data', 'sync status update failed', err));
      continue;
    }

    const { broker, summary } = result.value;
    brokerCash += summary.cash;
    // Fire-and-forget: record successful sync
    updateBrokerSyncStatus(userId, broker, { success: true }).catch((err) => logger.warn('portfolio-data', 'sync status update failed', err));

    for (const pos of summary.positions) {
      holdings.push({
        ticker: pos.ticker,
        name: pos.name,
        quantity: pos.quantity,
        averagePrice: pos.averagePrice,
        currentPrice: pos.currentPrice,
        currency: pos.currency,
        value: pos.value,
        gainLoss: pos.gainLoss,
        gainLossPercent: pos.gainLossPercent,
        investmentType: pos.investmentType,
        source: broker,
      });
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

  const totalValue = holdings.reduce((s, h) => s + h.value, 0) + brokerCash;
  const totalGainLoss = holdings.reduce((s, h) => s + h.gainLoss, 0);
  const totalCost = holdings.reduce((s, h) => s + (h.value - h.gainLoss), 0);
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
    brokerCash,
    baseCurrency,
  };
}

export function formatPortfolioContext(snapshot: PortfolioSnapshot): string {
  const { holdings, totalValue, totalCost, totalGainLoss, totalGainLossPercent, totalRealizedGain, salesCount, brokerCash, baseCurrency } = snapshot;

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
- Total value: ${formatCurrency(totalValue, baseCurrency)}${brokerCash > 0 ? ` (incl. ${formatCurrency(brokerCash, baseCurrency)} cash)` : ""}
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
