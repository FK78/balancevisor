-- Global brand / merchant alias dictionary.
-- System-wide (no user_id) — survives user deletion.
-- Seeded with curated UK brands, grows via anonymous user contributions.

CREATE TABLE global_merchant_aliases (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  alias             VARCHAR(255) NOT NULL UNIQUE,
  brand             VARCHAR(255) NOT NULL,
  default_category  VARCHAR(100) NOT NULL,
  brand_type        VARCHAR(20)  NOT NULL DEFAULT 'general',
  subscription_name VARCHAR(255),
  lender_for        VARCHAR(255),
  vote_count        INTEGER      NOT NULL DEFAULT 1,
  source            VARCHAR(20)  NOT NULL DEFAULT 'seed',
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW(),
  updated_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX global_merchant_aliases_brand_idx ON global_merchant_aliases (brand);
CREATE INDEX global_merchant_aliases_type_idx  ON global_merchant_aliases (brand_type);
