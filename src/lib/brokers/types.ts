/**
 * Shared types for the multi-broker adapter system.
 *
 * All broker integrations implement the BrokerAdapter interface,
 * which normalises positions and summaries into a common format.
 */

// ---------------------------------------------------------------------------
// Broker identifiers
// ---------------------------------------------------------------------------

export const BROKER_SOURCES = [
  "trading212",
  "alpaca",
  "ibkr",
  "coinbase",
  "binance",
  "kraken",
] as const;

export type BrokerSource = (typeof BROKER_SOURCES)[number];

// ---------------------------------------------------------------------------
// Auth types
// ---------------------------------------------------------------------------

export type BrokerAuthType = "api_key" | "oauth";

/**
 * Decrypted credentials passed to adapter methods at call time.
 * Stored as an encrypted JSON blob in `broker_connections.credentials_encrypted`.
 */
export type BrokerCredentials = {
  apiKey: string;
  apiSecret: string;
  environment: string;
  // OAuth brokers (IBKR):
  accessToken?: string;
  refreshToken?: string;
  tokenExpiresAt?: string; // ISO date string
};

// ---------------------------------------------------------------------------
// Normalised position / summary returned by every adapter
// ---------------------------------------------------------------------------

export type BrokerPosition = {
  ticker: string;
  name: string;
  quantity: number;
  averagePrice: number;
  currentPrice: number;
  currency: string;
  value: number;
  gainLoss: number;
  gainLossPercent: number;
  investmentType: "stock" | "crypto" | "etf" | "real_estate" | "private_equity" | "other";
};

export type BrokerSummary = {
  totalValue: number;
  cash: number;
  positions: BrokerPosition[];
};

// ---------------------------------------------------------------------------
// Adapter interface
// ---------------------------------------------------------------------------

export interface BrokerAdapter {
  readonly source: BrokerSource;
  readonly label: string;
  readonly authType: BrokerAuthType;

  /** Fetch current open positions. */
  getPositions(creds: BrokerCredentials): Promise<BrokerPosition[]>;

  /** Fetch account summary including cash + positions. */
  getSummary(creds: BrokerCredentials): Promise<BrokerSummary>;
}

// ---------------------------------------------------------------------------
// Broker metadata for UI (connect dialog, badges, etc.)
// ---------------------------------------------------------------------------

export type BrokerMeta = {
  source: BrokerSource;
  label: string;
  authType: BrokerAuthType;
  color: string;
  helpUrl: string;
  fields: BrokerField[];
};

export type BrokerField = {
  name: string;
  label: string;
  type: "text" | "password" | "select";
  placeholder?: string;
  required: boolean;
  options?: { value: string; label: string }[];
};
