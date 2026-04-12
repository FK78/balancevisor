import type { TrueLayerTransaction } from "@/lib/truelayer";

// ---------------------------------------------------------------------------
// Normalised account shape shared between preview and import
// ---------------------------------------------------------------------------

export interface CachedTlAccount {
  readonly tlId: string;
  readonly displayName: string;
  readonly accountType: "currentAccount" | "savings" | "creditCard" | "investment";
  readonly currency: string;
  readonly providerName: string | undefined;
  readonly source: "account" | "card";
  readonly balance: number;
  readonly likelyPot: boolean;
  readonly connectionId: string;
}

// ---------------------------------------------------------------------------
// Cache entry: everything fetched from TrueLayer in one shot
// ---------------------------------------------------------------------------

export interface TlImportCacheEntry {
  readonly userId: string;
  readonly accounts: CachedTlAccount[];
  readonly transactions: ReadonlyMap<string, TrueLayerTransaction[]>;
  readonly fetchedAt: Date;
  /** Date-range used for transaction fetch */
  readonly dateRanges: ReadonlyMap<string, { from: string; to: string }>;
}

// ---------------------------------------------------------------------------
// In-memory cache with 5-minute TTL (VPS — process persists)
// ---------------------------------------------------------------------------

const TTL_MS = 5 * 60 * 1000;
const cache = new Map<string, { entry: TlImportCacheEntry; timer: ReturnType<typeof setTimeout> }>();

export function setCachedImport(userId: string, entry: TlImportCacheEntry): void {
  // Clear any existing entry first
  clearCachedImport(userId);

  const timer = setTimeout(() => {
    cache.delete(userId);
  }, TTL_MS);

  // Unref so the timer doesn't prevent process exit
  if (typeof timer === "object" && "unref" in timer) {
    timer.unref();
  }

  cache.set(userId, { entry, timer });
}

export function getCachedImport(userId: string): TlImportCacheEntry | null {
  const cached = cache.get(userId);
  if (!cached) return null;

  // Double-check TTL (belt-and-suspenders)
  if (Date.now() - cached.entry.fetchedAt.getTime() > TTL_MS) {
    clearCachedImport(userId);
    return null;
  }

  return cached.entry;
}

export function clearCachedImport(userId: string): void {
  const existing = cache.get(userId);
  if (existing) {
    clearTimeout(existing.timer);
    cache.delete(userId);
  }
}
