import { db } from "@/index";
import { globalMerchantAliasesTable } from "@/db/schema";
import { sql } from "drizzle-orm";
import { invalidateBrandCache } from "@/lib/brand-dictionary";

/**
 * Upsert a merchant alias into the global dictionary.
 * No user_id — completely anonymous. If the alias already exists,
 * increments vote_count. If new, inserts with vote_count=1.
 *
 * Fire-and-forget from learn flows — errors are swallowed.
 */
export async function contributeAlias(
  alias: string,
  brand: string,
  defaultCategory: string,
  brandType: string = "general",
): Promise<void> {
  if (!alias || !brand || !defaultCategory) return;

  const normalisedAlias = alias.toLowerCase().trim();
  if (normalisedAlias.length < 2) return;

  await db
    .insert(globalMerchantAliasesTable)
    .values({
      alias: normalisedAlias,
      brand,
      default_category: defaultCategory,
      brand_type: brandType,
      source: "user",
    })
    .onConflictDoUpdate({
      target: globalMerchantAliasesTable.alias,
      set: {
        vote_count: sql`${globalMerchantAliasesTable.vote_count} + 1`,
        updated_at: new Date(),
      },
    });

  invalidateBrandCache();
}
