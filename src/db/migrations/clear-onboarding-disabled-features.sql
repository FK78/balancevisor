-- Fix: Clear disabled_features that were incorrectly set by the onboarding
-- interest picker. The picker was meant for routing priority only, but it
-- was writing unselected features into disabled_features, hiding them
-- from users who didn't pick any optional interests.
--
-- This only clears rows where every disabled feature is one of the 5
-- onboarding-picker IDs (budgets, goals, debts, subscriptions, investments).
-- Users who deliberately toggled features in Settings (e.g. disabled
-- "transactions" or "reports") are left untouched.

UPDATE user_preferences
SET    disabled_features = NULL,
       updated_at        = NOW()
WHERE  disabled_features IS NOT NULL
  AND  (
    SELECT bool_and(elem::text IN (
      '"budgets"', '"goals"', '"debts"', '"subscriptions"', '"investments"'
    ))
    FROM jsonb_array_elements(disabled_features::jsonb) AS elem
  );
