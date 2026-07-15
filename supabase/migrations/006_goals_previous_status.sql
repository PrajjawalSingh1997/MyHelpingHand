-- Migration 006: Preserve goal status across complete/un-complete toggle
-- Gap 2.4 from docs/CODEBASE_AUDIT.md
-- Un-completing a goal previously always reset it to 'not_started', discarding
-- whatever status (in_progress / on_hold) it had before being marked complete.

ALTER TABLE goals ADD COLUMN IF NOT EXISTS previous_status TEXT;
