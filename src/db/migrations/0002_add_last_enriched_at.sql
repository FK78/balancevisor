-- Add last_enriched_at to user_preferences for on-login enrichment cooldown
ALTER TABLE user_preferences
ADD COLUMN IF NOT EXISTS last_enriched_at timestamptz;
