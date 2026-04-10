-- Add connection health tracking columns to broker_connections
-- Run this against your production database before deploying

ALTER TABLE broker_connections
  ADD COLUMN IF NOT EXISTS last_error VARCHAR(500),
  ADD COLUMN IF NOT EXISTS consecutive_failures INTEGER NOT NULL DEFAULT 0;
