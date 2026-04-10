-- ============================================================================
-- RLS Verification Script
--
-- Run as the app_user role to verify RLS policies are active.
-- Should return 0 rows for every table when no user ID is set,
-- and only the matching user's rows when a user ID is set.
--
-- Usage:
--   psql $DATABASE_URL -f src/db/migrations/verify-rls.sql
-- ============================================================================

-- Reset session
SELECT set_config('app.current_user_id', '', true);

-- ---------------------------------------------------------------------------
-- Test 1: Without user ID set, all RLS-protected tables should return 0 rows
-- ---------------------------------------------------------------------------
\echo '=== Test 1: No user ID set — all tables should return 0 rows ==='

DO $$
DECLARE
  tbl TEXT;
  cnt BIGINT;
  all_pass BOOLEAN := true;
BEGIN
  FOR tbl IN
    SELECT unnest(ARRAY[
      'accounts', 'transactions', 'categories', 'budgets', 'goals',
      'debts', 'subscriptions', 'manual_holdings', 'holding_sales',
      'broker_connections', 'investment_groups', 'merchant_mappings',
      'categorisation_rules', 'net_worth_snapshots', 'budget_alert_preferences',
      'budget_notifications', 'mfa_backup_codes', 'zakat_settings',
      'zakat_calculations', 'transaction_review_flags', 'dashboard_layouts',
      'truelayer_connections', 'user_onboarding', 'user_preferences',
      'user_keys', 'retirement_profiles', 'shared_access',
      'transaction_splits', 'debt_payments'
    ])
  LOOP
    EXECUTE format('SELECT count(*) FROM %I', tbl) INTO cnt;
    IF cnt > 0 THEN
      RAISE WARNING 'FAIL: % returned % rows without user ID set', tbl, cnt;
      all_pass := false;
    ELSE
      RAISE NOTICE 'PASS: % returned 0 rows', tbl;
    END IF;
  END LOOP;

  IF all_pass THEN
    RAISE NOTICE '✅ All tables correctly return 0 rows without user ID';
  ELSE
    RAISE WARNING '❌ Some tables leaked rows without user ID set';
  END IF;
END
$$;

-- ---------------------------------------------------------------------------
-- Test 2: default_category_templates should be readable (no RLS)
-- ---------------------------------------------------------------------------
\echo '=== Test 2: default_category_templates should be readable ==='

DO $$
DECLARE
  cnt BIGINT;
BEGIN
  SELECT count(*) FROM default_category_templates INTO cnt;
  RAISE NOTICE 'default_category_templates: % rows (expected: > 0 if seeded)', cnt;
END
$$;

\echo '=== RLS verification complete ==='
