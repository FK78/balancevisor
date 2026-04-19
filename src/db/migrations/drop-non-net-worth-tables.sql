-- =============================================================================
-- Net-Worth Tracker Pivot: schema cleanup migration
-- =============================================================================
-- Drops all tables, columns, and enums that are no longer referenced by the
-- application after pivoting from a full-featured budgeting app to a net-worth
-- tracker.
--
-- Order matters: child tables → parent tables → enums. Uses IF EXISTS +
-- CASCADE so this script is safe to run repeatedly or against partially
-- migrated databases.
--
-- Usage:
--   psql "$DATABASE_URL" -f src/db/migrations/drop-non-net-worth-tables.sql
-- =============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Drop removed tables (children first, then parents)
-- ---------------------------------------------------------------------------

-- Transaction-related
DROP TABLE IF EXISTS transaction_splits CASCADE;
DROP TABLE IF EXISTS transaction_review_flags CASCADE;
DROP TABLE IF EXISTS transactions CASCADE;

-- Categorisation
DROP TABLE IF EXISTS categorisation_rules CASCADE;
DROP TABLE IF EXISTS merchant_mappings CASCADE;
DROP TABLE IF EXISTS global_merchant_aliases CASCADE;
DROP TABLE IF EXISTS default_category_templates CASCADE;
DROP TABLE IF EXISTS categories CASCADE;

-- Budgeting / notifications
DROP TABLE IF EXISTS budget_notifications CASCADE;
DROP TABLE IF EXISTS budget_alert_preferences CASCADE;
DROP TABLE IF EXISTS budgets CASCADE;
DROP TABLE IF EXISTS nudge_dismissals CASCADE;
DROP TABLE IF EXISTS notifications CASCADE;

-- Goals / debts / subscriptions
DROP TABLE IF EXISTS debt_payments CASCADE;
DROP TABLE IF EXISTS debts CASCADE;
DROP TABLE IF EXISTS goals CASCADE;
DROP TABLE IF EXISTS subscriptions CASCADE;

-- Sharing / retirement / misc
DROP TABLE IF EXISTS shared_access CASCADE;
DROP TABLE IF EXISTS shared_snapshots CASCADE;
DROP TABLE IF EXISTS retirement_profiles CASCADE;
DROP TABLE IF EXISTS trading212_connections CASCADE;

-- ---------------------------------------------------------------------------
-- 2. Drop removed columns on retained tables
-- ---------------------------------------------------------------------------

-- broker_connections: error tracking columns removed (logged instead)
ALTER TABLE IF EXISTS broker_connections
  DROP COLUMN IF EXISTS last_error,
  DROP COLUMN IF EXISTS consecutive_failures;

-- accounts: columns tied to deleted features (enrichment, sharing, open-banking metadata)
ALTER TABLE IF EXISTS accounts
  DROP COLUMN IF EXISTS last_enriched_at,
  DROP COLUMN IF EXISTS enrichment_cursor,
  DROP COLUMN IF EXISTS shared_from_user_id,
  DROP COLUMN IF EXISTS is_shared;

-- user_onboarding: category/budget onboarding fields no longer relevant.
-- Note: `use_default_categories` is kept for now because existing rows may
-- have it set and the application no longer reads it. Drop if desired:
-- ALTER TABLE IF EXISTS user_onboarding DROP COLUMN IF EXISTS use_default_categories;

-- user_preferences: drop any feature-specific toggles that referred to
-- removed features (safe no-op if columns don't exist).
ALTER TABLE IF EXISTS user_preferences
  DROP COLUMN IF EXISTS budget_alert_emails,
  DROP COLUMN IF EXISTS weekly_digest_enabled,
  DROP COLUMN IF EXISTS monthly_report_enabled;

-- ---------------------------------------------------------------------------
-- 3. Drop removed enums (drop AFTER tables that referenced them are gone)
-- ---------------------------------------------------------------------------

DROP TYPE IF EXISTS transaction_type CASCADE;
DROP TYPE IF EXISTS recurring_pattern CASCADE;
DROP TYPE IF EXISTS period CASCADE;
DROP TYPE IF EXISTS billing_cycle CASCADE;
DROP TYPE IF EXISTS review_flag_type CASCADE;
DROP TYPE IF EXISTS alert_type CASCADE;
DROP TYPE IF EXISTS shared_resource_type CASCADE;
DROP TYPE IF EXISTS shared_permission CASCADE;
DROP TYPE IF EXISTS shared_status CASCADE;
DROP TYPE IF EXISTS goal_type CASCADE;
DROP TYPE IF EXISTS debt_type CASCADE;
DROP TYPE IF EXISTS subscription_frequency CASCADE;

-- ---------------------------------------------------------------------------
-- 4. Clean up disabled_features preferences that reference removed feature IDs
-- ---------------------------------------------------------------------------
-- disabled_features is a JSON text column; clear any legacy entries that
-- reference features no longer in FEATURE_DEFINITIONS (accounts, investments, zakat).
-- Safer to just reset to NULL — the UI will repopulate valid entries on next save.

UPDATE user_preferences
SET disabled_features = NULL
WHERE disabled_features IS NOT NULL
  AND disabled_features NOT SIMILAR TO '%(accounts|investments|zakat)%';

-- Similarly clear pending_features on user_onboarding for completed users
-- that list removed features.
UPDATE user_onboarding
SET pending_features = NULL
WHERE pending_features IS NOT NULL
  AND pending_features NOT SIMILAR TO '%(accounts|investments|zakat)%';

COMMIT;

-- =============================================================================
-- Post-migration verification queries (run manually):
-- =============================================================================
-- SELECT table_name FROM information_schema.tables
--   WHERE table_schema = 'public' ORDER BY table_name;
--
-- SELECT typname FROM pg_type
--   WHERE typtype = 'e' ORDER BY typname;
--
-- SELECT column_name FROM information_schema.columns
--   WHERE table_name = 'broker_connections' AND table_schema = 'public';
-- =============================================================================
