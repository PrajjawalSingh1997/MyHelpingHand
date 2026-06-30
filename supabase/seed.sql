-- ================================================================
-- Life OS v2 — Seed Data
-- Run AFTER schema.sql in Supabase SQL Editor
-- ================================================================

-- Seed modules (16 modules)
INSERT INTO modules (name, slug, icon, description, is_default, sort_order) VALUES
  ('Dashboard',     'dashboard', 'LayoutDashboard', 'Overview of your 90-day cycle',       true,  1),
  ('Today',         'today',     'CalendarCheck',   'Daily task management',                true,  2),
  ('Calendar',      'calendar',  'Calendar',        '90-day calendar view',                 true,  3),
  ('Progress',      'progress',  'TrendingUp',      'Analytics and completion tracking',    true,  4),
  ('Timetable',     'timetable', 'Clock',           'Daily schedule A/B/C plans',           true,  5),
  ('Goals',         'goals',     'Target',          'Life, annual, quarterly, monthly goals',true, 6),
  ('Health',        'health',    'Heart',           'Daily health tracker',                 true,  7),
  ('Finance',       'finance',   'DollarSign',      'Income, expenses, debt tracker',       true,  8),
  ('CRM',           'crm',       'Users',           'Lead pipeline and cold calls',         true,  9),
  ('Content',       'content',   'FileText',        'Content calendar for all platforms',   true,  10),
  ('Blog',          'blog',      'PenSquare',       'Blog post management',                 true,  11),
  ('Learning',      'learning',  'BookOpen',        'Courses, books, resources tracker',    true,  12),
  ('Freelance',     'freelance', 'Briefcase',       'Freelance project pipeline',           true,  13),
  ('Rentlyf',       'rentlyf',   'Code2',           'Rentlyf work hours tracker',           true,  14),
  ('Prompt',        'prompt',    'Sparkles',        '90-day plan prompt & import',          true,  15),
  ('Settings',      'settings',  'Settings',        'Account and app settings',             true,  16)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  icon = EXCLUDED.icon,
  description = EXCLUDED.description,
  is_default = EXCLUDED.is_default,
  sort_order = EXCLUDED.sort_order;
