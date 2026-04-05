/**
 * TrueLayer Data API helpers.
 *
 * Supports both sandbox and production environments via TRUELAYER_SANDBOX env var.
 * Provides: auth-link generation, token exchange / refresh, account + transaction fetching.
 */

import { randomBytes } from 'crypto';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

const isSandbox = () => process.env.TRUELAYER_SANDBOX === "true";

const authBase = () =>
  isSandbox()
    ? "https://auth.truelayer-sandbox.com"
    : "https://auth.truelayer.com";

const apiBase = () =>
  isSandbox()
    ? "https://api.truelayer-sandbox.com"
    : "https://api.truelayer.com";

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing environment variable: ${name}`);
  return v;
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface TrueLayerTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number; // seconds
}

export interface TrueLayerAccount {
  account_id: string;
  display_name: string;
  account_type: string;
  currency: string;
  provider: { display_name: string };
}

export interface TrueLayerBalance {
  current: number;
  currency: string;
}

export interface TrueLayerTransaction {
  transaction_id: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_category: string;
}

// ---------------------------------------------------------------------------
// Auth link
// ---------------------------------------------------------------------------

/**
 * Generate a cryptographically random state string for OAuth CSRF protection.
 * Returns a 32-byte hex string (64 characters).
 */
export function generateOAuthState(): string {
  return randomBytes(32).toString('hex');
}

/**
 * Build the TrueLayer OAuth authorization URL with CSRF state protection.
 *
 * @param state - A cryptographically random state string (use generateOAuthState()).
 *                This must be stored in a cookie and validated on callback.
 * @returns The full OAuth authorization URL.
 */
export function buildAuthLink(state: string): string {
  const clientId = requireEnv("TRUELAYER_CLIENT_ID");
  const redirectUri = `${requireEnv(
    "NEXT_PUBLIC_SITE_URL"
  )}/api/truelayer/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "info accounts balance transactions offline_access",
    redirect_uri: redirectUri,
    providers: "uk-ob-all uk-oauth-all uk-cs-mock",
    state,
    nonce: randomBytes(16).toString('hex'),
  });

  return `${authBase()}/?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange / refresh
// ---------------------------------------------------------------------------

export async function exchangeCode(code: string): Promise<TrueLayerTokens> {
  const res = await fetch(`${authBase()}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      client_id: requireEnv("TRUELAYER_CLIENT_ID"),
      client_secret: requireEnv("TRUELAYER_CLIENT_SECRET"),
      redirect_uri: `${requireEnv(
        "NEXT_PUBLIC_SITE_URL"
      )}/api/truelayer/callback`,
      code,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TrueLayer token exchange failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TrueLayerTokens>;
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TrueLayerTokens> {
  const res = await fetch(`${authBase()}/connect/token`, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      client_id: requireEnv("TRUELAYER_CLIENT_ID"),
      client_secret: requireEnv("TRUELAYER_CLIENT_SECRET"),
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TrueLayer token refresh failed (${res.status}): ${text}`);
  }

  return res.json() as Promise<TrueLayerTokens>;
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function tlGet<T>(path: string, accessToken: string): Promise<T> {
  const res = await fetch(`${apiBase()}${path}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TrueLayer GET ${path} failed (${res.status}): ${text}`);
  }

  const json = await res.json();
  return json.results as T;
}

export async function fetchAccounts(
  accessToken: string
): Promise<TrueLayerAccount[]> {
  return tlGet<TrueLayerAccount[]>("/data/v1/accounts", accessToken);
}

export async function fetchBalance(
  accessToken: string,
  accountId: string
): Promise<TrueLayerBalance> {
  const balances = await tlGet<TrueLayerBalance[]>(
    `/data/v1/accounts/${accountId}/balance`,
    accessToken
  );
  return balances[0];
}

export async function fetchTransactions(
  accessToken: string,
  accountId: string,
  from: string,
  to: string
): Promise<TrueLayerTransaction[]> {
  return tlGet<TrueLayerTransaction[]>(
    `/data/v1/accounts/${accountId}/transactions?from=${from}&to=${to}`,
    accessToken
  );
}
