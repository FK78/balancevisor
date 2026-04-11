-- Resolve existing false-positive subscription_amount_mismatch review flags.
-- These were created when fuzzy name matching was too loose, matching regular
-- purchases (e.g. Amazon Marketplace) to subscriptions (e.g. Amazon Prime).
-- Run this manually after deploying the stricter matching logic.

UPDATE transaction_review_flags
SET    is_resolved = true
WHERE  flag_type = 'subscription_amount_mismatch'
AND    is_resolved = false;
