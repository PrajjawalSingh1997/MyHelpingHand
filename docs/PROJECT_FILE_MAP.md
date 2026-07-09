# Life OS — Project File Map

**Generated:** 2026-07-08  
**Codebase State:** v2.1 Post-Launch  
**Repository:** https://github.com/PrajjawalSingh1997/MyHelpingHand

---

## Source Files

### src/app/(auth)/

| File | Description |
|------|-------------|
| `layout.tsx` | Auth layout wrapper — renders a centered card on a dark background for login and signup pages; no sidebar, no topbar |
| `login/page.tsx` | Login form; calls `supabase.auth.signInWithPassword()`; shows error below password field on invalid credentials; redirects to `/` on success |
| `signup/page.tsx` | Signup form with email, display name, and password fields; calls `supabase.auth.signUp()`; the DB trigger fires automatically after signup; redirects to `/` on success |

### src/app/auth/

| File | Description |
|------|-------------|
| `callback/route.ts` | OAuth callback route handler; exchanges the auth code from Supabase email links for a session; used for future magic-link or password-reset flows |

### src/app/api/

| File | Description |
|------|-------------|
| `api/admin/users/route.ts` | Server-side API route that calls `supabase.auth.admin.listUsers()` using `SUPABASE_SERVICE_ROLE_KEY`; returns user email list to the admin panel; this is the only server-side endpoint in the app |

### src/app/(dashboard)/

| File | Description |
|------|-------------|
| `layout.tsx` | Dashboard server component; fetches user profile, enabled modules, and theme setting in parallel; renders `<Sidebar>`, `<TopBar>`, and `<ToastProvider>` wrapping all child pages; applies saved theme via inline script before first paint to prevent flash |
| `page.tsx` | Dashboard home (`/`); queries active cycle, days with task statuses, month's income from `finance_entries`, and this week's exercise days from `health_logs`; renders streak, cycle progress, mini week view, 90-day heatmap, and quick access tiles; shows `EmptyCycle` if no active cycle |
| `today/page.tsx` | Today view (`/today`); detects current day from active cycle start date; renders `TodayContent` component for that day number |
| `day/[dayNumber]/page.tsx` | Day view for any specific day (`/day/N`); renders the same `TodayContent` component as Today page but for the given day number from the URL parameter |
| `prompt/page.tsx` | 3-step AI plan import wizard (`/prompt`); Step 1 copies the structured prompt template; Step 2 explains JSON format; Step 3 accepts pasted JSON, recalculates dates from chosen start, deactivates prior cycle, inserts cycle + days + tasks in batches of 10 |
| `calendar/page.tsx` | Monthly calendar view (`/calendar`); fetches all days + task statuses for active cycle; renders month grid with day completion dots; previous/next month navigation; shows `EmptyCycle` if no cycle |
| `progress/page.tsx` | Analytics page (`/progress`); has Overview tab (streak, completion rate, 90-day heatmap, weekly breakdown, category breakdown, last 14 days detail) and Growth Tracker tab (per-day LinkedIn/GitHub/Twitter/Freelance task counts, color-coded, clickable to day view); includes Weekly Review checklist (6 items saved to `user_settings.weekly_review_checks`) |
| `timetable/page.tsx` | Timetable page (`/timetable`); loads Plan A/B/C from `timetable_plans`; renders timeline with NOW indicator; full inline block add/edit/delete; timetable check-ins saved to `timetable_checks`; Weekly Rhythm static tab; resets check-ins at 5 AM |
| `goals/page.tsx` | Goals tracker (`/goals`); 4-tab type filter (life/annual/quarterly/monthly); full CRUD with inline edit; progress bar (current/target); deadline display; goal status toggle (in_progress / completed); toast on all actions |
| `health/page.tsx` | Daily health logger (`/health`); loads last 90 days; date picker pre-fills form with existing log; activity toggles (exercise, yoga, meditation, skincare); numeric fields (weight, water, sleep, mood); `exercise_minutes` field (conditionally shown); `deleteLog()` with confirm; upserts on `(user_id, date)`; summary stats for last 14 days |
| `finance/page.tsx` | Finance tracker (`/finance`); loads entries + `debt_remaining` + `debt_total` from `user_settings`; summary cards (income/expense/net balance); debt countdown with payment logger; inline edit debt total (saves to DB); income/expense entry CRUD with filter tabs |
| `crm/page.tsx` | CRM lead pipeline (`/crm`); 6-stage pipeline filter grid; full lead CRUD with inline edit; stage quick-update dropdown on each card; overdue follow-up warning; `ColdCallLog` sub-component with add/edit/delete/outcome-update for cold calls; linked lead dropdown on call form |
| `content/page.tsx` | Content calendar (`/content`); 5 social platforms only (linkedin, twitter, instagram, youtube, newsletter); week view and list view toggle; pillar field (8 pillars) in PostModal form; pillar badge shown on post cards; platform filters in list view; shows only non-blog platforms |
| `blog/page.tsx` | Blog manager (`/blog`); queries `content_posts` filtered to `['blog','hashnode','dev.to','medium','personal']` platforms only; full CRUD; status filter tabs; URL field for published posts |
| `learning/page.tsx` | Learning hub (`/learning`); resource types: course/book/tutorial/documentation/video/podcast/other; status filter tabs; Currently Learning section for in-progress items; progress bar (completed_lessons/total_lessons); full CRUD |
| `freelance/page.tsx` | Freelance project manager (`/freelance`); 5-status pipeline (lead/proposal/active/completed/cancelled); summary cards (total earned, active pipeline value, active project count); payment progress bar; full CRUD |
| `rentlyf/page.tsx` | Rentlyf time logger (`/rentlyf`); upserts one log per date; categories: dashboard/development/design/meeting/support/other; summary cards (all-time hours, this week, daily avg); logs grouped by week |
| `habits/page.tsx` | Habits tracker (`/habits`); fully implemented — add/edit/delete habits; today's checklist (one-click toggle per habit per day); 7-day grid with filled/empty cells; per-habit streak counter (loads all logs for accuracy); empty state; toast on all actions |
| `brand/page.tsx` | Brand Hub (`/brand`); LinkedIn profile completion checklist (11 items, saves to `brand_profile_checklist`); weekly metrics form (5 metrics + date, upserts to `brand_metrics`); 8-content-pillar cards with post counts (linked to `/content?pillar=slug`); daily brand actions checklist (5 items, auto-resets on date change, saves to `brand_daily_actions`); connection growth table; CSS follower bar chart (last 8 weeks) |
| `settings/page.tsx` | Settings page (`/settings`); Profile card (display name, bio, social links: linkedin/github/twitter/portfolio); Preferences card (theme toggle dark/light/system with live apply, timezone, week start, daily reminder time); Finance Configuration card (debt_total input); Change Password; Sign Out |
| `admin/page.tsx` | Admin panel (`/admin`); only accessible to `super_admin` role (guarded by both middleware and client-side redirect); lists all users with email (via service role API), role badge, and per-module toggle grid; bulk enable/disable by selecting users + module; search by name/email; Enable All shortcut per user row |

### src/components/

| File | Description |
|------|-------------|
| `layout/sidebar.tsx` | Fixed left sidebar (240px); renders module links from `modules` prop (server-fetched); `SLUG_HREF` map provides href for each module slug including `brand: '/brand'` and `habits: '/habits'`; `ICON_MAP` maps icon name strings to Lucide components; admin panel link shown only when `isAdmin=true`; active link highlighted based on pathname |
| `layout/top-bar.tsx` | Top navigation bar; shows user display name; renders on all dashboard pages |
| `ui/empty-cycle.tsx` | Reusable `EmptyCycle` component; shown on Dashboard/Today/Calendar/Progress when no active 90-day cycle exists; includes call-to-action button linking to `/prompt` |
| `ui/toast.tsx` | Toast notification system; `ToastProvider` wraps all dashboard pages via layout; `useToast()` hook provides `show(message, type)` function; types: success/error/info; auto-dismisses after 3 seconds |

### src/hooks/

| File | Description |
|------|-------------|
| `use-cycle.ts` | `useActiveCycle()` hook; fetches the active `ninety_day_cycles` row for the current user; calculates `currentDay` from `differenceInCalendarDays(now, start_date) + 1`; used by Today page |
| `use-day.ts` | `useDay(dayNumber, cycleId?)` hook; fetches the `days` row and its `tasks` for a given day number; provides `toggleTask`, `skipTask`, `editTask`, `deleteTask`, `addTask`, `updateNotes`, `updateRentlyfHours`, `postponeTask` functions; uses debounced auto-save for notes via `useRef` |
| `use-sync.ts` | Legacy sync hook from v1 (localStorage era); retained in codebase but not actively used in v2 pages; v2 pages call Supabase directly |

### src/lib/

| File | Description |
|------|-------------|
| `supabase/client.ts` | Browser-side Supabase client factory; calls `createBrowserClient()` from `@supabase/ssr` using `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`; used in all client components |
| `supabase/server.ts` | Server-side Supabase client factory (async); calls `createServerClient()` with cookie access via Next.js `cookies()` API; used in server components and middleware |
| `types.ts` | Legacy type definitions from v1 era; may contain Zustand store types; not the primary type file for v2 database types |
| `storage.ts` | Legacy localStorage utility from v1 era; retained but not used in v2 pages |
| `export.ts` | Data export utility; not yet wired into any UI (data export is a listed future feature) |
| `utils.ts` | Utility functions including `cn()` (class name merging via `clsx` + `tailwind-merge`) |

### src/types/

| File | Description |
|------|-------------|
| `database.ts` | Complete TypeScript type definitions for all Supabase tables; includes `Database` interface with Row/Insert/Update types for all 22 tables; exports convenience type aliases (`UserProfile`, `Task`, `Habit`, `HabitLog`, `BrandMetric`, `BrandDailyAction`, etc.); also exports all enum types (`TaskStatus`, `GoalType`, etc.) and the `TimetableBlock` interface |

---

## Supabase Files

| File | Description |
|------|-------------|
| `supabase/schema.sql` | Full initial database schema; creates 11 enum types, 18 tables, all RLS policies, `is_super_admin()` helper function, `set_super_admin(email)` admin function, and `on_auth_user_created` trigger that auto-creates user_profiles, user_settings, 16 user_module_settings rows, and 3 timetable plan shells on signup |
| `supabase/seed.sql` | Seeds 16 module records into the `modules` table (Dashboard through Settings, sort_order 1-16); uses ON CONFLICT DO UPDATE to be idempotent |
| `supabase/migrations/002_life_os_enhancements.sql` | Migration 002; adds `debt_total NUMERIC(10,2) DEFAULT 80000` column to `user_settings`; updates existing rows with null/zero debt_total to 80000 |
| `supabase/migrations/003_habits_brand_growth.sql` | Migration 003; creates `habits` and `habit_logs` tables with RLS; creates `brand_metrics`, `brand_profile_checklist`, `brand_daily_actions` tables with RLS; adds `pillar` column to `content_posts`; adds `linkedin_url`, `github_url`, `twitter_url`, `portfolio_url` to `user_profiles`; adds `weekly_review_checks JSONB` to `user_settings`; adds `exercise_minutes INTEGER` to `health_logs`; inserts Brand Hub module (sort_order 14) |
| `supabase/admin-seed.sql` | Personal seed file containing Prajjawal's admin account setup; contains plaintext password — DO NOT commit to git (currently untracked per git status) |
| `supabase/seed-my-data.sql` | Personal data migration file for importing v1 data into v2 Supabase tables; bulk INSERT statements for personal tasks, goals, blog posts, etc. |
| `supabase/generate-plan.mjs` | Node.js script for generating a 90-day plan JSON; used as an alternative to the AI prompt flow for local plan generation |
| `supabase/my-90-day-plan.json` | The generated 90-day plan JSON for Prajjawal's current cycle; serves as the import payload for `/prompt` Step 3 |

---

## Config and Root Files

| File | Description |
|------|-------------|
| `middleware.ts` | Auth middleware protecting all routes; calls `supabase.auth.getUser()` on every request; redirects unauthenticated users to `/login`; redirects logged-in users away from auth pages to `/`; adds server-side admin role guard for `/admin` routes (queries `user_profiles.role`); runs on all routes except `_next/static`, images, and favicon |
| `next.config.ts` | Next.js configuration; standard SSR setup for Vercel deployment; no `output: 'export'` (v1 static export removed) |
| `tsconfig.json` | TypeScript configuration with `@/*` path alias pointing to `src/` |
| `package.json` | Dependencies: Next.js 16.2.1, React 19, `@supabase/ssr` 0.12.0, `@supabase/supabase-js` 2.108.2, `date-fns` 4.1.0, `lucide-react` 0.577.0, `tailwindcss` 4, `recharts` 3.8.0, `framer-motion` 12.38.0, `zustand` 5.0.12 |
| `postcss.config.mjs` | PostCSS config for Tailwind CSS v4 |
| `eslint.config.mjs` | ESLint configuration using `eslint-config-next` |
| `.env.local` | Local environment variables (not committed); contains `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` |
| `.env.local.example` | Template showing the required environment variable keys without values |
| `.gitignore` | Git ignore rules; includes `.env.local`, `.next/`, `node_modules/`, `out/` |
| `README.md` | Repository readme |

---

## Documentation Files

| File | Description |
|------|-------------|
| `docs/LAUNCH_PLAN.md` | Implementation plan tracking all v2.1 features; lists critical, medium, and post-launch items with checkboxes; includes launch checklist |
| `docs/LIFE_OS_USER_GUIDE.md` | Complete user guide for all 20 modules; covers UI details, workflows, and data model; primary end-user documentation |
| `docs/VERSION_CHANGELOG.md` | Product changelog comparing v1 (localStorage) to v2 (Supabase); page-by-page diff; architecture changes; breaking changes |
| `docs/V1_VS_V2_USER_CHANGES.md` | Detailed side-by-side comparison of v1 vs v2 for each module |
| `docs/PROJECT_FILE_MAP.md` | This file; complete file map with descriptions |
| `docs/FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md` | Gap audit report from July 2026; implementation plan for remaining issues |
| `docs/HOW_TO_USE_AND_MIGRATE.md` | Personal usage guide for Prajjawal; daily workflow, module-by-module guide, v1-to-v2 migration steps |
| `docs/HOW_TO_RUN.md` | Local development and Vercel deployment instructions |
| `docs/archieved/GAPS_AND_IMPROVEMENTS.md` | Original 35+ gap analysis from July 4, 2026; v2.0 baseline; some items fixed in v2.1 |
| `docs/archieved/MASTER_IMPLEMENTATION_PLAN.md` | Earlier implementation planning document (archived) |
| `docs/walkthroughof helping hand` | v1-era architecture walkthrough document describing localStorage data connections and sync hooks; no longer reflects v2 implementation |
| `docs/developer_growth_engine.md` | Additional developer reference document |

---

## Database Tables Reference

| Table | Used By | Stores |
|-------|---------|--------|
| `auth.users` | Middleware, all pages (via auth) | User accounts managed by Supabase Auth — email, password hash, session |
| `user_profiles` | layout.tsx, sidebar, settings, admin | display_name, bio, role (user/super_admin), avatar_url, linkedin_url, github_url, twitter_url, portfolio_url |
| `user_settings` | settings, finance, progress | theme, timezone, week_start, daily_reminder_time, debt_remaining, debt_total, weekly_review_checks |
| `modules` | layout.tsx (sidebar rendering) | Module registry — name, slug, icon, is_default, sort_order; 16 modules seeded + 1 from migration 003 |
| `user_module_settings` | layout.tsx, admin | Per-user module enable/disable state; admin can toggle any user's modules |
| `ninety_day_cycles` | dashboard, today, calendar, progress, prompt | title, goal, start_date, end_date, is_active; only one active cycle per user |
| `days` | today, day view, calendar, progress, dashboard | day_number, date, plan_type (A/B/C), theme, notes, rentlyf_hours; one row per day per cycle |
| `tasks` | today, day view, progress, dashboard | title, category, status (pending/completed/skipped/postponed), content, notes, sort_order; many per day |
| `goals` | goals page | goal_type (life/annual/quarterly/monthly), title, description, status, target_value, current_value, unit, deadline |
| `timetable_plans` | timetable page | plan_type (A/B/C), name, blocks (JSONB array of TimetableBlock objects) |
| `timetable_checks` | timetable page | date, block_ids (text[]) — tracks which blocks were checked today |
| `health_logs` | health page, dashboard | date, exercise_done, yoga_done, meditation_done, skincare_done, exercise_minutes, weight_kg, water_glasses, sleep_hours, mood, exercise_notes, notes |
| `finance_entries` | finance page, dashboard | date, type (income/expense), category, description, amount, currency |
| `crm_leads` | crm page | name, company, email, phone, stage, service, source, deal_value, next_followup, notes |
| `cold_calls` | crm page | lead_id (optional FK), date, name, phone, outcome, notes |
| `content_posts` | content page, blog page, brand page | title, platform, status, content, hook, tags, url, scheduled_date, pillar; unified table for all content |
| `learning_resources` | learning page | title, resource_type, topic, url, status, total_lessons, completed_lessons, notes |
| `freelance_projects` | freelance page | title, client_name, platform, status, budget, paid_amount, currency, deadline, notes |
| `rentlyf_logs` | rentlyf page | date, hours, category, notes; upserts on (user_id, date) |
| `habits` | habits page | name, emoji, color, category, frequency, is_active, sort_order; added by migration 003 |
| `habit_logs` | habits page | habit_id (FK), date, done (boolean); UNIQUE on (habit_id, date); added by migration 003 |
| `brand_metrics` | brand page | week_of, followers, profile_views, search_appearances, post_impressions, connections; UNIQUE on (user_id, week_of); added by migration 003 |
| `brand_profile_checklist` | brand page | checklist JSONB — 11-item LinkedIn profile completion state; PK is user_id; added by migration 003 |
| `brand_daily_actions` | brand page | date, actions_done JSONB — 5-item daily LinkedIn action state; PK is (user_id, date); added by migration 003 |
