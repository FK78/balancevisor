// ---------------------------------------------------------------------------
// String normalisation for fuzzy matching
// ---------------------------------------------------------------------------

const NOISE_WORDS = [
  "ltd", "limited", "inc", "plc", "corp", "co", "com", "www",
  "http", "https", "uk", "payment", "direct debit", "card",
  "subscription", "recurring", "autopay", "auto pay",
];

export function normalise(text: string): string {
  let s = text.toLowerCase().trim();
  // Strip common suffixes, domains, punctuation
  s = s.replace(/[._\-*/\\@#]+/g, " ");
  for (const word of NOISE_WORDS) {
    s = s.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  }
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

export function amountsMatch(actual: number, expected: number): boolean {
  if (expected === 0) return actual === 0;
  return Math.abs(actual - expected) / expected <= AMOUNT_TOLERANCE;
}
