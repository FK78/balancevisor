-- Harvest existing per-user merchant_mappings into the global brand dictionary,
-- then remove the redundant per-user rows.
-- Run AFTER the global_merchant_aliases table has been created and seeded.
-- Safe to re-run (idempotent — upserts + conditional delete).

-- Step 1: Harvest ALL per-user mappings into global_merchant_aliases.
--   - Existing aliases: increment vote_count (one vote per distinct user).
--   - New aliases: insert with source='user' and vote_count = number of users.
INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source, vote_count)
SELECT
  LOWER(mm.merchant)       AS alias,
  mm.merchant              AS brand,
  c.name                   AS default_category,
  'general'                AS brand_type,
  'user'                   AS source,
  COUNT(DISTINCT mm.user_id) AS vote_count
FROM merchant_mappings mm
JOIN categories c ON mm.category_id = c.id
GROUP BY LOWER(mm.merchant), mm.merchant, c.name
ON CONFLICT (alias) DO UPDATE SET
  vote_count  = global_merchant_aliases.vote_count + EXCLUDED.vote_count,
  updated_at  = NOW();

-- Step 2: Delete per-user rows that now match the global default exactly.
-- Only removes rows where the user's category agrees with the global entry.
-- Rows where the user chose a DIFFERENT category are kept as overrides.
DELETE FROM merchant_mappings mm
USING global_merchant_aliases gma, categories c
WHERE mm.category_id = c.id
  AND gma.alias = LOWER(mm.merchant)
  AND LOWER(c.name) = LOWER(gma.default_category);
