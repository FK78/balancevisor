-- Performance indexes for common query patterns
-- Run manually: psql $DATABASE_URL -f src/db/migrations/0003_add_performance_indexes.sql

-- Used by transaction search (SQL-level search on merchant_name)
CREATE INDEX IF NOT EXISTS idx_transactions_merchant_name
  ON transactions (merchant_name)
  WHERE merchant_name IS NOT NULL;

-- Used by enrichment pipeline: finding transactions linked to subscriptions
CREATE INDEX IF NOT EXISTS idx_transactions_subscription_id
  ON transactions (subscription_id)
  WHERE subscription_id IS NOT NULL;

-- Used by enrichment pipeline: finding transactions linked to debts
CREATE INDEX IF NOT EXISTS idx_transactions_linked_debt_id
  ON transactions (linked_debt_id)
  WHERE linked_debt_id IS NOT NULL;

-- Used by bulk-categorise and deterministic-categorise: uncategorised transactions per user
CREATE INDEX IF NOT EXISTS idx_transactions_user_uncategorised
  ON transactions (user_id)
  WHERE category_id IS NULL;
