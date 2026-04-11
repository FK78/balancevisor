/**
 * TrueLayer Data API helpers.
 *
 * Supports both sandbox and production environments via TRUELAYER_SANDBOX env var.
 * Provides: auth-link generation, token exchange / refresh, account + transaction fetching.
 */

import { randomBytes, createHash } from 'crypto';
import { env } from '@/lib/env';
import { logger } from '@/lib/logger';

// ---------------------------------------------------------------------------
// Environment helpers
// ---------------------------------------------------------------------------

const isSandbox = () => env().TRUELAYER_SANDBOX;

const authBase = () =>
  isSandbox()
    ? "https://auth.truelayer-sandbox.com"
    : "https://auth.truelayer.com";

const apiBase = () =>
  isSandbox()
    ? "https://api.truelayer-sandbox.com"
    : "https://api.truelayer.com";

function requireTruelayerEnv(key: 'TRUELAYER_CLIENT_ID' | 'TRUELAYER_CLIENT_SECRET'): string {
  const v = env()[key];
  if (!v) throw new Error(`Missing environment variable: ${key}`);
  return v;
}

// ---------------------------------------------------------------------------
// Validation helpers
// ---------------------------------------------------------------------------

const SAFE_ID_RE = /^[a-zA-Z0-9_-]+$/;

function assertSafeId(id: string, label: string): void {
  if (!SAFE_ID_RE.test(id)) {
    throw new Error(`Invalid ${label}: ${id}`);
  }
}

// ---------------------------------------------------------------------------
// Retry wrapper — 2 retries with exponential backoff for transient failures
// ---------------------------------------------------------------------------

async function withRetry<T>(
  fn: () => Promise<T>,
  label: string,
  maxRetries = 2,
): Promise<T> {
  let lastErr: unknown;
  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastErr = err;
      const isRetryable =
        err instanceof Error &&
        (err.message.includes('fetch failed') ||
         err.message.includes('ECONNRESET') ||
         err.message.includes('(502)') ||
         err.message.includes('(503)') ||
         err.message.includes('(504)'));
      if (!isRetryable || attempt === maxRetries) break;
      const delay = 500 * 2 ** attempt;
      logger.warn('truelayer.retry', `${label} attempt ${attempt + 1} failed, retrying in ${delay}ms`, { error: String(err) });
      await new Promise((r) => setTimeout(r, delay));
    }
  }
  throw lastErr;
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

export interface TrueLayerCard {
  account_id: string;
  display_name: string;
  card_type: string;     // CREDIT, CHARGE, PREPAID, etc.
  currency: string;
  provider: { display_name: string };
}

export interface TrueLayerTransaction {
  transaction_id: string;
  timestamp: string;
  description: string;
  amount: number;
  currency: string;
  transaction_type: string;
  transaction_category: string;
  meta?: Record<string, string>;
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

// ---------------------------------------------------------------------------
// PKCE (Proof Key for Code Exchange) — prevents authorization code interception
// ---------------------------------------------------------------------------

export interface PkceChallenge {
  code_verifier: string;
  code_challenge: string;
}

export function generatePkceChallenge(): PkceChallenge {
  const code_verifier = randomBytes(32).toString('base64url');
  const code_challenge = createHash('sha256')
    .update(code_verifier)
    .digest('base64url');
  return { code_verifier, code_challenge };
}

/**
 * Build the TrueLayer OAuth authorization URL with CSRF state + PKCE protection.
 *
 * @param state - A cryptographically random state string (use generateOAuthState()).
 *                This must be stored in a cookie and validated on callback.
 * @param codeChallenge - PKCE code_challenge (use generatePkceChallenge()).
 * @returns The full OAuth authorization URL.
 */
export function buildAuthLink(state: string, codeChallenge?: string): string {
  const clientId = requireTruelayerEnv("TRUELAYER_CLIENT_ID");
  const redirectUri = `${env().NEXT_PUBLIC_SITE_URL}/api/truelayer/callback`;

  const params = new URLSearchParams({
    response_type: "code",
    client_id: clientId,
    scope: "info accounts balance cards transactions offline_access",
    redirect_uri: redirectUri,
    providers: "uk-ob-amex uk-ob-bos uk-ob-barclays uk-ob-chelsea-building-society uk-ob-danske uk-ob-first-direct uk-ob-halifax uk-ob-hsbc uk-ob-hsbc-business uk-ob-lloyds uk-ob-ms uk-ob-mbna uk-ob-monzo uk-ob-nationwide uk-ob-natwest uk-ob-revolut uk-ob-rbs uk-ob-santander uk-ob-tesco uk-ob-tide uk-ob-tsb uk-ob-transferwise uk-ob-yorkshire-building-society uk-ob-ulster uk-oauth-all",
    state,
    nonce: randomBytes(16).toString('hex'),
  });

  if (codeChallenge) {
    params.set('code_challenge', codeChallenge);
    params.set('code_challenge_method', 'S256');
  }

  return `${authBase()}/?${params.toString()}`;
}

// ---------------------------------------------------------------------------
// Token exchange / refresh
// ---------------------------------------------------------------------------

export async function exchangeCode(code: string, codeVerifier?: string): Promise<TrueLayerTokens> {
  const body: Record<string, string> = {
    grant_type: "authorization_code",
    client_id: requireTruelayerEnv("TRUELAYER_CLIENT_ID"),
    client_secret: requireTruelayerEnv("TRUELAYER_CLIENT_SECRET"),
    redirect_uri: `${env().NEXT_PUBLIC_SITE_URL}/api/truelayer/callback`,
    code,
  };
  if (codeVerifier) {
    body.code_verifier = codeVerifier;
  }

  return withRetry(async () => {
    const res = await fetch(`${authBase()}/connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams(body),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TrueLayer token exchange failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<TrueLayerTokens>;
  }, 'exchangeCode');
}

export async function refreshAccessToken(
  refreshToken: string
): Promise<TrueLayerTokens> {
  return withRetry(async () => {
    const res = await fetch(`${authBase()}/connect/token`, {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        grant_type: "refresh_token",
        client_id: requireTruelayerEnv("TRUELAYER_CLIENT_ID"),
        client_secret: requireTruelayerEnv("TRUELAYER_CLIENT_SECRET"),
        refresh_token: refreshToken,
      }),
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TrueLayer token refresh failed (${res.status}): ${text}`);
    }

    return res.json() as Promise<TrueLayerTokens>;
  }, 'refreshAccessToken');
}

// ---------------------------------------------------------------------------
// Data fetching
// ---------------------------------------------------------------------------

async function tlGet<T>(path: string, accessToken: string): Promise<T> {
  return withRetry(async () => {
    const res = await fetch(`${apiBase()}${path}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`TrueLayer GET ${path} failed (${res.status}): ${text}`);
    }

    const json = await res.json();
    return json.results as T;
  }, `GET ${path}`);
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
  assertSafeId(accountId, 'accountId');
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
  assertSafeId(accountId, 'accountId');
  return tlGet<TrueLayerTransaction[]>(
    `/data/v1/accounts/${accountId}/transactions?from=${from}&to=${to}`,
    accessToken
  );
}

// ---------------------------------------------------------------------------
// Cards (credit cards, charge cards, store cards — separate TrueLayer endpoint)
// ---------------------------------------------------------------------------

export async function fetchCards(
  accessToken: string
): Promise<TrueLayerCard[]> {
  return tlGet<TrueLayerCard[]>("/data/v1/cards", accessToken);
}

export async function fetchCardBalance(
  accessToken: string,
  cardId: string
): Promise<TrueLayerBalance> {
  assertSafeId(cardId, 'cardId');
  const balances = await tlGet<TrueLayerBalance[]>(
    `/data/v1/cards/${cardId}/balance`,
    accessToken
  );
  return balances[0];
}

export async function fetchCardTransactions(
  accessToken: string,
  cardId: string,
  from: string,
  to: string
): Promise<TrueLayerTransaction[]> {
  assertSafeId(cardId, 'cardId');
  return tlGet<TrueLayerTransaction[]>(
    `/data/v1/cards/${cardId}/transactions?from=${from}&to=${to}`,
    accessToken
  );
}
