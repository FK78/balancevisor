-- Delete duplicate unresolved review flags, keeping only the oldest per transaction+flag_type
DELETE FROM transaction_review_flags
WHERE id NOT IN (
  SELECT DISTINCT ON (transaction_id, flag_type) id
  FROM transaction_review_flags
  WHERE is_resolved = false
  ORDER BY transaction_id, flag_type, created_at ASC
);