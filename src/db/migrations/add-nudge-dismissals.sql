-- Nudge dismissals: tracks which nudges a user has dismissed
CREATE TABLE IF NOT EXISTS nudge_dismissals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  nudge_key VARCHAR(100) NOT NULL,
  dismissed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE(user_id, nudge_key)
);

CREATE INDEX IF NOT EXISTS idx_nudge_dismissals_user ON nudge_dismissals(user_id);
