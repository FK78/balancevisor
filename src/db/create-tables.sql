-- BalanceVisor — Fresh database setup
-- Run this against a clean PostgreSQL database to create all tables from scratch.
-- Requires: PostgreSQL 14+ with uuid-ossp extension.

-- Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ---------------------------------------------------------------------------
-- Enums
-- ---------------------------------------------------------------------------

CREATE TYPE account_type AS ENUM ('currentAccount', 'savings', 'creditCard', 'investment');
CREATE TYPE period AS ENUM ('monthly', 'weekly');
CREATE TYPE transaction_type AS ENUM ('income', 'expense', 'transfer', 'sale');
CREATE TYPE recurring_pattern AS ENUM ('daily', 'weekly', 'biweekly', 'monthly', 'yearly');
CREATE TYPE investment_type AS ENUM ('stock', 'real_estate', 'private_equity', 'other');
CREATE TYPE billing_cycle AS ENUM ('weekly', 'monthly', 'quarterly', 'yearly');
CREATE TYPE shared_resource_type AS ENUM ('account', 'budget');
CREATE TYPE shared_permission AS ENUM ('view', 'edit');
CREATE TYPE shared_status AS ENUM ('pending', 'accepted', 'declined');
CREATE TYPE alert_type AS ENUM ('threshold_warning', 'over_budget');

-- ---------------------------------------------------------------------------
-- Tables (ordered by foreign-key dependencies)
-- ---------------------------------------------------------------------------

-- 1. default_category_templates (no FK deps)
CREATE TABLE default_category_templates (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  name       VARCHAR(255) NOT NULL,
  color      VARCHAR(8)   NOT NULL,
  icon       VARCHAR(255),
  sort_order INTEGER      NOT NULL DEFAULT 0,
  is_active  BOOLEAN      NOT NULL DEFAULT TRUE
);

-- 2. user_onboarding (no FK deps)
CREATE TABLE user_onboarding (
  user_id                UUID PRIMARY KEY,
  base_currency          VARCHAR(3) NOT NULL DEFAULT 'GBP',
  use_default_categories BOOLEAN    NOT NULL DEFAULT FALSE,
  completed              BOOLEAN    NOT NULL DEFAULT FALSE,
  completed_at           TIMESTAMPTZ,
  pending_features       TEXT
);

-- 3. truelayer_connections (no FK deps)
CREATE TABLE truelayer_connections (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID        NOT NULL,
  access_token     TEXT        NOT NULL,
  refresh_token    TEXT        NOT NULL,
  token_expires_at TIMESTAMPTZ NOT NULL,
  provider_name    VARCHAR(255),
  connected_at     TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  last_synced_at   TIMESTAMPTZ
);

-- 4. accounts (FK → truelayer_connections)
CREATE TABLE accounts (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID        NOT NULL,
  name                     TEXT        NOT NULL,
  type                     account_type,
  balance                  NUMERIC     NOT NULL,
  currency                 VARCHAR(3)  NOT NULL,
  truelayer_id             VARCHAR(255),
  truelayer_connection_id  UUID REFERENCES truelayer_connections(id)
);

CREATE INDEX accounts_user_id_idx ON accounts (user_id);

-- 5. categories (no FK deps)
CREATE TABLE categories (
  id      UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID         NOT NULL,
  name    VARCHAR(255) NOT NULL,
  color   VARCHAR(8)   NOT NULL,
  icon    VARCHAR(255)
);

CREATE INDEX categories_user_id_idx ON categories (user_id);

-- 6. transactions (FK → accounts, categories)
CREATE TABLE transactions (
  id                  UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  account_id          UUID REFERENCES accounts(id),
  category_id         UUID REFERENCES categories(id),
  type                transaction_type NOT NULL,
  amount              NUMERIC          NOT NULL,
  description         TEXT             NOT NULL,
  date                DATE,
  is_recurring        BOOLEAN          NOT NULL,
  recurring_pattern   recurring_pattern,
  next_recurring_date DATE,
  created_at          DATE DEFAULT CURRENT_DATE,
  transfer_account_id UUID REFERENCES accounts(id),
  truelayer_id        VARCHAR(255),
  is_split            BOOLEAN NOT NULL DEFAULT FALSE
);

CREATE INDEX transactions_account_id_idx      ON transactions (account_id);
CREATE INDEX transactions_category_id_idx     ON transactions (category_id);
CREATE INDEX transactions_date_idx            ON transactions (date);
CREATE INDEX transactions_account_id_date_idx ON transactions (account_id, date);

-- 7. budgets (FK → categories)
CREATE TABLE budgets (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID    NOT NULL,
  category_id UUID REFERENCES categories(id),
  amount      NUMERIC NOT NULL,
  period      period,
  start_date  DATE
);

CREATE INDEX budgets_user_id_idx ON budgets (user_id);

-- 8. categorisation_rules (FK → categories)
CREATE TABLE categorisation_rules (
  id          UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id     UUID         NOT NULL,
  pattern     VARCHAR(255) NOT NULL,
  category_id UUID REFERENCES categories(id),
  priority    INTEGER      NOT NULL
);

CREATE INDEX categorisation_rules_user_id_idx ON categorisation_rules (user_id);

-- 9. goals (no FK deps)
CREATE TABLE goals (
  id            UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id       UUID         NOT NULL,
  name          VARCHAR(255) NOT NULL,
  target_amount NUMERIC      NOT NULL,
  saved_amount  NUMERIC      NOT NULL DEFAULT 0,
  target_date   DATE,
  icon          VARCHAR(255),
  color         VARCHAR(8)   NOT NULL DEFAULT '#6366f1',
  created_at    TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX goals_user_id_idx ON goals (user_id);

-- 10. debts (no FK deps)
CREATE TABLE debts (
  id               UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id          UUID         NOT NULL,
  name             VARCHAR(255) NOT NULL,
  original_amount  NUMERIC      NOT NULL,
  remaining_amount NUMERIC      NOT NULL,
  interest_rate    NUMERIC      NOT NULL DEFAULT 0,
  minimum_payment  NUMERIC      NOT NULL DEFAULT 0,
  due_date         DATE,
  lender           VARCHAR(255),
  color            VARCHAR(8)   NOT NULL DEFAULT '#ef4444',
  is_paid_off      BOOLEAN      NOT NULL DEFAULT FALSE,
  created_at       TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX debts_user_id_idx ON debts (user_id);

-- 11. debt_payments (FK → debts, accounts)
CREATE TABLE debt_payments (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  debt_id    UUID        NOT NULL REFERENCES debts(id) ON DELETE CASCADE,
  account_id UUID        NOT NULL REFERENCES accounts(id),
  amount     NUMERIC     NOT NULL,
  date       DATE        NOT NULL,
  note       TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX debt_payments_debt_id_idx ON debt_payments (debt_id);

-- 12. budget_alert_preferences (FK → budgets)
CREATE TABLE budget_alert_preferences (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  budget_id      UUID    NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  user_id        UUID    NOT NULL,
  threshold      NUMERIC NOT NULL DEFAULT 80,
  browser_alerts BOOLEAN NOT NULL DEFAULT TRUE,
  email_alerts   BOOLEAN NOT NULL DEFAULT FALSE
);

-- 13. trading212_connections (FK → accounts)
CREATE TABLE trading212_connections (
  id                   UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id              UUID        NOT NULL UNIQUE,
  api_key_encrypted    TEXT        NOT NULL,
  api_secret_encrypted TEXT        NOT NULL DEFAULT '',
  environment          VARCHAR(10) NOT NULL DEFAULT 'live',
  account_id           UUID REFERENCES accounts(id) ON DELETE SET NULL,
  connected_at         TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 14. investment_groups (FK → accounts)
CREATE TABLE investment_groups (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID         NOT NULL,
  account_id UUID REFERENCES accounts(id) ON DELETE CASCADE,
  name       VARCHAR(255) NOT NULL,
  color      VARCHAR(8)   NOT NULL DEFAULT '#6366f1',
  icon       VARCHAR(255),
  sort_order INTEGER      NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

-- 15. manual_holdings (FK → accounts, investment_groups)
CREATE TABLE manual_holdings (
  id                       UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id                  UUID         NOT NULL,
  ticker                   VARCHAR(20),
  name                     VARCHAR(255) NOT NULL,
  quantity                 NUMERIC      NOT NULL,
  average_price            NUMERIC      NOT NULL,
  current_price            NUMERIC,
  currency                 VARCHAR(3)   NOT NULL DEFAULT 'GBP',
  investment_type          investment_type DEFAULT 'stock',
  estimated_return_percent NUMERIC,
  notes                    TEXT,
  account_id               UUID REFERENCES accounts(id) ON DELETE SET NULL,
  group_id                 UUID REFERENCES investment_groups(id) ON DELETE SET NULL,
  last_price_update        TIMESTAMPTZ,
  created_at               TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX manual_holdings_user_id_idx    ON manual_holdings (user_id);
CREATE INDEX manual_holdings_account_id_idx ON manual_holdings (account_id);

-- 16. holding_sales (FK → manual_holdings, accounts)
CREATE TABLE holding_sales (
  id              UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  holding_id      UUID        NOT NULL REFERENCES manual_holdings(id) ON DELETE CASCADE,
  user_id         UUID        NOT NULL,
  date            DATE        NOT NULL,
  quantity        NUMERIC     NOT NULL,
  price_per_unit  NUMERIC     NOT NULL,
  total_amount    NUMERIC     NOT NULL,
  realized_gain   NUMERIC     NOT NULL,
  cash_account_id UUID REFERENCES accounts(id) ON DELETE SET NULL,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX holding_sales_user_id_idx    ON holding_sales (user_id);
CREATE INDEX holding_sales_holding_id_idx ON holding_sales (holding_id);

-- 17. subscriptions (FK → categories, accounts)
CREATE TABLE subscriptions (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID         NOT NULL,
  name              VARCHAR(255) NOT NULL,
  amount            NUMERIC      NOT NULL,
  currency          VARCHAR(3)   NOT NULL DEFAULT 'GBP',
  billing_cycle     billing_cycle NOT NULL DEFAULT 'monthly',
  next_billing_date DATE         NOT NULL,
  category_id       UUID REFERENCES categories(id),
  account_id        UUID         NOT NULL REFERENCES accounts(id),
  url               TEXT,
  notes             TEXT,
  is_active         BOOLEAN      NOT NULL DEFAULT TRUE,
  color             VARCHAR(8)   NOT NULL DEFAULT '#6366f1',
  icon              VARCHAR(255),
  created_at        TIMESTAMPTZ  NOT NULL DEFAULT NOW()
);

CREATE INDEX subscriptions_user_id_idx ON subscriptions (user_id);

-- 18. transaction_splits (FK → transactions, categories)
CREATE TABLE transaction_splits (
  id             UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  transaction_id UUID    NOT NULL REFERENCES transactions(id) ON DELETE CASCADE,
  category_id    UUID REFERENCES categories(id),
  amount         NUMERIC NOT NULL,
  description    TEXT
);

CREATE INDEX transaction_splits_transaction_id_idx ON transaction_splits (transaction_id);

-- 19. net_worth_snapshots (no FK deps)
CREATE TABLE net_worth_snapshots (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id           UUID        NOT NULL,
  date              DATE        NOT NULL,
  net_worth         NUMERIC     NOT NULL,
  total_assets      NUMERIC     NOT NULL DEFAULT 0,
  total_liabilities NUMERIC     NOT NULL DEFAULT 0,
  investment_value  NUMERIC     NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE UNIQUE INDEX net_worth_snapshots_user_id_date_idx ON net_worth_snapshots (user_id, date);

-- 20. shared_access (no FK deps — resource_id is polymorphic)
CREATE TABLE shared_access (
  id                UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  owner_id          UUID                NOT NULL,
  shared_with_id    UUID,
  shared_with_email VARCHAR(255)        NOT NULL,
  resource_type     shared_resource_type NOT NULL,
  resource_id       UUID                NOT NULL,
  permission        shared_permission   NOT NULL DEFAULT 'edit',
  status            shared_status       NOT NULL DEFAULT 'pending',
  created_at        TIMESTAMPTZ         NOT NULL DEFAULT NOW(),
  accepted_at       TIMESTAMPTZ
);

CREATE UNIQUE INDEX unique_share ON shared_access (shared_with_email, resource_type, resource_id);

-- 21. budget_notifications (FK → budgets)
CREATE TABLE budget_notifications (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL,
  budget_id  UUID        NOT NULL REFERENCES budgets(id) ON DELETE CASCADE,
  alert_type alert_type  NOT NULL,
  message    TEXT        NOT NULL,
  is_read    BOOLEAN     NOT NULL DEFAULT FALSE,
  emailed    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX budget_notifications_user_budget_idx ON budget_notifications (user_id, budget_id);

-- 22. user_keys (no FK deps — envelope encryption)
CREATE TABLE user_keys (
  user_id       UUID PRIMARY KEY,
  encrypted_key TEXT        NOT NULL,
  key_version   INTEGER     NOT NULL DEFAULT 1,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 23. mfa_backup_codes (no FK deps)
CREATE TABLE mfa_backup_codes (
  id         UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id    UUID        NOT NULL,
  code_hash  TEXT        NOT NULL,
  used       BOOLEAN     NOT NULL DEFAULT FALSE,
  used_at    TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE INDEX mfa_backup_codes_user_id_idx ON mfa_backup_codes (user_id);
