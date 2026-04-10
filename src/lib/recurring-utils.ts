export type RecurringPattern = 'daily' | 'weekly' | 'biweekly' | 'monthly' | 'yearly';

export const VALID_RECURRING_PATTERNS: readonly RecurringPattern[] = [
  'daily', 'weekly', 'biweekly', 'monthly', 'yearly',
] as const;

/** Minimum occurrences to auto-detect a recurring pattern (manual override still possible). */
export const MIN_RECURRING_OCCURRENCES = 3;

/** Amount tolerance (±15 %) for grouping recurring transactions. */
export const RECURRING_AMOUNT_TOLERANCE = 0.15;

/**
 * Compute the next occurrence date given the last date and pattern.
 */
export function computeNextRecurringDate(dateStr: string, pattern: RecurringPattern): string {
  const [y, m, day] = dateStr.split('-').map(Number);
  const d = new Date(Date.UTC(y, m - 1, day));
  switch (pattern) {
    case 'daily': d.setUTCDate(d.getUTCDate() + 1); break;
    case 'weekly': d.setUTCDate(d.getUTCDate() + 7); break;
    case 'biweekly': d.setUTCDate(d.getUTCDate() + 14); break;
    case 'monthly': d.setUTCMonth(d.getUTCMonth() + 1); break;
    case 'yearly': d.setUTCFullYear(d.getUTCFullYear() + 1); break;
  }
  return d.toISOString().split('T')[0];
}

/**
 * Infer a recurring pattern from the average days between occurrences.
 * Intentionally excludes "daily" — daily charges are almost never genuine
 * recurring subscriptions and would pollute the recurring page.
 */
export function inferRecurringPattern(avgDays: number): RecurringPattern | null {
  if (avgDays >= 5 && avgDays <= 9) return 'weekly';
  if (avgDays >= 12 && avgDays <= 18) return 'biweekly';
  if (avgDays >= 25 && avgDays <= 35) return 'monthly';
  if (avgDays >= 340 && avgDays <= 395) return 'yearly';
  return null;
}

/**
 * Check whether a set of amounts are consistent within the tolerance band.
 */
export function isAmountConsistent(amounts: number[]): boolean {
  if (amounts.length === 0) return false;
  const sorted = [...amounts].sort((a, b) => a - b);
  const median = sorted[Math.floor(sorted.length / 2)];
  if (median === 0) return amounts.every((a) => a === 0);
  return sorted.every((a) => Math.abs(a - median) / median <= RECURRING_AMOUNT_TOLERANCE);
}

/**
 * Normalise a transaction description for dedup / grouping.
 */
export function normaliseForDedup(description: string): string {
  return description
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}
