-- ================================================================
-- Migration 003: Missing Tables and Columns
-- Converted from: supabase/fix-missing-tables.sql
-- Originally applied: ~2026-07-08 directly in Supabase SQL Editor
-- Converted to migration file: 2026-07-15
--
-- Contains:
--   1. Missing columns on existing tables (user_settings, user_profiles, health_logs, content_posts)
--   2. habits + habit_logs tables with RLS
--   3. brand_metrics, brand_profile_checklist, brand_daily_actions tables with RLS
--   4. Modules: Habits + Brand Hub inserts
--   5. user_module_settings wiring for all existing users
--
-- STATUS: Already applied to live Supabase database.
-- Safe to re-run (all statements use IF NOT EXISTS / ON CONFLICT DO NOTHING).
-- ================================================================

-- ── 1. Missing columns on existing tables ───────────────────────

ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS debt_total            NUMERIC(10,2) DEFAULT 80000,
  ADD COLUMN IF NOT EXISTS weekly_review_checks  JSONB DEFAULT '{}';

ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url   TEXT,
  ADD COLUMN IF NOT EXISTS github_url     TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url    TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url  TEXT;

ALTER TABLE health_logs
  ADD COLUMN IF NOT EXISTS exercise_minutes INTEGER;

ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS pillar TEXT;

-- ── 2. Habits tables ────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS habits (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name        TEXT NOT NULL,
  emoji       TEXT DEFAULT '✅',
  color       TEXT DEFAULT '#6C5CE7',
  category    TEXT DEFAULT 'general',
  frequency   TEXT DEFAULT 'daily',
  is_active   BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0,
  created_at  TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS habit_logs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id  UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date      DATE NOT NULL,
  done      BOOLEAN DEFAULT true,
  UNIQUE(habit_id, date)
);

ALTER TABLE habits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habits'     AND policyname = 'habits_own')     THEN CREATE POLICY "habits_own"     ON habits     FOR ALL USING (user_id = auth.uid()); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'habit_logs' AND policyname = 'habit_logs_own') THEN CREATE POLICY "habit_logs_own" ON habit_logs FOR ALL USING (user_id = auth.uid()); END IF;
END $$;

-- ── 3. Brand Hub tables ─────────────────────────────────────────

CREATE TABLE IF NOT EXISTS brand_metrics (
  id                 UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id            UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  week_of            DATE NOT NULL,
  followers          INT DEFAULT 0,
  profile_views      INT DEFAULT 0,
  search_appearances INT DEFAULT 0,
  post_impressions   INT DEFAULT 0,
  connections        INT DEFAULT 0,
  UNIQUE(user_id, week_of)
);

CREATE TABLE IF NOT EXISTS brand_profile_checklist (
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  checklist JSONB DEFAULT '{}'
);

CREATE TABLE IF NOT EXISTS brand_daily_actions (
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  actions_done JSONB DEFAULT '{}',
  PRIMARY KEY(user_id, date)
);

ALTER TABLE brand_metrics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profile_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_daily_actions     ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brand_metrics'           AND policyname = 'bm_own') THEN CREATE POLICY "bm_own" ON brand_metrics           FOR ALL USING (user_id = auth.uid()); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brand_profile_checklist' AND policyname = 'bp_own') THEN CREATE POLICY "bp_own" ON brand_profile_checklist FOR ALL USING (user_id = auth.uid()); END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'brand_daily_actions'     AND policyname = 'bd_own') THEN CREATE POLICY "bd_own" ON brand_daily_actions     FOR ALL USING (user_id = auth.uid()); END IF;
END $$;

-- ── 4. Modules — add missing ones ───────────────────────────────

INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
VALUES
  ('Habits',   'habits', 'Daily habit tracker and streaks',                    'CheckSquare', true, 15),
  ('Brand Hub','brand',  'LinkedIn personal brand strategy & metrics',          'Rocket',      true, 14)
ON CONFLICT (slug) DO NOTHING;

-- ── 5. Wire new modules to existing user ────────────────────────
-- Adds Habits and Brand Hub to the sidebar for all existing users.

INSERT INTO user_module_settings (user_id, module_id, is_enabled)
SELECT u.id, m.id, true
FROM auth.users u
CROSS JOIN modules m
WHERE m.slug IN ('habits', 'brand')
ON CONFLICT (user_id, module_id) DO NOTHING;
