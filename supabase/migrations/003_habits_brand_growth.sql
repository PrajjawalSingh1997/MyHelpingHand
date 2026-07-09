-- HABITS
CREATE TABLE habits (
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
CREATE TABLE habit_logs (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  habit_id  UUID REFERENCES habits(id) ON DELETE CASCADE NOT NULL,
  date      DATE NOT NULL,
  done      BOOLEAN DEFAULT true,
  UNIQUE(habit_id, date)
);
ALTER TABLE habits     ENABLE ROW LEVEL SECURITY;
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_own"     ON habits     FOR ALL USING (user_id = auth.uid());
CREATE POLICY "habit_logs_own" ON habit_logs FOR ALL USING (user_id = auth.uid());

-- BRAND HUB
CREATE TABLE brand_metrics (
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
CREATE TABLE brand_profile_checklist (
  user_id   UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  checklist JSONB DEFAULT '{}'
);
CREATE TABLE brand_daily_actions (
  user_id      UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  date         DATE NOT NULL,
  actions_done JSONB DEFAULT '{}',
  PRIMARY KEY(user_id, date)
);
ALTER TABLE brand_metrics           ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_profile_checklist ENABLE ROW LEVEL SECURITY;
ALTER TABLE brand_daily_actions     ENABLE ROW LEVEL SECURITY;
CREATE POLICY "bm_own" ON brand_metrics           FOR ALL USING (user_id = auth.uid());
CREATE POLICY "bp_own" ON brand_profile_checklist FOR ALL USING (user_id = auth.uid());
CREATE POLICY "bd_own" ON brand_daily_actions     FOR ALL USING (user_id = auth.uid());

-- CONTENT POSTS — add pillar column
ALTER TABLE content_posts
  ADD COLUMN IF NOT EXISTS pillar TEXT;

-- USER PROFILES — add social links
ALTER TABLE user_profiles
  ADD COLUMN IF NOT EXISTS linkedin_url  TEXT,
  ADD COLUMN IF NOT EXISTS github_url    TEXT,
  ADD COLUMN IF NOT EXISTS twitter_url   TEXT,
  ADD COLUMN IF NOT EXISTS portfolio_url TEXT;

-- USER SETTINGS — add weekly review + exercise minutes on health_logs
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS weekly_review_checks JSONB DEFAULT '{}';

ALTER TABLE health_logs
  ADD COLUMN IF NOT EXISTS exercise_minutes INTEGER;

-- SIDEBAR MODULE — Brand Hub
INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
VALUES ('Brand Hub', 'brand', 'LinkedIn personal brand strategy & metrics', 'Rocket', true, 14)
ON CONFLICT (slug) DO NOTHING;
