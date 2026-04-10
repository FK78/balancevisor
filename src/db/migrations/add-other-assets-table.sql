-- General other_assets table for physical gold, silver, property, pensions, etc.
-- Feeds into both net worth and zakat calculations.
CREATE TABLE IF NOT EXISTS other_assets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name varchar(255) NOT NULL,
  asset_type varchar(30) NOT NULL,
  value numeric NOT NULL DEFAULT 0,
  weight_grams numeric,
  is_zakatable boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS other_assets_user_id_idx ON other_assets (user_id);

-- Add other_assets_value column to zakat_calculations for breakdown
ALTER TABLE zakat_calculations
  ADD COLUMN IF NOT EXISTS other_assets_value numeric NOT NULL DEFAULT 0;

-- Cleanup: remove old physical gold/silver columns if they were previously added
ALTER TABLE zakat_settings
  DROP COLUMN IF EXISTS physical_gold_grams,
  DROP COLUMN IF EXISTS physical_silver_grams;

ALTER TABLE zakat_calculations
  DROP COLUMN IF EXISTS physical_gold_value,
  DROP COLUMN IF EXISTS physical_silver_value;
