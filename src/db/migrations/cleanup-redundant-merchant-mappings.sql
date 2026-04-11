-- Harvest existing per-user merchant_mappings into the global brand dictionary,
-- then remove the redundant per-user rows.
-- Run AFTER the global_merchant_aliases table has been created and seeded.
-- Safe to re-run (idempotent — upserts + conditional delete).

-- Step 1: Harvest per-user mappings into global_merchant_aliases.
--   For each distinct alias, pick the most popular category (highest user count).
--   - Existing aliases: increment vote_count.
--   - New aliases: insert with source='user'.
INSERT INTO global_merchant_aliases (alias, brand, default_category, brand_type, source, vote_count)
SELECT alias, brand, default_category, 'general', 'user', total_votes
FROM (
  SELECT
    LOWER(mm.merchant)            AS alias,
    mm.merchant                   AS brand,
    c.name                        AS default_category,
    COUNT(DISTINCT mm.user_id)    AS total_votes,
    ROW_NUMBER() OVER (
      PARTITION BY LOWER(mm.merchant)
      ORDER BY COUNT(DISTINCT mm.user_id) DESC, c.name
    ) AS rn
  FROM merchant_mappings mm
  JOIN categories c ON mm.category_id = c.id
  GROUP BY LOWER(mm.merchant), mm.merchant, c.name
) ranked
WHERE rn = 1
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
