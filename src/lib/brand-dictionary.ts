// ---------------------------------------------------------------------------
// Global Brand Dictionary — in-memory cache backed by global_merchant_aliases
// ---------------------------------------------------------------------------

import { logger } from "@/lib/logger";

export type BrandType =
  | "subscription"
  | "retailer"
  | "lender"
  | "utility"
  | "restaurant"
  | "transport"
  | "grocery"
  | "general";

export type BrandEntry = {
  brand: string;
  aliases: string[];
  defaultCategory: string;
  type: BrandType;
  subscriptionName?: string;
  lenderFor?: string;
};

// ---------------------------------------------------------------------------
// Seed data — inserted into the DB table on first seed, not used at runtime
// ---------------------------------------------------------------------------

export const SEED_BRANDS: readonly BrandEntry[] = [
  // ── Subscriptions ─────────────────────────────────────────────────
  {
    brand: "Netflix",
    aliases: ["netflix.com", "netflix inc", "netflix.com/bill", "netflix"],
    defaultCategory: "Entertainment",
    type: "subscription",
    subscriptionName: "Netflix",
  },
  {
    brand: "Spotify",
    aliases: ["spotify.com", "spotify ab", "spotify premium", "spotify"],
    defaultCategory: "Entertainment",
    type: "subscription",
    subscriptionName: "Spotify",
  },
  {
    brand: "YouTube Premium",
    aliases: ["youtube premium", "google youtube", "youtube.com/premium"],
    defaultCategory: "Entertainment",
    type: "subscription",
    subscriptionName: "YouTube Premium",
  },
  {
    brand: "Disney+",
    aliases: ["disney+", "disneyplus", "disney plus", "the walt disney"],
    defaultCategory: "Entertainment",
    type: "subscription",
    subscriptionName: "Disney+",
  },
  {
    brand: "Amazon Prime",
    aliases: ["amazon prime", "amzn prime", "prime membership"],
    defaultCategory: "Shopping",
    type: "subscription",
    subscriptionName: "Amazon Prime",
  },
  {
    brand: "Apple Music",
    aliases: ["apple music", "apple.com/bill music"],
    defaultCategory: "Entertainment",
    type: "subscription",
    subscriptionName: "Apple Music",
  },
  {
    brand: "iCloud",
    aliases: ["icloud", "apple.com/bill icloud"],
    defaultCategory: "Bills & Utilities",
    type: "subscription",
    subscriptionName: "iCloud",
  },
  {
    brand: "ChatGPT Plus",
    aliases: ["openai", "chatgpt", "chat.openai"],
    defaultCategory: "Education",
    type: "subscription",
    subscriptionName: "ChatGPT Plus",
  },
  {
    brand: "PureGym",
    aliases: ["puregym", "pure gym"],
    defaultCategory: "Health",
    type: "subscription",
    subscriptionName: "PureGym",
  },
  {
    brand: "Sky",
    aliases: ["sky broadband", "sky tv", "sky digital", "bskyb"],
    defaultCategory: "Bills & Utilities",
    type: "subscription",
    subscriptionName: "Sky",
  },
  {
    brand: "Three Mobile",
    aliases: ["three mobile", "three.co.uk", "hutchison 3g", "h3g"],
    defaultCategory: "Bills & Utilities",
    type: "subscription",
    subscriptionName: "Three Mobile",
  },
  {
    brand: "Headspace",
    aliases: ["headspace"],
    defaultCategory: "Health",
    type: "subscription",
    subscriptionName: "Headspace",
  },
  {
    brand: "Coursera",
    aliases: ["coursera", "coursera.org"],
    defaultCategory: "Education",
    type: "subscription",
    subscriptionName: "Coursera",
  },

  // ── Retailers ─────────────────────────────────────────────────────
  {
    brand: "Amazon",
    aliases: ["amazon.co.uk", "amzn mktp", "amazon marketplace", "amazon"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Apple Store",
    aliases: ["apple store", "apple retail", "apple.com/uk"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Google Play",
    aliases: ["google play", "google *play", "google commerce"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "ASOS",
    aliases: ["asos", "asos.com"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "John Lewis",
    aliases: ["john lewis", "johnlewis"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Currys",
    aliases: ["currys", "currys pc world", "dixons"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Argos",
    aliases: ["argos", "argos.co.uk"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "IKEA",
    aliases: ["ikea"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Zara",
    aliases: ["zara"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "H&M",
    aliases: ["h&m", "h & m", "hennes"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "TK Maxx",
    aliases: ["tk maxx", "tkmaxx"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Uniqlo",
    aliases: ["uniqlo"],
    defaultCategory: "Shopping",
    type: "retailer",
  },
  {
    brand: "Boots",
    aliases: ["boots pharmacy", "boots uk", "boots"],
    defaultCategory: "Health",
    type: "retailer",
  },

  // ── Groceries ─────────────────────────────────────────────────────
  {
    brand: "Tesco",
    aliases: ["tesco", "tesco stores", "tesco express", "tesco metro"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Sainsbury's",
    aliases: ["sainsbury", "sainsburys", "j sainsbury"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Aldi",
    aliases: ["aldi"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Lidl",
    aliases: ["lidl"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Waitrose",
    aliases: ["waitrose"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Asda",
    aliases: ["asda"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Morrisons",
    aliases: ["morrisons", "wm morrison"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Ocado",
    aliases: ["ocado"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "M&S Food",
    aliases: ["m&s food", "marks spencer food", "m & s"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Co-op",
    aliases: ["co-op", "coop", "co op"],
    defaultCategory: "Groceries",
    type: "grocery",
  },
  {
    brand: "Costco",
    aliases: ["costco"],
    defaultCategory: "Groceries",
    type: "grocery",
  },

  // ── Restaurants / Dining ──────────────────────────────────────────
  {
    brand: "Deliveroo",
    aliases: ["deliveroo"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Uber Eats",
    aliases: ["uber eats", "uber*eats"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Just Eat",
    aliases: ["just eat", "justeat", "just-eat"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Nando's",
    aliases: ["nando", "nandos"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Wagamama",
    aliases: ["wagamama"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Pret A Manger",
    aliases: ["pret a manger", "pret"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Costa Coffee",
    aliases: ["costa coffee", "costa"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Starbucks",
    aliases: ["starbucks"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "McDonald's",
    aliases: ["mcdonald", "mcdonalds"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Greggs",
    aliases: ["greggs"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Five Guys",
    aliases: ["five guys"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Pizza Express",
    aliases: ["pizza express", "pizzaexpress"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },
  {
    brand: "Dishoom",
    aliases: ["dishoom"],
    defaultCategory: "Dining Out",
    type: "restaurant",
  },

  // ── Lenders ───────────────────────────────────────────────────────
  {
    brand: "Student Loans Company",
    aliases: ["student loans company", "slc", "student loan"],
    defaultCategory: "Bills & Utilities",
    type: "lender",
    lenderFor: "Student Loan",
  },
  {
    brand: "Black Horse",
    aliases: ["black horse", "blackhorse", "black horse finance"],
    defaultCategory: "Bills & Utilities",
    type: "lender",
    lenderFor: "Car Finance",
  },
  {
    brand: "Barclaycard",
    aliases: ["barclaycard", "barclays card"],
    defaultCategory: "Bills & Utilities",
    type: "lender",
    lenderFor: "Barclaycard",
  },
  {
    brand: "American Express",
    aliases: ["american express", "amex", "americanexpress"],
    defaultCategory: "Bills & Utilities",
    type: "lender",
    lenderFor: "Amex",
  },

  // ── Utilities ─────────────────────────────────────────────────────
  {
    brand: "EDF Energy",
    aliases: ["edf energy", "edf"],
    defaultCategory: "Bills & Utilities",
    type: "utility",
  },
  {
    brand: "British Gas",
    aliases: ["british gas", "bg energy"],
    defaultCategory: "Bills & Utilities",
    type: "utility",
  },
  {
    brand: "Thames Water",
    aliases: ["thames water"],
    defaultCategory: "Bills & Utilities",
    type: "utility",
  },
  {
    brand: "Council Tax",
    aliases: ["council tax"],
    defaultCategory: "Bills & Utilities",
    type: "utility",
  },

  // ── Transport ─────────────────────────────────────────────────────
  {
    brand: "TfL",
    aliases: ["tfl", "transport for london", "oyster"],
    defaultCategory: "Transport",
    type: "transport",
  },
  {
    brand: "Uber",
    aliases: ["uber *trip", "uber bv", "uber"],
    defaultCategory: "Transport",
    type: "transport",
  },
  {
    brand: "Bolt",
    aliases: ["bolt ride", "bolt.eu", "bolt"],
    defaultCategory: "Transport",
    type: "transport",
  },
];

// ---------------------------------------------------------------------------
// In-memory cache backed by DB — refreshed every 5 minutes
// ---------------------------------------------------------------------------

type CachedAlias = {
  alias: string;
  brand: string;
  defaultCategory: string;
  type: BrandType;
  subscriptionName: string | null;
  lenderFor: string | null;
};

const CACHE_TTL_MS = 5 * 60 * 1000;

let _cache: CachedAlias[] | null = null;
let _cacheBuiltAt = 0;

function isCacheStale(): boolean {
  return !_cache || Date.now() - _cacheBuiltAt > CACHE_TTL_MS;
}

async function loadCache(): Promise<CachedAlias[]> {
  if (!isCacheStale()) return _cache!;

  try {
    const { getAllGlobalAliases } = await import(
      "@/db/queries/brand-dictionary"
    );
    const rows = await getAllGlobalAliases();
    _cache = rows
      .map((r) => ({
        alias: r.alias.toLowerCase(),
        brand: r.brand,
        defaultCategory: r.default_category,
        type: r.brand_type as BrandType,
        subscriptionName: r.subscription_name,
        lenderFor: r.lender_for,
      }))
      // Sort longest alias first so "amazon prime" beats "amazon"
      .sort((a, b) => b.alias.length - a.alias.length);
    _cacheBuiltAt = Date.now();
    return _cache;
  } catch (err) {
    logger.warn("brand-dictionary", "Failed to load global aliases from DB, using empty cache", { error: err });
    _cache = [];
    _cacheBuiltAt = Date.now();
    return _cache;
  }
}

/**
 * Force-clear the in-memory cache (e.g. after seeding or contributing).
 */
export function invalidateBrandCache(): void {
  _cache = null;
  _cacheBuiltAt = 0;
}

// ---------------------------------------------------------------------------
// Lookup
// ---------------------------------------------------------------------------

/**
 * Resolve a raw bank transaction description to a known brand.
 *
 * Matching is case-insensitive substring: each alias is checked against
 * the lowercased description, longest alias first to avoid "amazon"
 * matching before "amazon prime".
 *
 * Returns a `BrandEntry`-like object or `null`.
 */
export async function resolveBrand(
  rawDescription: string,
): Promise<BrandEntry | null> {
  if (!rawDescription) return null;

  const lower = rawDescription.toLowerCase();
  const aliases = await loadCache();

  for (const entry of aliases) {
    if (lower.includes(entry.alias)) {
      return {
        brand: entry.brand,
        aliases: [entry.alias],
        defaultCategory: entry.defaultCategory,
        type: entry.type,
        subscriptionName: entry.subscriptionName ?? undefined,
        lenderFor: entry.lenderFor ?? undefined,
      };
    }
  }

  return null;
}

/**
 * Synchronous version using whatever is currently in the cache.
 * Returns null if cache is empty / not yet loaded.
 * Use this in hot paths where you cannot await.
 */
export function resolveBrandSync(rawDescription: string): BrandEntry | null {
  if (!rawDescription || !_cache) return null;

  const lower = rawDescription.toLowerCase();
  for (const entry of _cache) {
    if (lower.includes(entry.alias)) {
      return {
        brand: entry.brand,
        aliases: [entry.alias],
        defaultCategory: entry.defaultCategory,
        type: entry.type,
        subscriptionName: entry.subscriptionName ?? undefined,
        lenderFor: entry.lenderFor ?? undefined,
      };
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function isSubscriptionBrand(entry: BrandEntry): boolean {
  return entry.type === "subscription";
}

export function isLenderBrand(entry: BrandEntry): boolean {
  return entry.type === "lender";
}
