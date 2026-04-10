/**
 * Maps TrueLayer `transaction_category` values to user category names.
 *
 * TrueLayer provides categories like "PURCHASE", "BILL_PAYMENT", "ATM", etc.
 * We attempt a best-effort match against the user's own category set via
 * a static mapping to common category names, then fuzzy substring matching.
 */

// Static mapping: TrueLayer category → likely user-facing category names (in priority order)
const TL_TO_CATEGORY_NAMES: Record<string, string[]> = {
  PURCHASE:       ['Shopping', 'General', 'Uncategorised'],
  BILL_PAYMENT:   ['Bills', 'Utilities', 'Bills & Utilities'],
  DIRECT_DEBIT:   ['Bills', 'Subscriptions', 'Bills & Utilities'],
  STANDING_ORDER: ['Bills', 'Rent', 'Savings'],
  ATM:            ['Cash', 'ATM', 'Withdrawals'],
  TRANSFER:       ['Transfer', 'Savings'],
  INTEREST:       ['Income', 'Interest', 'Savings'],
  DIVIDEND:       ['Income', 'Dividends', 'Investments'],
  CREDIT:         ['Income'],
  DEBIT:          ['General', 'Shopping'],
  FEE:            ['Fees', 'Bank Fees', 'Bills'],
  CHARGE:         ['Fees', 'Bank Fees', 'Bills'],
  CASH:           ['Cash', 'ATM'],
  CHEQUE:         ['General'],
  OTHER:          ['General', 'Uncategorised'],
};

type UserCategory = { id: string; name: string };

/**
 * Given a TrueLayer transaction_category string and the user's categories,
 * return the best-matching user category ID, or null if no reasonable match.
 */
export function mapTrueLayerCategory(
  tlCategory: string | null | undefined,
  userCategories: UserCategory[],
): string | null {
  if (!tlCategory || userCategories.length === 0) return null;

  const key = tlCategory.toUpperCase().replace(/\s+/g, '_');
  const candidates = TL_TO_CATEGORY_NAMES[key];

  if (!candidates) return null;

  // Try exact name match first (case-insensitive)
  for (const candidateName of candidates) {
    const match = userCategories.find(
      (c) => c.name.toLowerCase() === candidateName.toLowerCase(),
    );
    if (match) return match.id;
  }

  // Fallback: substring match (e.g. user has "Bills & Utilities", candidate is "Bills")
  for (const candidateName of candidates) {
    const lc = candidateName.toLowerCase();
    const match = userCategories.find(
      (c) => c.name.toLowerCase().includes(lc) || lc.includes(c.name.toLowerCase()),
    );
    if (match) return match.id;
  }

  return null;
}
