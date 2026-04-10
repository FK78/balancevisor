-- ============================================================================
-- Row Level Security: Defense-in-Depth
--
-- Adds Postgres RLS policies to all user-owned tables.
-- Uses a session variable (app.current_user_id) set per-request by the
-- application layer. This is pure Postgres — no Supabase dependency.
--
-- Run with a superuser / owner role:
--   psql $DATABASE_URL -f src/db/migrations/rls-setup.sql
-- ============================================================================

BEGIN;

-- ---------------------------------------------------------------------------
-- 1. Create restricted application role (idempotent)
-- ---------------------------------------------------------------------------

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_roles WHERE rolname = 'app_user') THEN
    CREATE ROLE app_user WITH LOGIN NOINHERIT;
  END IF;
END
$$;

-- Grant connect + usage
GRANT CONNECT ON DATABASE CURRENT_DATABASE() TO app_user;
GRANT USAGE ON SCHEMA public TO app_user;

-- Grant table-level DML on all existing tables
GRANT SELECT, INSERT, UPDATE, DELETE ON ALL TABLES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT SELECT, INSERT, UPDATE, DELETE ON TABLES TO app_user;

-- Grant sequence usage (for uuid_generate_v4, serial columns, etc.)
GRANT USAGE, SELECT ON ALL SEQUENCES IN SCHEMA public TO app_user;
ALTER DEFAULT PRIVILEGES IN SCHEMA public
  GRANT USAGE, SELECT ON SEQUENCES TO app_user;

-- ---------------------------------------------------------------------------
-- 2. Helper: extract current user id from session variable
-- ---------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION current_app_user_id()
RETURNS uuid
LANGUAGE sql
STABLE
AS $$
  SELECT NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- ---------------------------------------------------------------------------
-- 3. Enable RLS + create policies for tables with user_id column
-- ---------------------------------------------------------------------------

-- Tables where user_id is a regular column
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'accounts',
      'transactions',
      'categories',
      'budgets',
      'goals',
      'debts',
      'subscriptions',
      'manual_holdings',
      'holding_sales',
      'broker_connections',
      'investment_groups',
      'merchant_mappings',
      'categorisation_rules',
      'net_worth_snapshots',
      'budget_alert_preferences',
      'budget_notifications',
      'mfa_backup_codes',
      'zakat_settings',
      'zakat_calculations',
      'transaction_review_flags',
      'dashboard_layouts',
      'truelayer_connections'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);

    -- Drop existing policy if re-running
    EXECUTE format(
      'DROP POLICY IF EXISTS rls_user_isolation ON %I', tbl
    );

    -- Policy: user can only see/modify their own rows
    EXECUTE format(
      'CREATE POLICY rls_user_isolation ON %I
         FOR ALL
         USING (user_id = current_app_user_id())
         WITH CHECK (user_id = current_app_user_id())',
      tbl
    );
  END LOOP;
END
$$;

-- Tables where user_id IS the primary key
DO $$
DECLARE
  tbl TEXT;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'user_onboarding',
      'user_preferences',
      'user_keys',
      'retirement_profiles'
    ])
  LOOP
    EXECUTE format('ALTER TABLE %I ENABLE ROW LEVEL SECURITY', tbl);
    EXECUTE format('ALTER TABLE %I FORCE ROW LEVEL SECURITY', tbl);

    EXECUTE format(
      'DROP POLICY IF EXISTS rls_user_isolation ON %I', tbl
    );

    EXECUTE format(
      'CREATE POLICY rls_user_isolation ON %I
         FOR ALL
         USING (user_id = current_app_user_id())
         WITH CHECK (user_id = current_app_user_id())',
      tbl
    );
  END LOOP;
END
$$;

-- ---------------------------------------------------------------------------
-- 4. Special policy: shared_access (owner_id OR shared_with_id)
-- ---------------------------------------------------------------------------

ALTER TABLE shared_access ENABLE ROW LEVEL SECURITY;
ALTER TABLE shared_access FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_shared_access ON shared_access;
CREATE POLICY rls_shared_access ON shared_access
  FOR ALL
  USING (
    owner_id = current_app_user_id()
    OR shared_with_id = current_app_user_id()
  )
  WITH CHECK (
    owner_id = current_app_user_id()
    OR shared_with_id = current_app_user_id()
  );

-- ---------------------------------------------------------------------------
-- 5. Child tables: inherit access via parent FK
-- ---------------------------------------------------------------------------

-- transaction_splits: visible if the parent transaction belongs to the user
ALTER TABLE transaction_splits ENABLE ROW LEVEL SECURITY;
ALTER TABLE transaction_splits FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_transaction_splits ON transaction_splits;
CREATE POLICY rls_transaction_splits ON transaction_splits
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_splits.transaction_id
        AND t.user_id = current_app_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM transactions t
      WHERE t.id = transaction_splits.transaction_id
        AND t.user_id = current_app_user_id()
    )
  );

-- debt_payments: visible if the parent debt belongs to the user
ALTER TABLE debt_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE debt_payments FORCE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS rls_debt_payments ON debt_payments;
CREATE POLICY rls_debt_payments ON debt_payments
  FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM debts d
      WHERE d.id = debt_payments.debt_id
        AND d.user_id = current_app_user_id()
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM debts d
      WHERE d.id = debt_payments.debt_id
        AND d.user_id = current_app_user_id()
    )
  );

-- ---------------------------------------------------------------------------
-- 6. Global / system tables: NO RLS (read-only reference data)
-- ---------------------------------------------------------------------------

-- default_category_templates is public reference data — no RLS needed.
-- If RLS was previously enabled, disable it:
ALTER TABLE default_category_templates DISABLE ROW LEVEL SECURITY;

-- ---------------------------------------------------------------------------
-- 7. Superuser / migration bypass
--
-- The table owner (usually 'postgres') always bypasses RLS unless
-- FORCE ROW LEVEL SECURITY is set. We used FORCE above so even the owner
-- role respects RLS. To bypass for migrations/cron, SET LOCAL role:
--
--   SET LOCAL app.current_user_id = '';   -- clears the var
--   SET LOCAL ROLE postgres;              -- or your superuser role
--
-- Alternatively, use a separate connection with the owner role.
-- ---------------------------------------------------------------------------

COMMIT;
