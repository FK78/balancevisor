/**
 * Tests for transaction intelligence matching functions.
 * Run with: npm run test:intelligence
 */

import { normalise, fuzzyMatch, amountsMatch } from "./matching-utils";

let passed = 0;
let failed = 0;

function assert(condition: boolean, name: string) {
  if (condition) {
    passed++;
    console.log(`  ✅ ${name}`);
  } else {
    failed++;
    console.error(`  ❌ ${name}`);
  }
}

// ---------------------------------------------------------------------------
// normalise()
// ---------------------------------------------------------------------------

console.log("\n🧪 normalise()");

assert(normalise("NETFLIX.COM") === "netflix", "strips .com noise word and lowercases");
assert(normalise("  Spotify  ") === "spotify", "trims whitespace");
assert(normalise("Amazon Ltd") === "amazon", "strips 'ltd'");
assert(normalise("GYM MEMBERSHIP PAYMENT") === "gym membership", "strips 'payment'");
assert(normalise("DIRECT DEBIT TO Sky UK") === "to sky", "strips 'direct debit' and 'uk'");
assert(normalise("APPLE.COM/BILL") === "apple bill", "strips .com and / punctuation");
assert(normalise("SLC STUDENT LOANS") === "slc student loans", "preserves non-noise words");
assert(normalise("") === "", "handles empty string");
assert(normalise("   ") === "", "handles whitespace-only");
assert(normalise("NETFLIX---SUBSCRIPTION") === "netflix", "strips dashes and 'subscription'");

// ---------------------------------------------------------------------------
// fuzzyMatch()
// ---------------------------------------------------------------------------

console.log("\n🧪 fuzzyMatch()");

// Exact and inclusion matches
assert(fuzzyMatch("NETFLIX.COM", "Netflix") === true, "NETFLIX.COM matches Netflix");
assert(fuzzyMatch("SPOTIFY PREMIUM", "Spotify") === true, "SPOTIFY PREMIUM matches Spotify");
assert(fuzzyMatch("APPLE.COM/BILL ICLOUD", "iCloud Storage") === true, "APPLE.COM/BILL ICLOUD matches iCloud Storage");
assert(fuzzyMatch("GYM MEMBERSHIP PAYMENT", "Gym Membership") === true, "GYM MEMBERSHIP PAYMENT matches Gym Membership");
assert(fuzzyMatch("AMAZON PRIME", "Amazon Prime") === true, "AMAZON PRIME matches Amazon Prime");

// Debt matching — lender names
assert(fuzzyMatch("SLC STUDENT LOANS", "Student Loan") === true, "SLC STUDENT LOANS matches Student Loan");
assert(fuzzyMatch("BARCLAYCARD PAYMENT", "Barclaycard") === true, "BARCLAYCARD PAYMENT matches Barclaycard (inclusion)");
assert(fuzzyMatch("BARCLAYCARD PAYMENT", "Barclays Credit Card") === false, "BARCLAYCARD PAYMENT does NOT match Barclays Credit Card (barclaycard ≠ barclays)");

// Non-matches
assert(fuzzyMatch("TESCO STORES 2847", "Netflix") === false, "TESCO STORES 2847 does NOT match Netflix");
assert(fuzzyMatch("UBER *TRIP", "Spotify") === false, "UBER *TRIP does NOT match Spotify");
assert(fuzzyMatch("SHELL FUEL STATION", "Gym Membership") === false, "SHELL FUEL does NOT match Gym Membership");

// Edge cases
assert(fuzzyMatch("", "Netflix") === false, "empty description never matches");
assert(fuzzyMatch("NETFLIX.COM", "") === false, "empty target never matches");
assert(fuzzyMatch("", "") === false, "both empty never matches");

// ---------------------------------------------------------------------------
// amountsMatch()
// ---------------------------------------------------------------------------

console.log("\n🧪 amountsMatch()");

// Exact match
assert(amountsMatch(15.99, 15.99) === true, "15.99 vs 15.99 — exact match");
assert(amountsMatch(0, 0) === true, "0 vs 0 — zero match");

// Within 5% tolerance
assert(amountsMatch(16.50, 15.99) === true, "16.50 vs 15.99 — within 5% (3.2%)");
assert(amountsMatch(15.50, 15.99) === true, "15.50 vs 15.99 — within 5% (3.1%)");
assert(amountsMatch(15.19, 15.99) === false, "15.19 vs 15.99 — just beyond 5% boundary (5.003%)");
assert(amountsMatch(15.20, 15.99) === true, "15.20 vs 15.99 — just within 5% (4.94%)");

// Outside 5% tolerance
assert(amountsMatch(18.00, 15.99) === false, "18.00 vs 15.99 — exceeds 5% (12.6%)");
assert(amountsMatch(14.00, 15.99) === false, "14.00 vs 15.99 — exceeds 5% (12.4%)");
assert(amountsMatch(17.99, 15.99) === false, "17.99 vs 15.99 — exceeds 5% (12.5%)");

// Edge: amount is 0 but expected is not
assert(amountsMatch(0, 15.99) === false, "0 vs 15.99 — zero actual never matches non-zero");
assert(amountsMatch(5, 0) === false, "5 vs 0 — non-zero actual never matches zero expected");

// Large amounts
assert(amountsMatch(125, 125) === true, "125 vs 125 — exact debt payment");
assert(amountsMatch(130, 125) === true, "130 vs 125 — within 5% (4%)");
assert(amountsMatch(140, 125) === false, "140 vs 125 — exceeds 5% (12%)");

// ---------------------------------------------------------------------------
// Combined scenario: real-world subscription matching
// ---------------------------------------------------------------------------

console.log("\n🧪 Combined scenarios");

// Netflix subscription: name match + amount match = auto-link
const netflixNameMatch = fuzzyMatch("NETFLIX.COM", "Netflix");
const netflixAmountMatch = amountsMatch(15.99, 15.99);
assert(netflixNameMatch && netflixAmountMatch, "Netflix: name ✅ + amount ✅ → auto-link");

// Netflix price increase: name match + amount mismatch = flag
const netflixPriceHike = amountsMatch(17.99, 15.99);
assert(netflixNameMatch && !netflixPriceHike, "Netflix: name ✅ + amount ❌ → flag for review");

// Unrelated transaction: no name match = skip
const tescoMatch = fuzzyMatch("TESCO STORES 2847", "Netflix");
assert(!tescoMatch, "Tesco: name ❌ → skip entirely");

// Spotify with slight amount variation
const spotifyMatch = fuzzyMatch("SPOTIFY AB", "Spotify");
const spotifyAmount = amountsMatch(10.99, 10.99);
assert(spotifyMatch && spotifyAmount, "Spotify AB: name ✅ + amount ✅ → auto-link");

// ---------------------------------------------------------------------------
// Summary
// ---------------------------------------------------------------------------

console.log(`\n${"=".repeat(50)}`);
console.log(`Results: ${passed} passed, ${failed} failed, ${passed + failed} total`);
console.log("=".repeat(50));

if (failed > 0) {
  process.exit(1);
}
