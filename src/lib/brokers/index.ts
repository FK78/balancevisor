import type { BrokerAdapter, BrokerMeta, BrokerSource, BrokerField } from "./types";
import { trading212Adapter } from "./trading212-adapter";
import { alpacaAdapter } from "./alpaca-adapter";
import { coinbaseAdapter } from "./coinbase-adapter";
import { binanceAdapter } from "./binance-adapter";
import { krakenAdapter } from "./kraken-adapter";
import { ibkrAdapter } from "./ibkr-adapter";

// ---------------------------------------------------------------------------
// Adapter registry
// ---------------------------------------------------------------------------

const adapters: Record<BrokerSource, BrokerAdapter> = {
  trading212: trading212Adapter,
  alpaca: alpacaAdapter,
  coinbase: coinbaseAdapter,
  binance: binanceAdapter,
  kraken: krakenAdapter,
  ibkr: ibkrAdapter,
};

export function getAdapter(source: BrokerSource): BrokerAdapter {
  const adapter = adapters[source];
  if (!adapter) {
    throw new Error(`Unknown broker source: ${source}`);
  }
  return adapter;
}

// ---------------------------------------------------------------------------
// UI metadata for the connect dialog
// ---------------------------------------------------------------------------

const apiKeyField = (label: string = "API Key"): BrokerField => ({
  name: "apiKey",
  label,
  type: "password",
  placeholder: `Paste your ${label}`,
  required: true,
});

const apiSecretField = (label: string = "API Secret"): BrokerField => ({
  name: "apiSecret",
  label,
  type: "password",
  placeholder: `Paste your ${label}`,
  required: true,
});

const environmentField = (options: { value: string; label: string }[]): BrokerField => ({
  name: "environment",
  label: "Environment",
  type: "select",
  required: true,
  options,
});

export const BROKER_META: Record<BrokerSource, BrokerMeta> = {
  trading212: {
    source: "trading212",
    label: "Trading 212",
    authType: "api_key",
    color: "#00BFFF",
    helpUrl: "https://helpcentre.trading212.com/hc/en-us/articles/9876543210-API",
    fields: [
      apiKeyField(),
      environmentField([
        { value: "live", label: "Live" },
        { value: "demo", label: "Demo" },
      ]),
    ],
  },
  alpaca: {
    source: "alpaca",
    label: "Alpaca",
    authType: "api_key",
    color: "#FFDD00",
    helpUrl: "https://app.alpaca.markets/paper/dashboard/overview",
    fields: [
      apiKeyField("API Key ID"),
      apiSecretField("Secret Key"),
      environmentField([
        { value: "live", label: "Live" },
        { value: "paper", label: "Paper" },
      ]),
    ],
  },
  coinbase: {
    source: "coinbase",
    label: "Coinbase",
    authType: "api_key",
    color: "#0052FF",
    helpUrl: "https://www.coinbase.com/settings/api",
    fields: [
      apiKeyField(),
      apiSecretField(),
    ],
  },
  binance: {
    source: "binance",
    label: "Binance",
    authType: "api_key",
    color: "#F0B90B",
    helpUrl: "https://www.binance.com/en/my/settings/api-management",
    fields: [
      apiKeyField(),
      apiSecretField("Secret Key"),
    ],
  },
  kraken: {
    source: "kraken",
    label: "Kraken",
    authType: "api_key",
    color: "#7B61FF",
    helpUrl: "https://www.kraken.com/u/security/api",
    fields: [
      apiKeyField(),
      apiSecretField("Private Key"),
    ],
  },
  ibkr: {
    source: "ibkr",
    label: "Interactive Brokers",
    authType: "oauth",
    color: "#D81B3C",
    helpUrl: "https://www.interactivebrokers.com/en/trading/ib-api.php",
    fields: [], // OAuth — no manual fields
  },
};

export const BROKER_LIST: BrokerMeta[] = Object.values(BROKER_META);
