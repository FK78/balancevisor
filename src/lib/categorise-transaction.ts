/**
 * Unified transaction categorisation pipeline.
 *
 * Priority:
 *   1. User's categorisation rules (pattern match)  → source: 'rule'
 *   2. Merchant mapping (exact normalised merchant)  → source: 'merchant'
 *   3. TrueLayer bank category (mapped to user cat)  → source: 'bank'
 *   4. Fallback: null (uncategorised)
 *
 * AI categorisation is run separately in batch after import, not inline here.
 */

import type { CategorisationRule } from '@/lib/auto-categorise';
import { matchAgainstRules } from '@/lib/auto-categorise';
import { normaliseMerchant } from '@/lib/merchant-normalise';
import { mapTrueLayerCategory } from '@/lib/truelayer-category-map';

export type CategorySource = 'manual' | 'rule' | 'merchant' | 'bank' | 'ai';

export type CategoriseResult = {
  categoryId: string | null;
  categorySource: CategorySource | null;
  merchantName: string | null;
};

type MerchantMap = { merchant: string; category_id: string | null }[];
type UserCategory = { id: string; name: string };

export type CategoriseContext = {
  rules: CategorisationRule[];
  merchantMappings: MerchantMap;
  userCategories: UserCategory[];
};

/**
 * Run the categorisation pipeline for a single transaction.
 *
 * @param description  - Raw bank transaction description
 * @param ctx          - Pre-fetched rules, merchant mappings, and user categories
 * @param tlCategory   - Optional TrueLayer transaction_category string
 */
export function categoriseTransaction(
  description: string,
  ctx: CategoriseContext,
  tlCategory?: string | null,
): CategoriseResult {
  const merchantName = normaliseMerchant(description);

  // 1. User's categorisation rules (substring pattern match)
  const ruleMatch = matchAgainstRules(ctx.rules, description);
  if (ruleMatch) {
    return { categoryId: ruleMatch, categorySource: 'rule', merchantName };
  }

  // 2. Merchant mapping (exact normalised merchant match)
  if (merchantName) {
    const merchantLower = merchantName.toLowerCase();
    const mapping = ctx.merchantMappings.find(
      (m) => m.merchant.toLowerCase() === merchantLower,
    );
    if (mapping?.category_id) {
      return { categoryId: mapping.category_id, categorySource: 'merchant', merchantName };
    }
  }

  // 3. TrueLayer bank category mapping
  if (tlCategory) {
    const bankMatch = mapTrueLayerCategory(tlCategory, ctx.userCategories);
    if (bankMatch) {
      return { categoryId: bankMatch, categorySource: 'bank', merchantName };
    }
  }

  // 4. No match — return uncategorised
  return { categoryId: null, categorySource: null, merchantName };
}
