import { describe, it, expect } from "vitest";
import {
  normalise,
  fuzzyMatch,
  amountsMatch,
  amountsCloseEnough,
  isNearBillingDate,
} from "@/lib/matching-utils";

// ---------------------------------------------------------------------------
// normalise
// ---------------------------------------------------------------------------

describe("normalise", () => {
  it("lowercases and trims", () => {
    expect(normalise("  HELLO  ")).toBe("hello");
  });

  it("strips noise words", () => {
    expect(normalise("Netflix Ltd")).toBe("netflix");
    expect(normalise("Amazon Subscription")).toBe("amazon");
  });

  it("strips date patterns", () => {
    expect(normalise("Netflix June 2024")).toBe("netflix");
    // Slashes are replaced with spaces before date regex, so fragments remain
    expect(normalise("Spotify 01/06/2024")).toBe("spotify 01 06");
  });

  it("replaces punctuation with spaces", () => {
    // dots → spaces, then "co" and "uk" are noise words → stripped
    expect(normalise("AMAZON.CO.UK")).toBe("amazon");
  });
});

// ---------------------------------------------------------------------------
// fuzzyMatch
// ---------------------------------------------------------------------------

describe("fuzzyMatch", () => {
  it("matches identical names", () => {
    expect(fuzzyMatch("Netflix", "Netflix")).toBe(true);
  });

  it("matches when txn contains full subscription name", () => {
    expect(fuzzyMatch("AMAZON PRIME*12345", "Amazon Prime")).toBe(true);
  });

  it("matches single-token subscription against same merchant", () => {
    expect(fuzzyMatch("NETFLIX.COM", "Netflix")).toBe(true);
  });

  it("matches when subscription name is contained in txn", () => {
    expect(fuzzyMatch("SPOTIFY PREMIUM FAMILY", "Spotify Premium")).toBe(true);
  });

  // --- False positive cases that SHOULD NOT match ---

  it("does NOT match Amazon purchase to Amazon Prime", () => {
    expect(fuzzyMatch("AMAZON.CO.UK MARKETPLACE", "Amazon Prime")).toBe(false);
  });

  it("does NOT match Amazon order to Amazon Prime", () => {
    expect(fuzzyMatch("AMZN Mktp UK", "Amazon Prime")).toBe(false);
  });

  it("does NOT match Apple Store to Apple Music", () => {
    expect(fuzzyMatch("APPLE STORE LONDON", "Apple Music")).toBe(false);
  });

  it("does NOT match Google Play purchase to Google One", () => {
    expect(fuzzyMatch("GOOGLE PLAY APPS", "Google One")).toBe(false);
  });

  it("returns false for empty strings", () => {
    expect(fuzzyMatch("", "Netflix")).toBe(false);
    expect(fuzzyMatch("Netflix", "")).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// isNearBillingDate
// ---------------------------------------------------------------------------

describe("isNearBillingDate", () => {
  it("returns true when txn is on the billing date", () => {
    expect(isNearBillingDate("2025-04-15", "2025-04-15", "monthly")).toBe(true);
  });

  it("returns true when txn is within tolerance of next billing date", () => {
    expect(isNearBillingDate("2025-04-13", "2025-04-15", "monthly")).toBe(true);
    expect(isNearBillingDate("2025-04-18", "2025-04-15", "monthly")).toBe(true);
  });

  it("returns true when txn is near previous billing date (next - 1 cycle)", () => {
    // Next billing is May 15, previous was April 15
    expect(isNearBillingDate("2025-04-14", "2025-05-15", "monthly")).toBe(true);
    expect(isNearBillingDate("2025-04-17", "2025-05-15", "monthly")).toBe(true);
  });

  it("returns false when txn is far from any billing date", () => {
    // Next billing April 15, previous March 15. Txn on April 1 → >5 days from both
    expect(isNearBillingDate("2025-04-01", "2025-04-15", "monthly")).toBe(false);
  });

  it("handles weekly cycle", () => {
    // Next billing April 15, previous April 8
    expect(isNearBillingDate("2025-04-14", "2025-04-15", "weekly")).toBe(true);
    expect(isNearBillingDate("2025-04-09", "2025-04-15", "weekly")).toBe(true); // near prev (Apr 8)
    expect(isNearBillingDate("2025-04-01", "2025-04-15", "weekly")).toBe(false);
  });

  it("handles yearly cycle", () => {
    // Next billing 2026-01-10, previous 2025-01-10
    expect(isNearBillingDate("2025-01-12", "2026-01-10", "yearly")).toBe(true);
    expect(isNearBillingDate("2025-06-15", "2026-01-10", "yearly")).toBe(false);
  });

  it("handles quarterly cycle", () => {
    // Next billing July 1, previous April 1
    expect(isNearBillingDate("2025-04-03", "2025-07-01", "quarterly")).toBe(true);
    expect(isNearBillingDate("2025-05-15", "2025-07-01", "quarterly")).toBe(false);
  });

  it("respects custom tolerance", () => {
    // With default 5 days: 7 days off → false
    expect(isNearBillingDate("2025-04-08", "2025-04-15", "monthly")).toBe(false);
    // With 10-day tolerance: 7 days off → true
    expect(isNearBillingDate("2025-04-08", "2025-04-15", "monthly", 10)).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// amountsMatch / amountsCloseEnough
// ---------------------------------------------------------------------------

describe("amountsMatch", () => {
  it("returns true within 5% tolerance", () => {
    expect(amountsMatch(10.0, 10.0)).toBe(true);
    expect(amountsMatch(10.4, 10.0)).toBe(true);
  });

  it("returns false beyond 5% tolerance", () => {
    expect(amountsMatch(11.0, 10.0)).toBe(false);
  });

  it("handles zero expected", () => {
    expect(amountsMatch(0, 0)).toBe(true);
    expect(amountsMatch(1, 0)).toBe(false);
  });
});

describe("amountsCloseEnough", () => {
  it("returns true within 30% tolerance", () => {
    expect(amountsCloseEnough(10.0, 10.0)).toBe(true);
    expect(amountsCloseEnough(12.5, 10.0)).toBe(true);
  });

  it("returns false beyond 30% tolerance", () => {
    expect(amountsCloseEnough(15.0, 10.0)).toBe(false);
    expect(amountsCloseEnough(49.99, 7.99)).toBe(false); // Amazon purchase vs Prime
  });
});
