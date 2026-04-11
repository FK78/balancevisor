-- Fix private investment average_price values that were stored as total invested
-- instead of per-unit price. Bug: form sent total invested, stored directly as
-- average_price. Value calc did average_price * quantity = inflated value.
--
-- This divides average_price by quantity for all non-stock holdings where
-- quantity > 1, correcting the per-unit price.

UPDATE manual_holdings
SET average_price = average_price / quantity
WHERE investment_type != 'stock'
  AND quantity > 1;
