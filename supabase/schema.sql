-- ================================================================
-- Life OS v2 — Supabase Schema
-- Run this entire file in Supabase SQL Editor (once per project)
-- ================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ================================================================
-- TYPES / ENUMS
-- ================================================================
DO $$ BEGIN CREATE TYPE user_role AS ENUM ('super_admin', 'user'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE task_status AS ENUM ('pending', 'completed', 'skipped', 'postponed'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE plan_type AS ENUM ('A', 'B', 'C'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE goal_type AS ENUM ('life', 'annual', 'quarterly', 'monthly'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE goal_status AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE finance_type AS ENUM ('income', 'expense'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE lead_stage AS ENUM ('cold', 'warm', 'hot', 'proposal', 'client', 'lost'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE call_outcome AS ENUM ('no_answer', 'callback', 'interested', 'not_interested', 'converted'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE content_post_status AS ENUM ('idea', 'draft', 'scheduled', 'published'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE learning_status AS ENUM ('not_started', 'in_progress', 'completed', 'on_hold'); EXCEPTION WHEN duplicate_object THEN null; END $$;
DO $$ BEGIN CREATE TYPE freelance_project_status AS ENUM ('lead', 'proposal', 'active', 'completed', 'cancelled'); EXCEPTION WHEN duplicate_object THEN null; END $$;

-- ================================================================
-- HELPER FUNCTION
-- ================================================================
CREATE OR REPLACE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM user_profiles WHERE id = auth.uid() AND role = 'super_admin');
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ================================================================
-- TABLES
-- ================================================================

CREATE TABLE IF NOT EXISTS user_profiles (
  id            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name  TEXT,
  bio           TEXT,
  role          user_role DEFAULT 'user',
  avatar_url    TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_settings (
  id                    UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id               UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  theme                 TEXT DEFAULT 'dark',
  notifications_enabled BOOLEAN DEFAULT false,
  daily_reminder_time   TIME,
  timezone              TEXT DEFAULT 'Asia/Kolkata',
  week_start            TEXT DEFAULT 'monday',
  debt_remaining        NUMERIC(10,2) DEFAULT 0,
  updated_at            TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS modules (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name        TEXT NOT NULL,
  slug        TEXT UNIQUE NOT NULL,
  description TEXT,
  icon        TEXT,
  is_default  BOOLEAN DEFAULT true,
  sort_order  INT DEFAULT 0
);

CREATE TABLE IF NOT EXISTS user_module_settings (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  module_id  UUID NOT NULL REFERENCES modules(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT true,
  UNIQUE(user_id, module_id)
);

CREATE TABLE IF NOT EXISTS ninety_day_cycles (
  id           UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id      UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  cycle_number INT DEFAULT 1,
  title        TEXT,
  goal         TEXT,
  start_date   DATE NOT NULL,
  end_date     DATE NOT NULL,
  is_active    BOOLEAN DEFAULT true,
  created_at   TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS days (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  cycle_id      UUID NOT NULL REFERENCES ninety_day_cycles(id) ON DELETE CASCADE,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  day_number    INT NOT NULL,
  date          DATE NOT NULL,
  plan_type     plan_type DEFAULT 'A',
  theme         TEXT,
  notes         TEXT,
  rentlyf_hours NUMERIC(5,2) DEFAULT 0,
  UNIQUE(cycle_id, day_number)
);

CREATE TABLE IF NOT EXISTS tasks (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  day_id     UUID NOT NULL REFERENCES days(id) ON DELETE CASCADE,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title      TEXT NOT NULL,
  category   TEXT NOT NULL DEFAULT 'personal',
  platform   TEXT,
  status     task_status DEFAULT 'pending',
  content    TEXT,
  notes      TEXT,
  sort_order INT DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS goals (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goal_type     goal_type DEFAULT 'monthly',
  title         TEXT NOT NULL,
  description   TEXT,
  status        goal_status DEFAULT 'not_started',
  target_value  TEXT,
  current_value TEXT,
  unit          TEXT,
  deadline      DATE,
  sort_order    INT DEFAULT 0,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS timetable_plans (
  id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  plan_type plan_type NOT NULL,
  name      TEXT NOT NULL,
  blocks    JSONB DEFAULT '[]'::JSONB,
  UNIQUE(user_id, plan_type)
);

CREATE TABLE IF NOT EXISTS timetable_checks (
  id        UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id   UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date      DATE DEFAULT CURRENT_DATE,
  block_ids TEXT[] DEFAULT '{}',
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS health_logs (
  id               UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id          UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date             DATE NOT NULL,
  exercise_done    BOOLEAN DEFAULT false,
  yoga_done        BOOLEAN DEFAULT false,
  meditation_done  BOOLEAN DEFAULT false,
  skincare_done    BOOLEAN DEFAULT false,
  exercise_notes   TEXT,
  weight_kg        NUMERIC(5,2),
  water_glasses    INT,
  sleep_hours      NUMERIC(4,2),
  mood             INT CHECK (mood BETWEEN 1 AND 5),
  notes            TEXT,
  created_at       TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS finance_entries (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE DEFAULT CURRENT_DATE,
  type        finance_type NOT NULL,
  category    TEXT,
  description TEXT,
  amount      NUMERIC(12,2) NOT NULL DEFAULT 0,
  currency    TEXT DEFAULT 'INR',
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS crm_leads (
  id            UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id       UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name          TEXT NOT NULL,
  company       TEXT,
  phone         TEXT,
  email         TEXT,
  stage         lead_stage DEFAULT 'cold',
  service       TEXT,
  source        TEXT,
  deal_value    NUMERIC(12,2),
  next_followup DATE,
  notes         TEXT,
  created_at    TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS cold_calls (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  lead_id    UUID REFERENCES crm_leads(id) ON DELETE SET NULL,
  date       DATE DEFAULT CURRENT_DATE,
  name       TEXT NOT NULL,
  phone      TEXT NOT NULL,
  outcome    call_outcome DEFAULT 'no_answer',
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS content_posts (
  id             UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id        UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title          TEXT NOT NULL,
  platform       TEXT,
  status         content_post_status DEFAULT 'idea',
  content        TEXT,
  hook           TEXT,
  tags           TEXT,
  url            TEXT,
  scheduled_date DATE,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS learning_resources (
  id                UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id           UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title             TEXT NOT NULL,
  resource_type     TEXT DEFAULT 'course',
  topic             TEXT,
  status            learning_status DEFAULT 'not_started',
  url               TEXT,
  notes             TEXT,
  total_lessons     TEXT,
  completed_lessons TEXT,
  created_at        TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS rentlyf_logs (
  id         UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date       DATE DEFAULT CURRENT_DATE,
  hours      NUMERIC(5,2) NOT NULL,
  category   TEXT,
  notes      TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, date)
);

CREATE TABLE IF NOT EXISTS freelance_projects (
  id          UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title       TEXT NOT NULL,
  client_name TEXT,
  platform    TEXT,
  status      freelance_project_status DEFAULT 'lead',
  budget      NUMERIC(12,2),
  paid_amount NUMERIC(12,2) DEFAULT 0,
  currency    TEXT DEFAULT 'INR',
  deadline    DATE,
  notes       TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW()
);

-- ================================================================
-- ROW LEVEL SECURITY POLICIES
-- ================================================================
ALTER TABLE user_profiles        ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings        ENABLE ROW LEVEL SECURITY;
ALTER TABLE modules              ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_module_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE ninety_day_cycles    ENABLE ROW LEVEL SECURITY;
ALTER TABLE days                 ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks                ENABLE ROW LEVEL SECURITY;
ALTER TABLE goals                ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_plans      ENABLE ROW LEVEL SECURITY;
ALTER TABLE timetable_checks     ENABLE ROW LEVEL SECURITY;
ALTER TABLE health_logs          ENABLE ROW LEVEL SECURITY;
ALTER TABLE finance_entries      ENABLE ROW LEVEL SECURITY;
ALTER TABLE crm_leads            ENABLE ROW LEVEL SECURITY;
ALTER TABLE cold_calls           ENABLE ROW LEVEL SECURITY;
ALTER TABLE content_posts        ENABLE ROW LEVEL SECURITY;
ALTER TABLE learning_resources   ENABLE ROW LEVEL SECURITY;
ALTER TABLE rentlyf_logs         ENABLE ROW LEVEL SECURITY;
ALTER TABLE freelance_projects   ENABLE ROW LEVEL SECURITY;

-- user_profiles
CREATE POLICY "profiles_select" ON user_profiles FOR SELECT USING (id = auth.uid() OR is_super_admin());
CREATE POLICY "profiles_insert" ON user_profiles FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_update" ON user_profiles FOR UPDATE USING (id = auth.uid() OR is_super_admin());

-- user_settings
CREATE POLICY "settings_all" ON user_settings FOR ALL USING (user_id = auth.uid());

-- modules — all authenticated can read, only super admin can write
CREATE POLICY "modules_read"  ON modules FOR SELECT USING (auth.uid() IS NOT NULL);
CREATE POLICY "modules_write" ON modules FOR ALL    USING (is_super_admin());

-- user_module_settings — users see own, super_admin can do all
CREATE POLICY "ums_read_own"   ON user_module_settings FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "ums_admin_all"  ON user_module_settings FOR ALL    USING (is_super_admin());

-- All other tables — users own their rows
CREATE POLICY "cycles_all"    ON ninety_day_cycles  FOR ALL USING (user_id = auth.uid());
CREATE POLICY "days_all"      ON days               FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tasks_all"     ON tasks              FOR ALL USING (user_id = auth.uid());
CREATE POLICY "goals_all"     ON goals              FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tplan_all"     ON timetable_plans    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "tchecks_all"   ON timetable_checks   FOR ALL USING (user_id = auth.uid());
CREATE POLICY "health_all"    ON health_logs        FOR ALL USING (user_id = auth.uid());
CREATE POLICY "finance_all"   ON finance_entries    FOR ALL USING (user_id = auth.uid());
CREATE POLICY "crm_all"       ON crm_leads          FOR ALL USING (user_id = auth.uid());
CREATE POLICY "calls_all"     ON cold_calls         FOR ALL USING (user_id = auth.uid());
CREATE POLICY "content_all"   ON content_posts      FOR ALL USING (user_id = auth.uid());
CREATE POLICY "learning_all"  ON learning_resources FOR ALL USING (user_id = auth.uid());
CREATE POLICY "rentlyf_all"   ON rentlyf_logs       FOR ALL USING (user_id = auth.uid());
CREATE POLICY "freelance_all" ON freelance_projects FOR ALL USING (user_id = auth.uid());

-- ================================================================
-- TRIGGER: Auto-setup new user on signup
-- ================================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
DECLARE
  plan_a JSONB;
  plan_b JSONB;
  plan_c JSONB;
BEGIN
  INSERT INTO user_profiles (id, display_name, role)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)), 'user')
  ON CONFLICT (id) DO NOTHING;

  INSERT INTO user_settings (user_id) VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;

  INSERT INTO user_module_settings (user_id, module_id, is_enabled)
  SELECT NEW.id, id, is_default FROM modules
  ON CONFLICT (user_id, module_id) DO NOTHING;

  plan_a := '[
    {"id":"a1","time":"5:00–5:30 AM","emoji":"🌅","name":"Wake & Refresh","activity":"No phone, brush, water, light stretch","duration":"30min","fixed":true},
    {"id":"a2","time":"5:30–6:30 AM","emoji":"🧘","name":"Morning Ritual","activity":"Meditation, journaling, cold shower","duration":"60min","fixed":true},
    {"id":"a3","time":"6:30–7:00 AM","emoji":"🍳","name":"Breakfast","activity":"Healthy breakfast, plan the day","duration":"30min","fixed":true},
    {"id":"a4","time":"7:00–9:00 AM","emoji":"🏋️","name":"Exercise","activity":"Workout / gym / run / yoga","duration":"2h","fixed":false},
    {"id":"a5","time":"9:00–1:00 PM","emoji":"💻","name":"Deep Work Block","activity":"Techwara / main project / client work","duration":"4h","fixed":false},
    {"id":"a6","time":"1:00–2:00 PM","emoji":"🍽️","name":"Lunch & Rest","activity":"Lunch, 20min nap or walk","duration":"1h","fixed":true},
    {"id":"a7","time":"2:00–5:00 PM","emoji":"⚡","name":"Afternoon Work","activity":"Tasks, freelance, learning, calls","duration":"3h","fixed":false},
    {"id":"a8","time":"5:00–6:00 PM","emoji":"🚶","name":"Walk & Reset","activity":"Evening walk, debrief the day","duration":"1h","fixed":true},
    {"id":"a9","time":"6:00–8:00 PM","emoji":"📱","name":"Content & Social","activity":"LinkedIn post, GitHub commit, Twitter thread","duration":"2h","fixed":false},
    {"id":"a10","time":"8:00–10:00 PM","emoji":"📚","name":"Learning","activity":"Course / reading / skill building","duration":"2h","fixed":false},
    {"id":"a11","time":"10:00–11:00 PM","emoji":"🌙","name":"Wind Down","activity":"Journal, review tomorrow plan, skincare","duration":"1h","fixed":true},
    {"id":"a12","time":"11:00 PM–12:00 AM","emoji":"😴","name":"Sleep","activity":"Sleep by midnight","duration":"until 5AM","fixed":true}
  ]'::JSONB;

  plan_b := '[
    {"id":"b1","time":"5:00–5:30 AM","emoji":"🌅","name":"Wake & Refresh","activity":"No phone, brush, water","duration":"30min","fixed":true},
    {"id":"b2","time":"5:30–6:00 AM","emoji":"🧘","name":"Quick Ritual","activity":"10min meditation, cold shower","duration":"30min","fixed":true},
    {"id":"b3","time":"6:00–6:30 AM","emoji":"🍳","name":"Breakfast","activity":"Quick healthy breakfast","duration":"30min","fixed":true},
    {"id":"b4","time":"6:30–7:00 AM","emoji":"🏃","name":"Exercise","activity":"30min HIIT / run","duration":"30min","fixed":false},
    {"id":"b5","time":"7:00–1:00 PM","emoji":"💻","name":"Deep Work A","activity":"Techwara heavy coding / main deliverable","duration":"6h","fixed":false},
    {"id":"b6","time":"1:00–1:30 PM","emoji":"🍽️","name":"Lunch","activity":"Quick lunch","duration":"30min","fixed":true},
    {"id":"b7","time":"1:30–6:00 PM","emoji":"⚡","name":"Deep Work B","activity":"Continue main work / freelance / Techwara","duration":"4.5h","fixed":false},
    {"id":"b8","time":"6:00–7:00 PM","emoji":"🚶","name":"Walk & Decompress","activity":"Walk, light stretch","duration":"1h","fixed":true},
    {"id":"b9","time":"7:00–9:00 PM","emoji":"📱","name":"Content Batch","activity":"Batch write posts / schedule","duration":"2h","fixed":false},
    {"id":"b10","time":"9:00–10:30 PM","emoji":"📚","name":"Learning","activity":"Course / reading","duration":"1.5h","fixed":false},
    {"id":"b11","time":"10:30–12:00 AM","emoji":"🌙","name":"Wind Down & Sleep","activity":"Journal, skincare, sleep","duration":"1.5h","fixed":true}
  ]'::JSONB;

  plan_c := '[
    {"id":"c1","time":"5:00–5:30 AM","emoji":"🌅","name":"Wake & Refresh","activity":"No phone, brush, water","duration":"30min","fixed":true},
    {"id":"c2","time":"5:30–6:30 AM","emoji":"🧘","name":"Morning Ritual","activity":"Meditation, journaling, cold shower","duration":"60min","fixed":true},
    {"id":"c3","time":"6:30–7:00 AM","emoji":"🍳","name":"Breakfast","activity":"Healthy breakfast","duration":"30min","fixed":true},
    {"id":"c4","time":"7:00–8:00 AM","emoji":"🏃","name":"Exercise","activity":"Workout","duration":"1h","fixed":false},
    {"id":"c5","time":"8:00–9:00 AM","emoji":"🎯","name":"Business Planning","activity":"Review CRM, plan calls, prepare proposals","duration":"1h","fixed":false},
    {"id":"c6","time":"9:00–12:00 PM","emoji":"📞","name":"Cold Calling Block","activity":"Cold calls, follow-ups, outreach","duration":"3h","fixed":false},
    {"id":"c7","time":"12:00–1:00 PM","emoji":"🍽️","name":"Lunch","activity":"Lunch, walk","duration":"1h","fixed":true},
    {"id":"c8","time":"1:00–3:00 PM","emoji":"📋","name":"Proposals & Emails","activity":"Write proposals, respond to leads, networking","duration":"2h","fixed":false},
    {"id":"c9","time":"3:00–5:00 PM","emoji":"💻","name":"Client Work","activity":"Active client projects","duration":"2h","fixed":false},
    {"id":"c10","time":"5:00–6:00 PM","emoji":"🚶","name":"Walk & Reset","activity":"Evening walk","duration":"1h","fixed":true},
    {"id":"c11","time":"6:00–8:00 PM","emoji":"📱","name":"Content & LinkedIn","activity":"Post, engage, network on LinkedIn","duration":"2h","fixed":false},
    {"id":"c12","time":"8:00–10:00 PM","emoji":"📚","name":"Learning","activity":"Course / reading","duration":"2h","fixed":false},
    {"id":"c13","time":"10:00–12:00 AM","emoji":"🌙","name":"Wind Down & Sleep","activity":"Journal, review, skincare, sleep","duration":"2h","fixed":true}
  ]'::JSONB;

  INSERT INTO timetable_plans (user_id, plan_type, name, blocks) VALUES
    (NEW.id, 'A', 'Plan A — Standard Day',    plan_a),
    (NEW.id, 'B', 'Plan B — Heavy Work Day',  plan_b),
    (NEW.id, 'C', 'Plan C — Business Dev Day', plan_c)
  ON CONFLICT (user_id, plan_type) DO NOTHING;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

-- ================================================================
-- FUNCTION: Promote user to super admin by email
-- ================================================================
CREATE OR REPLACE FUNCTION set_super_admin(admin_email TEXT)
RETURNS VOID AS $$
DECLARE target_id UUID;
BEGIN
  SELECT id INTO target_id FROM auth.users WHERE email = admin_email LIMIT 1;
  IF target_id IS NULL THEN RAISE EXCEPTION 'User not found: %', admin_email; END IF;
  UPDATE user_profiles SET role = 'super_admin' WHERE id = target_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
