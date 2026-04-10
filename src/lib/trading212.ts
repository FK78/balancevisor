import { logger } from "@/lib/logger";

// ---------------------------------------------------------------------------
// Error classification
// ---------------------------------------------------------------------------

export type T212ErrorCode =
  | "INVALID_API_KEY"
  | "RATE_LIMITED"
  | "SERVER_ERROR"
  | "TIMEOUT"
  | "NETWORK_ERROR"
  | "UNKNOWN";

export class T212ApiError extends Error {
  readonly code: T212ErrorCode;
  readonly status: number | null;
  readonly retryable: boolean;

  constructor(message: string, code: T212ErrorCode, status: number | null = null) {
    super(message);
    this.name = "T212ApiError";
    this.code = code;
    this.status = status;
    this.retryable = code === "RATE_LIMITED" || code === "SERVER_ERROR" || code === "TIMEOUT";
  }
}

function classifyHttpError(status: number, body: string): T212ApiError {
  if (status === 401 || status === 403) {
    return new T212ApiError(
      "Invalid or expired API key. Please check your Trading 212 API key and try again.",
      "INVALID_API_KEY",
      status,
    );
  }
  if (status === 429) {
    return new T212ApiError(
      "Trading 212 rate limit reached. Retrying automatically…",
      "RATE_LIMITED",
      status,
    );
  }
  if (status >= 500) {
    return new T212ApiError(
      `Trading 212 server error (${status}). This is usually temporary.`,
      "SERVER_ERROR",
      status,
    );
  }
  return new T212ApiError(
    `Trading 212 API error ${status}: ${body.slice(0, 200)}`,
    "UNKNOWN",
    status,
  );
}

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export type T212AccountSummary = {
  cash: {
    availableToTrade: number;
    inPies: number;
    reservedForOrders: number;
  };
  currency: string;
  id: string;
  investments: {
    currentValue: number;
    realizedProfitLoss: number;
    totalCost: number;
    unrealizedProfitLoss: number;
  };
  totalValue: number;
};

export type T212Position = {
  averagePricePaid: string;
  createdAt: string;
  currentPrice: number;
  instrument: {
    isin: string;
    currencyCode: string;
    name: string;
    shortName: string;
    ticker: string;
    type: string;
  };
  quantity: number;
  quantityAvailableForTrading: number;
  quantityInPies: number;
  walletImpact: {
    currentValue: number;
    investedValue: number;
    profitLoss: number;
    profitLossPercent: number;
  };
};

const BASE_URLS: Record<string, string> = {
  live: "https://live.trading212.com/api/v0",
  demo: "https://demo.trading212.com/api/v0",
};

// ---------------------------------------------------------------------------
// Retry-aware fetch
// ---------------------------------------------------------------------------

const MAX_RETRIES = 3;
const BASE_DELAY_MS = 1_000;
const REQUEST_TIMEOUT_MS = 15_000;

async function t212Fetch<T>(apiKey: string, environment: string, path: string): Promise<T> {
  const baseUrl = BASE_URLS[environment] ?? BASE_URLS.live;
  const url = `${baseUrl}${path}`;

  let lastError: T212ApiError | null = null;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(url, {
        headers: { Authorization: apiKey },
        next: { revalidate: 60 },
        signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      });

      if (res.ok) {
        return res.json() as Promise<T>;
      }

      const body = await res.text().catch(() => "");
      lastError = classifyHttpError(res.status, body);

      // Non-retryable errors: bail immediately
      if (!lastError.retryable) {
        throw lastError;
      }

      // Respect Retry-After header for 429s
      const retryAfter = res.headers.get("Retry-After");
      const delayMs = retryAfter
        ? Math.min(parseInt(retryAfter, 10) * 1_000, 30_000)
        : BASE_DELAY_MS * Math.pow(2, attempt);

      if (attempt < MAX_RETRIES) {
        logger.warn("trading212", `Retrying ${path} (attempt ${attempt + 1}/${MAX_RETRIES})`, {
          status: res.status,
          delayMs,
        });
        await sleep(delayMs);
      }
    } catch (err) {
      if (err instanceof T212ApiError) {
        throw err;
      }

      // Network / timeout errors
      const isTimeout = err instanceof DOMException && err.name === "TimeoutError";
      lastError = new T212ApiError(
        isTimeout
          ? "Trading 212 request timed out. Their servers may be slow — please try again."
          : "Could not reach Trading 212. Check your internet connection.",
        isTimeout ? "TIMEOUT" : "NETWORK_ERROR",
      );

      if (attempt < MAX_RETRIES) {
        const delayMs = BASE_DELAY_MS * Math.pow(2, attempt);
        logger.warn("trading212", `Network error on ${path}, retrying (attempt ${attempt + 1})`, {
          error: (err as Error).message,
          delayMs,
        });
        await sleep(delayMs);
      }
    }
  }

  // All retries exhausted
  logger.error("trading212", `All retries exhausted for ${path}`, lastError);
  throw lastError ?? new T212ApiError("Trading 212 request failed after retries", "UNKNOWN");
}

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function getT212AccountSummary(
  apiKey: string,
  environment: string = "live",
): Promise<T212AccountSummary> {
  return t212Fetch<T212AccountSummary>(apiKey, environment, "/equity/account/summary");
}

export async function getT212Positions(
  apiKey: string,
  environment: string = "live",
): Promise<T212Position[]> {
  return t212Fetch<T212Position[]>(apiKey, environment, "/equity/positions");
}

// ---------------------------------------------------------------------------
// Lightweight validation (uses /equity/account/info which is cheap)
// ---------------------------------------------------------------------------

export async function validateT212ApiKey(
  apiKey: string,
  environment: string = "live",
): Promise<{ valid: true } | { valid: false; error: T212ApiError }> {
  try {
    await t212Fetch<unknown>(apiKey, environment, "/equity/account/info");
    return { valid: true };
  } catch (err) {
    if (err instanceof T212ApiError) {
      return { valid: false, error: err };
    }
    return {
      valid: false,
      error: new T212ApiError("Unexpected validation error", "UNKNOWN"),
    };
  }
}
