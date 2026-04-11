-- Cleanup: remove per-user merchant_mappings rows that are redundant with
-- the global brand dictionary (same merchant → same category name).
-- Run AFTER the global_merchant_aliases table has been seeded.
-- This is a one-time migration — safe to re-run (no-op if already cleaned).

DELETE FROM merchant_mappings mm
USING global_merchant_aliases gma, categories c
WHERE mm.category_id = c.id
  AND gma.alias = LOWER(mm.merchant)
  AND LOWER(c.name) = LOWER(gma.default_category);
