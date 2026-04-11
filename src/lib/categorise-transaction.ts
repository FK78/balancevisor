/**
 * Unified transaction categorisation pipeline.
 *
 * Priority:
 *   1. User merchant mapping override              → source: 'merchant'
 *   2. Global brand dictionary (system-wide)        → source: 'brand'
 *   3. User's categorisation rules (pattern match)  → source: 'rule'
 *   4. TrueLayer bank category (mapped to user cat) → source: 'bank'
 *   5. Fallback: null (uncategorised)
 *
 * AI categorisation is run separately in batch after import, not inline here.
 */

import type { CategorisationRule } from '@/lib/auto-categorise';
import { matchAgainstRules } from '@/lib/auto-categorise';
import { normaliseMerchant } from '@/lib/merchant-normalise';
import { mapTrueLayerCategory } from '@/lib/truelayer-category-map';
import { resolveBrandSync } from '@/lib/brand-dictionary';

export type CategorySource = 'manual' | 'rule' | 'merchant' | 'brand' | 'bank' | 'ai';

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

  // 1. User merchant mapping override (sparse — only disagreements with global)
  if (merchantName) {
    const merchantLower = merchantName.toLowerCase();
    const mapping = ctx.merchantMappings.find(
      (m) => m.merchant.toLowerCase() === merchantLower,
    );
    if (mapping?.category_id) {
      return { categoryId: mapping.category_id, categorySource: 'merchant', merchantName };
    }
  }

  // 2. Global brand dictionary (sync, uses in-memory cache)
  const brand = resolveBrandSync(description);
  if (brand) {
    const brandCat = ctx.userCategories.find(
      (c) => c.name.toLowerCase() === brand.defaultCategory.toLowerCase(),
    );
    if (brandCat) {
      return { categoryId: brandCat.id, categorySource: 'brand', merchantName };
    }
  }

  // 3. User's categorisation rules (substring pattern match)
  const ruleMatch = matchAgainstRules(ctx.rules, description);
  if (ruleMatch) {
    return { categoryId: ruleMatch, categorySource: 'rule', merchantName };
  }

  // 4. TrueLayer bank category mapping
  if (tlCategory) {
    const bankMatch = mapTrueLayerCategory(tlCategory, ctx.userCategories);
    if (bankMatch) {
      return { categoryId: bankMatch, categorySource: 'bank', merchantName };
    }
  }

  // 5. No match — return uncategorised
  return { categoryId: null, categorySource: null, merchantName };
}
