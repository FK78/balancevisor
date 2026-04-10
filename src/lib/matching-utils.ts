// ---------------------------------------------------------------------------
// String normalisation for fuzzy matching
// ---------------------------------------------------------------------------

const NOISE_WORDS = [
  "ltd", "limited", "inc", "plc", "corp", "co", "com", "www",
  "http", "https", "uk", "payment", "direct debit", "card",
  "subscription", "recurring", "autopay", "auto pay",
];

const MONTH_NAMES =
  "january|february|march|april|may|june|july|august|september|october|november|december" +
  "|jan|feb|mar|apr|jun|jul|aug|sep|oct|nov|dec";

export function normalise(text: string): string {
  let s = text.toLowerCase().trim();
  // Strip common suffixes, domains, punctuation
  s = s.replace(/[._\-*/\\@#]+/g, " ");
  for (const word of NOISE_WORDS) {
    s = s.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  }
  // Strip date-like patterns: "June 2024", "01/06/2024", "2024-06", standalone years
  s = s.replace(new RegExp(`\\b(${MONTH_NAMES})\\b`, "gi"), "");
  s = s.replace(/\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b/g, "");
  s = s.replace(/\b\d{4}[\/\-]\d{1,2}([\/\-]\d{1,2})?\b/g, "");
  s = s.replace(/\b(20\d{2}|19\d{2})\b/g, "");
  // Strip standalone day numbers (e.g. "1st", "15th", "23rd")
  s = s.replace(/\b\d{1,2}(st|nd|rd|th)\b/g, "");
  return s.replace(/\s+/g, " ").trim();
}

export function fuzzyMatch(txnDesc: string, targetName: string): boolean {
  const normTxn = normalise(txnDesc);
  const normTarget = normalise(targetName);

  if (!normTxn || !normTarget) return false;

  // Direct inclusion either way
  if (normTxn.includes(normTarget) || normTarget.includes(normTxn)) {
    return true;
  }

  // Token overlap: if >50% of target tokens are in txn
  const targetTokens = normTarget.split(" ").filter(Boolean);
  const txnTokens = new Set(normTxn.split(" ").filter(Boolean));
  if (targetTokens.length === 0) return false;

  const hits = targetTokens.filter((t) => txnTokens.has(t)).length;
  return hits / targetTokens.length >= 0.5;
}

export const AMOUNT_TOLERANCE = 0.05; // 5%
export const AMOUNT_TOLERANCE_GENEROUS = 0.30; // 30% — for auto-linking (price changes, plan upgrades)

export function amountsMatch(actual: number, expected: number): boolean {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= AMOUNT_TOLERANCE;
}

export function amountsCloseEnough(actual: number, expected: number): boolean {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= AMOUNT_TOLERANCE_GENEROUS;
}
