/**
 * Merchant name normalisation.
 *
 * Cleans raw bank transaction descriptions (e.g. "CARD PAYMENT TO TESCO STORES 1234")
 * into a canonical merchant name (e.g. "Tesco Stores") suitable for display and
 * exact-match merchant → category lookups.
 *
 * When the global brand dictionary has been loaded, known brands are resolved
 * to their canonical name (e.g. "AMZN Mktp UK" → "Amazon").
 */

import { resolveBrandSync } from "@/lib/brand-dictionary";

// Prefixes injected by banks / payment processors — removed first
const NOISE_PREFIXES = [
  /^card\s+payment\s+to\s+/i,
  /^contactless\s+payment\s+to\s+/i,
  /^direct\s+debit\s+(?:payment\s+)?to\s+/i,
  /^standing\s+order\s+to\s+/i,
  /^faster\s+payment(?:s)?\s+to\s+/i,
  /^bank\s+transfer\s+to\s+/i,
  /^payment\s+to\s+/i,
  /^purchase\s+(?:at|from)\s+/i,
  /^pos\s+(?:purchase\s+)?/i,
  /^atm\s+(?:withdrawal\s+)?/i,
  /^visa\s+(?:purchase\s+)?/i,
  /^mastercard\s+(?:purchase\s+)?/i,
  /^debit\s+card\s+/i,
  /^ref:?\s*/i,
  /^mandate\s+no\.?\s*\d+\s*/i,
];

// Suffixes / trailing noise — removed after prefix cleaning
const NOISE_SUFFIXES = [
  /\s+on\s+\d{2}[/.-]\d{2}[/.-]\d{2,4}$/i, // "on 01/04/2025"
  /\s+\d{2}[/.-]\d{2}[/.-]\d{2,4}$/,         // bare trailing dates
  /\s+\d{4,}$/,                                // trailing reference numbers
  /\s+ref\s*[:.]?\s*\w+$/i,                    // "ref ABC123"
  /\s+cd\s+\d{4}$/i,                           // "CD 1234" (card last 4)
  /\s+\*{4}\d{4}$/,                            // "****1234"
  /\s+gbp\s+[\d.]+$/i,                         // "GBP 12.34" amount echo
  /\s+[A-Z]{2}\d{2,}$/,                        // country-code + numbers
  /\s+\d{6,}$/,                                // long numeric tails
];

/**
 * Normalise a raw transaction description into a clean merchant name.
 *
 * Returns null if the input is empty or reduces to nothing after cleaning.
 */
export function normaliseMerchant(raw: string): string | null {
  if (!raw || !raw.trim()) return null;

  let cleaned = raw.trim();

  // Strip prefixes
  for (const re of NOISE_PREFIXES) {
    cleaned = cleaned.replace(re, '');
  }

  // Strip suffixes (apply repeatedly — some stack)
  for (let pass = 0; pass < 2; pass++) {
    for (const re of NOISE_SUFFIXES) {
      cleaned = cleaned.replace(re, '');
    }
  }

  // Collapse whitespace
  cleaned = cleaned.replace(/\s+/g, ' ').trim();

  if (cleaned.length < 2) return null;

  // Title-case: "TESCO STORES" → "Tesco Stores"
  cleaned = toTitleCase(cleaned);

  // If brand dictionary cache is loaded, use canonical brand name
  const brand = resolveBrandSync(raw);
  if (brand) return brand.brand;

  return cleaned;
}

function toTitleCase(str: string): string {
  return str
    .toLowerCase()
    .replace(/(?:^|\s)\S/g, (ch) => ch.toUpperCase());
}
