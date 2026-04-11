import { describe, it, expect, beforeEach, vi } from "vitest";
import {
  SEED_BRANDS,
  resolveBrand,
  resolveBrandSync,
  invalidateBrandCache,
  isSubscriptionBrand,
  isLenderBrand,
  type BrandEntry,
} from "@/lib/brand-dictionary";

// ---------------------------------------------------------------------------
// Mock the DB query so tests run without a database connection.
// We convert SEED_BRANDS into the flat rows that getAllGlobalAliases returns.
// ---------------------------------------------------------------------------

const fakeRows = SEED_BRANDS.flatMap((b) =>
  b.aliases.map((alias) => ({
    id: "00000000-0000-0000-0000-000000000000",
    alias,
    brand: b.brand,
    default_category: b.defaultCategory,
    brand_type: b.type,
    subscription_name: b.subscriptionName ?? null,
    lender_for: b.lenderFor ?? null,
    vote_count: 1,
    source: "seed" as const,
    created_at: new Date(),
    updated_at: new Date(),
  })),
);

vi.mock("@/db/queries/brand-dictionary", () => ({
  getAllGlobalAliases: vi.fn().mockResolvedValue(fakeRows),
}));

beforeEach(() => {
  invalidateBrandCache();
});

// ---------------------------------------------------------------------------
// Subscription resolution
// ---------------------------------------------------------------------------

describe("resolveBrand — subscriptions", () => {
  it("resolves NETFLIX.COM/BILL to Netflix subscription", async () => {
    const brand = await resolveBrand("NETFLIX.COM/BILL");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Netflix");
    expect(brand!.type).toBe("subscription");
    expect(brand!.subscriptionName).toBe("Netflix");
  });

  it("resolves Spotify Premium to Spotify subscription", async () => {
    const brand = await resolveBrand("Spotify Premium");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Spotify");
    expect(brand!.type).toBe("subscription");
  });

  it("resolves PureGym to subscription", async () => {
    const brand = await resolveBrand("PUREGYM LONDON");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("PureGym");
    expect(brand!.type).toBe("subscription");
  });
});

// ---------------------------------------------------------------------------
// Retailer resolution
// ---------------------------------------------------------------------------

describe("resolveBrand — retailers", () => {
  it("resolves AMZN Mktp to Amazon retailer (not Amazon Prime)", async () => {
    const brand = await resolveBrand("AMZN Mktp UK*123456");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Amazon");
    expect(brand!.type).toBe("retailer");
  });

  it("resolves Apple Store to retailer, not Apple Music", async () => {
    const brand = await resolveBrand("Apple Store London");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Apple Store");
    expect(brand!.type).toBe("retailer");
  });
});

// ---------------------------------------------------------------------------
// Longest-alias-first precedence
// ---------------------------------------------------------------------------

describe("resolveBrand — precedence", () => {
  it("prefers 'amazon prime' over 'amazon' for Prime transactions", async () => {
    const brand = await resolveBrand("Amazon Prime renewal");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Amazon Prime");
    expect(brand!.type).toBe("subscription");
  });
});

// ---------------------------------------------------------------------------
// Lender resolution
// ---------------------------------------------------------------------------

describe("resolveBrand — lenders", () => {
  it("resolves SLC to Student Loans Company lender", async () => {
    const brand = await resolveBrand("SLC Student Loans");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Student Loans Company");
    expect(brand!.type).toBe("lender");
    expect(brand!.lenderFor).toBe("Student Loan");
  });

  it("resolves Black Horse Finance to lender", async () => {
    const brand = await resolveBrand("Black Horse Finance DD");
    expect(brand).not.toBeNull();
    expect(brand!.type).toBe("lender");
    expect(brand!.lenderFor).toBe("Car Finance");
  });
});

// ---------------------------------------------------------------------------
// Restaurant / grocery resolution
// ---------------------------------------------------------------------------

describe("resolveBrand — restaurants & groceries", () => {
  it("resolves Wagamama to restaurant", async () => {
    const brand = await resolveBrand("Wagamama - dinner");
    expect(brand).not.toBeNull();
    expect(brand!.type).toBe("restaurant");
  });

  it("resolves Tesco Stores to grocery", async () => {
    const brand = await resolveBrand("TESCO STORES 2847");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Tesco");
    expect(brand!.type).toBe("grocery");
  });
});

// ---------------------------------------------------------------------------
// Non-match
// ---------------------------------------------------------------------------

describe("resolveBrand — non-match", () => {
  it("returns null for unknown merchant", async () => {
    expect(await resolveBrand("Random Shop XYZ")).toBeNull();
  });

  it("returns null for empty string", async () => {
    expect(await resolveBrand("")).toBeNull();
  });
});

// ---------------------------------------------------------------------------
// Sync variant
// ---------------------------------------------------------------------------

describe("resolveBrandSync", () => {
  it("returns null when cache is not yet loaded", () => {
    expect(resolveBrandSync("Netflix")).toBeNull();
  });

  it("works after cache is loaded", async () => {
    await resolveBrand("warm-up");
    const brand = resolveBrandSync("Netflix subscription");
    expect(brand).not.toBeNull();
    expect(brand!.brand).toBe("Netflix");
  });
});

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

describe("type helpers", () => {
  it("isSubscriptionBrand returns true for subscription", () => {
    const entry: BrandEntry = {
      brand: "Netflix",
      aliases: ["netflix"],
      defaultCategory: "Entertainment",
      type: "subscription",
    };
    expect(isSubscriptionBrand(entry)).toBe(true);
    expect(isLenderBrand(entry)).toBe(false);
  });

  it("isLenderBrand returns true for lender", () => {
    const entry: BrandEntry = {
      brand: "SLC",
      aliases: ["slc"],
      defaultCategory: "Bills & Utilities",
      type: "lender",
    };
    expect(isLenderBrand(entry)).toBe(true);
    expect(isSubscriptionBrand(entry)).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// Seed data integrity
// ---------------------------------------------------------------------------

describe("SEED_BRANDS integrity", () => {
  it("every entry has at least one alias", () => {
    for (const entry of SEED_BRANDS) {
      expect(entry.aliases.length).toBeGreaterThan(0);
    }
  });

  it("all aliases are lowercase", () => {
    for (const entry of SEED_BRANDS) {
      for (const alias of entry.aliases) {
        expect(alias).toBe(alias.toLowerCase());
      }
    }
  });

  it("no duplicate aliases across entries", () => {
    const seen = new Set<string>();
    for (const entry of SEED_BRANDS) {
      for (const alias of entry.aliases) {
        expect(seen.has(alias)).toBe(false);
        seen.add(alias);
      }
    }
  });
});
