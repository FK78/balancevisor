import { db } from "@/index";
import { globalMerchantAliasesTable } from "@/db/schema";

export type GlobalAlias = typeof globalMerchantAliasesTable.$inferSelect;

/**
 * Fetch every row from the global_merchant_aliases table.
 * Used to populate the in-memory brand cache — call sparingly.
 */
export async function getAllGlobalAliases(): Promise<GlobalAlias[]> {
  return db.select().from(globalMerchantAliasesTable);
}
