-- Migration: Smart Categorisation
-- Adds merchant_mappings table and category_source + merchant_name columns to transactions.
-- Safe to run multiple times (IF NOT EXISTS / ADD COLUMN IF NOT EXISTS).
-- Run this in the Supabase SQL Editor.

-- ---------------------------------------------------------------------------
-- 1. New columns on transactions
-- ---------------------------------------------------------------------------

ALTER TABLE transactions
  ADD COLUMN IF NOT EXISTS category_source VARCHAR(20),
  ADD COLUMN IF NOT EXISTS merchant_name   VARCHAR(255);

-- ---------------------------------------------------------------------------
-- 2. New table: merchant_mappings
-- ---------------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS merchant_mappings (
  id          UUID        PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID        NOT NULL,
  merchant    VARCHAR(255) NOT NULL,
  category_id UUID        REFERENCES categories(id) ON DELETE CASCADE,
  source      VARCHAR(20) NOT NULL DEFAULT 'correction',
  created_at  TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes (idempotent — CREATE INDEX IF NOT EXISTS)
CREATE UNIQUE INDEX IF NOT EXISTS merchant_mappings_user_merchant_idx
  ON merchant_mappings (user_id, merchant);

CREATE INDEX IF NOT EXISTS merchant_mappings_user_id_idx
  ON merchant_mappings (user_id);
