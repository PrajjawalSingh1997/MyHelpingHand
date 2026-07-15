-- Migration 004: Add missing Habits module to modules table
-- Gap C1 from docs/FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md
-- Applied: 2026-07-15 in Supabase SQL Editor

INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
VALUES ('Habits', 'habits', 'Daily habit tracker and streaks', 'CheckSquare', true, 15)
ON CONFLICT (slug) DO NOTHING;

UPDATE modules SET sort_order = 16 WHERE slug = 'prompt';
UPDATE modules SET sort_order = 17 WHERE slug = 'settings';
