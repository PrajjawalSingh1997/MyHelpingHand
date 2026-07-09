# Life OS — Version Change Log & Product Specification

**Document Type:** Product Changelog + Technical Specification  
**Project:** Life OS — Personal Operating System  
**Author:** Prajjawal Singh  
**Last Updated:** July 8, 2026  
**Repository:** https://github.com/PrajjawalSingh1997/MyHelpingHand

---

## v2.1 — Post-Launch Additions (July 2026)

**Release Date:** July 8, 2026  
**Branch:** main  
**Audit date:** July 8, 2026 — all items verified against actual source files.

### New Modules

#### Habits Tracker (`/habits`)

A fully implemented daily habit tracking module. Users define habits with name, emoji, color, and frequency. The main view is a table with one row per habit showing a 7-day grid (filled = done, empty = not done), a fire-emoji streak counter, and hover-to-reveal edit/delete actions. One-click toggle per day cell upserts to `habit_logs`. Streak is calculated from complete log history (not just the 7-day window). Toast feedback on all CRUD operations.

Implementation: `src/app/(dashboard)/habits/page.tsx` — fully implemented, not a stub.

#### Brand Hub (`/brand`)

A LinkedIn personal brand strategy page. Sections: LinkedIn Profile Completion Checklist (11 items, saves to `brand_profile_checklist` JSONB), Weekly Metrics Tracker (5 LinkedIn metrics + week date, upserts to `brand_metrics`), Content Pillars (8 pillars with post counts from `content_posts.pillar`, links to `/content?pillar=slug`), Daily Brand Actions (5 daily checkboxes, auto-resets on date change, saves to `brand_daily_actions`), and Connection Growth Table (week-over-week delta, color-coded). CSS bar chart for follower growth (no external chart library).

Implementation: `src/app/(dashboard)/brand/page.tsx` — fully implemented.

### Database Changes — Migration 002

File: `supabase/migrations/002_life_os_enhancements.sql`

- Added `debt_total NUMERIC(10,2) DEFAULT 80000` column to `user_settings`
- Updates existing rows with null/zero debt_total to 80000

### Database Changes — Migration 003

File: `supabase/migrations/003_habits_brand_growth.sql`

**New tables:**
- `habits` — user-defined habits with name, emoji, color, category, frequency, sort_order, is_active
- `habit_logs` — per-habit per-date log with UNIQUE(habit_id, date); boolean `done` field
- `brand_metrics` — weekly LinkedIn metrics (followers, profile_views, search_appearances, post_impressions, connections) with UNIQUE(user_id, week_of)
- `brand_profile_checklist` — LinkedIn profile completion state stored as JSONB; PK is user_id
- `brand_daily_actions` — daily brand action state stored as JSONB; PK is (user_id, date)

**Column additions to existing tables:**
- `content_posts.pillar TEXT` — content pillar tagging for Content Calendar and Brand Hub
- `user_profiles.linkedin_url TEXT` — LinkedIn profile URL
- `user_profiles.github_url TEXT` — GitHub profile URL
- `user_profiles.twitter_url TEXT` — Twitter/X profile URL
- `user_profiles.portfolio_url TEXT` — Portfolio website URL
- `user_settings.weekly_review_checks JSONB DEFAULT '{}'` — weekly review checklist state (stored as `{week: 'YYYY-WW', checks: {...}}`)
- `health_logs.exercise_minutes INTEGER` — duration of exercise in minutes

**Module insertion:**
- Brand Hub module inserted into `modules` table (slug='brand', icon='Rocket', sort_order=14)

**RLS:**
- All 5 new tables have RLS enabled with user-scoped policies

### TypeScript Types Added (`src/types/database.ts`)

- `habits` table: Row / Insert / Update types
- `habit_logs` table: Row / Insert / Update types
- `brand_metrics` table: Row / Insert / Update types
- `brand_profile_checklist` table: Row / Insert / Update types
- `brand_daily_actions` table: Row / Insert / Update types
- Exported convenience types: `Habit`, `HabitLog`, `BrandMetric`, `BrandDailyAction`
- `content_posts` Row/Insert/Update types updated to include `pillar: string | null`

### Feature Updates

#### Finance Tracker — Debt Total from Database
- Removed hardcoded `const DEBT_TOTAL = 80000` from `finance/page.tsx`
- Now loads `debt_total` from `user_settings` and uses state: `const [debtTotal, setDebtTotal] = useState(80000)`
- Added inline "Edit Debt Total" UI within Finance page itself (separate from Settings)
- `saveDebtTotal()` updates `user_settings.debt_total` directly from Finance page

#### Settings Page — Fully Expanded
- Added **Finance Configuration** card: debt_total input field, saved via `saveSettings()`
- Added **Social Links** section: linkedin_url, github_url, twitter_url, portfolio_url — saved via `saveProfile()`
- Added **Theme Toggle**: 3-option radio (Dark/Light/System); applies `data-theme` attribute live on change
- `layout.tsx` now applies saved theme before first paint via inline `<script>` to prevent theme flash

#### Health Tracker — Improvements
- Expanded data window from 30 days to 90 days (query uses `subDays(new Date(), 90)`)
- Added `exercise_minutes` number field to health log form and upsert payload
- Added delete button on each log row in the 14-day history table (`deleteLog()` with confirm dialog)
- Summary stat card for Exercise now shows: `Xd (Ym)` — both exercise days and total minutes

#### Progress — Growth Tracker Tab + Weekly Review
- Added Overview | Growth Tracker tab switcher
- Growth Tracker tab: table showing per-day LinkedIn/GitHub/Twitter/Freelance task completion counts, color-coded (green=all done, amber=partial, empty=none), clickable rows link to `/day/N`
- Added Weekly Review collapsible card (6 checkboxes, saves to `user_settings.weekly_review_checks` as `{week: 'YYYY-WW', checks: {...}}`, resets each new ISO week)

#### Content Calendar — Pillar Tagging
- Added `pillar` field to `PostModal` form (8-option select matching Brand Hub pillars)
- Pillar saved to `content_posts.pillar` on insert/update
- Pillar badge displayed on each post card in both week and list views

#### CRM — Cold Call Enhancements
- Added Edit button (pencil) on each cold call row — reveals full edit form inline
- Added Delete button (trash) on each cold call row
- Added `lead_id` dropdown to cold call form — links call to an existing lead
- Linked lead name shown as badge on cold call row
- Outcome can be changed via inline select (auto-saves on change)

#### Blog vs Content — Platform Separation Fixed
- Blog page (`blog/page.tsx`) now queries using `.in('platform', ['blog','hashnode','dev.to','medium','personal'])` — restricted to long-form platforms only
- Content Calendar (`content/page.tsx`) uses `PLATFORMS = ['linkedin','twitter','instagram','youtube','newsletter']` — social platforms only
- Both pages use the same `content_posts` table but with non-overlapping platform sets

#### Middleware — Server-Side Admin Guard Added
- `middleware.ts` now performs server-side role check for `/admin` routes
- Queries `user_profiles.role` and redirects to `/` if not `super_admin`
- Previously only client-side redirect existed in the admin page component

#### Sidebar — New Modules Wired
- `habits: '/habits'` added to `SLUG_HREF` in `sidebar.tsx`
- `brand: '/brand'` added to `SLUG_HREF` in `sidebar.tsx`
- `CheckSquare` and `Rocket` icons already imported

### Schema Additions Summary (v2.1)

| Table | Column Added | Type | Default |
|-------|-------------|------|---------|
| `user_settings` | `debt_total` | NUMERIC(10,2) | 80000 |
| `user_settings` | `weekly_review_checks` | JSONB | '{}' |
| `user_profiles` | `linkedin_url` | TEXT | null |
| `user_profiles` | `github_url` | TEXT | null |
| `user_profiles` | `twitter_url` | TEXT | null |
| `user_profiles` | `portfolio_url` | TEXT | null |
| `content_posts` | `pillar` | TEXT | null |
| `health_logs` | `exercise_minutes` | INTEGER | null |

### Known Gap Found in v2.1 Audit

The `habits` module (slug='habits') is **not seeded** in `seed.sql` and is **not inserted** by Migration 003. Only the Brand Hub module is inserted by Migration 003. Without a `modules` row for habits, the sidebar will not display the Habits link even though the page and types are fully implemented. A manual SQL INSERT is required — see `LAUNCH_PLAN.md`.

---

## Table of Contents

1. [Document Purpose](#1-document-purpose)
2. [Version Summary](#2-version-summary)
3. [Admin vs New User — Full Login Workflow](#3-admin-vs-new-user--full-login-workflow)
4. [Architecture Changes](#4-architecture-changes)
5. [Data Layer Changes](#5-data-layer-changes)
6. [Feature Changes — Page by Page](#6-feature-changes--page-by-page)
7. [UI / UX Changes](#7-ui--ux-changes)
8. [Authentication Changes](#8-authentication-changes)
9. [Deployment Changes](#9-deployment-changes)
10. [Database Schema Reference](#10-database-schema-reference)
11. [Breaking Changes](#11-breaking-changes)
12. [Known Limitations](#12-known-limitations)

---

## 1. Document Purpose

This document captures every significant difference between Life OS v1 (single-user, hardcoded data, localStorage) and Life OS v2 (multi-user SaaS, Supabase, cloud database). It serves as:

- A reference for understanding what changed and why
- A guide for onboarding new users to v2
- A technical spec for future developers working on this codebase
- A migration record for data originally stored in the v1 app

---

## 2. Version Summary

| Property | v1 (Legacy) | v2 (Current) |
|----------|-------------|--------------|
| **Version tag** | v1.0 | v2.0 |
| **Release date** | March 23, 2026 | June 30, 2026 |
| **Architecture** | Static site (SSG) | Full-stack SaaS (SSR + API) |
| **Data storage** | Browser localStorage | PostgreSQL (Supabase cloud) |
| **State management** | Zustand stores | Supabase client queries |
| **Authentication** | None (no login) | Supabase Auth (email/password) |
| **Users supported** | 1 (you only) | Unlimited (multi-tenant) |
| **Hosting** | GitHub Pages | Vercel (serverless) |
| **Data persistence** | Lost on browser clear | Permanent cloud storage |
| **Data privacy** | None (anyone with URL sees all) | Row Level Security (RLS) — each user sees only their data |
| **Admin controls** | None | Super admin panel with per-user module control |
| **New pages in v2** | — | Health, Finance, CRM, Prompt/Import, Admin |
| **Removed in v2** | — | Nothing removed; all v1 pages still exist |

---

## 3. Admin vs New User — Full Login Workflow

This section documents the exact experience for each user type from the moment they open the URL to the moment they are using the app.

---

### 3.1 Super Admin Login Workflow

**Who:** `prajjawalsingh1997@gmail.com` — role = `super_admin` in `user_profiles`

#### Step 1 — Navigates to URL
User opens `https://my-helping-hand.vercel.app`

**What happens technically:**
- Next.js middleware (`middleware.ts`) intercepts the request
- Calls `supabase.auth.getUser()` using the session cookie
- No session found → `middleware` redirects to `/login`

#### Step 2 — Login Page (`/login`)
User sees:
- Life OS logo + "Sign in to your operating system"
- Email + Password fields
- "Sign In" button
- Link to sign up

User enters `prajjawalsingh1997@gmail.com` + `Rajput@12` → submits.

**What happens technically:**
- `supabase.auth.signInWithPassword()` is called
- Supabase validates credentials against `auth.users`
- On success: sets a session cookie (HTTP-only, secure)
- `router.push('/')` → navigates to dashboard

#### Step 3 — Dashboard Layout Server Component loads
Request hits `/(dashboard)/layout.tsx` (server component).

**What happens technically (in parallel):**
```
Query 1: SELECT * FROM user_profiles WHERE id = $userId
         → Returns: { display_name: 'Prajjawal', role: 'super_admin' }

Query 2: SELECT is_enabled, modules(id, name, slug, icon, sort_order)
         FROM user_module_settings
         WHERE user_id = $userId AND is_enabled = true
         ORDER BY modules(sort_order)
         → Returns: all 16 enabled modules
```

**What renders:**
- Sidebar with all 16 module links (Dashboard → Settings) in sort order
- **Admin Panel link** visible at the bottom of sidebar (gold/amber color) — only visible because `role === 'super_admin'`
- Top bar showing "Prajjawal" display name
- Bottom of sidebar: "Prajjawal · Life OS v2"

#### Step 4 — Dashboard Page (`/`)
The `(dashboard)/page.tsx` client component loads.

**Data fetched:**
```
Query 1: SELECT * FROM ninety_day_cycles 
         WHERE user_id = $userId AND is_active = true
         → Returns: their cycle (if imported via /prompt)

Query 2: SELECT id, day_number, date, plan_type, tasks(status)
         FROM days WHERE cycle_id = $cycleId
         ORDER BY day_number
         → Returns: 90 days with task completion status
```

**What admin sees:**
- If cycle imported: Day X of 90 with progress ring, streak count, week view, 90-day heatmap
- If no cycle yet: `EmptyCycle` component with button to go to `/prompt`
- Quick stats: Streak, Cycle Progress, Finance placeholder, Health placeholder
- Quick Access tiles: Health Log, Finance, CRM, Import Plan

#### Step 5 — Admin-specific capability: `/admin`
Only visible in sidebar for super admins.

**What admin sees:**
- Full user table listing every registered user (email pulled from `auth.users` via admin API)
- Each user has a row of toggle checkboxes — one per module
- Bulk enable/disable: select multiple users → pick a module → enable or disable for all
- Search bar to filter users by name or email
- "Enable All" shortcut per user row

**What happens when admin toggles a module:**
```sql
UPSERT INTO user_module_settings (user_id, module_id, is_enabled)
VALUES ($userId, $moduleId, $newValue)
ON CONFLICT (user_id, module_id) DO UPDATE SET is_enabled = $newValue
```
That user's sidebar will reflect the change on their next page load.

---

### 3.2 New User Login Workflow

**Who:** Anyone who signs up at `/signup` for the first time.

#### Step 1 — Navigates to URL
User opens `https://my-helping-hand.vercel.app`

- Middleware: no session → redirects to `/login`

#### Step 2 — Goes to Sign Up (`/signup`)
User sees:
- Email + Display Name + Password fields
- "Create Account" button

User fills in details and submits.

**What happens technically:**
- `supabase.auth.signUp()` is called
- Supabase creates a row in `auth.users`
- **DB trigger `on_auth_user_created` fires immediately:**

```sql
-- Trigger does these 4 inserts automatically:

INSERT INTO public.user_profiles (id, display_name, role)
VALUES (new_user_id, split_part(email, '@', 1), 'user');
-- role = 'user' (NOT super_admin)

INSERT INTO public.user_settings (user_id)
VALUES (new_user_id);
-- All defaults: theme='dark', timezone='Asia/Kolkata', week_start='monday'

INSERT INTO public.user_module_settings (user_id, module_id, is_enabled)
SELECT new_user_id, id, is_default FROM public.modules;
-- Creates 16 rows, all enabled (is_default=true for all modules)

INSERT INTO public.timetable_plans (user_id, plan_type, name, blocks)
VALUES 
  (new_user_id, 'A', 'Plan A - Standard Day', '[]'),
  (new_user_id, 'B', 'Plan B - Heavy Work Day', '[]'),
  (new_user_id, 'C', 'Plan C - Business Dev Day', '[]');
-- Empty timetable shells created, blocks=[]]
```

- User is logged in automatically → redirects to `/`

#### Step 3 — Dashboard Layout loads
Same server component as admin, but:

```
Query 1: user_profiles → { display_name: 'john', role: 'user' }
Query 2: user_module_settings → all 16 modules (default enabled)
```

**What renders differently from admin:**
- Sidebar: 16 module links — **no Admin Panel link** (role is not `super_admin`)
- Bottom: shows their display name

#### Step 4 — Dashboard Page — What New User Sees

```
Query: ninety_day_cycles WHERE user_id = $newUserId AND is_active = true
→ Returns: null (no cycle exists yet)
```

**What new user sees:**
- `EmptyCycle` component:
  ```
  ✨ No Active 90-Day Cycle
  
  You haven't started your 90-day journey yet.
  Use the Prompt & Import tool to generate your
  personalised plan with AI.
  
  [Go to Prompt & Import →]
  ```
- Every other page also shows this EmptyCycle or equivalent empty state

#### Step 5 — Every Page is Empty Until Cycle is Imported

| Page | What new user sees |
|------|--------------------|
| `/` | EmptyCycle component |
| `/today` | EmptyCycle component |
| `/calendar` | EmptyCycle component |
| `/progress` | EmptyCycle component |
| `/day/1` | "This day doesn't exist in your cycle yet" |
| `/timetable` | Plan A/B/C shells exist but all blocks are empty — user can add blocks manually |
| `/goals` | Empty goals list + "Add Goal" button — fully functional immediately |
| `/health` | Empty health log — can start logging today immediately |
| `/finance` | Empty entries + ₹0 balance — can start logging immediately |
| `/crm` | Empty pipeline — can add leads immediately |
| `/blog` | Empty posts — can add ideas immediately |
| `/content` | Empty content calendar |
| `/learning` | Empty resources |
| `/freelance` | Empty projects |
| `/rentlyf` | Empty logs |
| `/settings` | Shows profile + preferences — all pre-filled with defaults |
| `/prompt` | Full 3-step import flow available immediately |

#### Step 6 — New User Imports Their Cycle via `/prompt`

1. Copies the AI prompt template
2. Pastes it into Claude/ChatGPT, fills in their profile details
3. AI returns JSON with cycle + 90 days + tasks
4. User pastes JSON into the import field → clicks Import
5. App creates: 1 cycle record + 90 day records + N task records (in batches of 10)
6. Dashboard now shows their Day 1, calendar fills up, progress tracking starts

---

### 3.3 Side-by-Side Differences: Admin vs New User

| What | Super Admin | New Regular User |
|------|-------------|------------------|
| Sidebar: Admin Panel link | ✅ Visible (amber color) | ❌ Hidden |
| Can access `/admin` | ✅ Yes | ❌ Redirect to `/` |
| Can toggle modules for others | ✅ Yes | ❌ No |
| Sees other users' data | ❌ No (RLS prevents it) | ❌ No (RLS prevents it) |
| Has their own cycle | ✅ After importing via /prompt | ✅ After importing via /prompt |
| Has timetable plans | ✅ Shell exists (3 plans) | ✅ Shell exists (3 plans) |
| `user_profiles.role` | `super_admin` | `user` |
| Module visibility | All 16 (controlled by self via DB) | All 16 by default; admin can restrict |
| Can change own password | ✅ via /settings | ✅ via /settings |
| Can sign up new users | ❌ Only Supabase dashboard | ❌ Not applicable |

---

## 4. Architecture Changes

### 4.1 v1 Architecture

```
Browser
  └── Next.js (Static Export)
        ├── src/data/*.ts           ← Hardcoded data files
        ├── src/store/stores.ts     ← Zustand (localStorage)
        ├── src/store/task-store.ts ← Zustand (localStorage)
        └── src/hooks/use-sync.ts  ← Syncs data to/from localStorage

GitHub Actions
  └── Build → Deploy to GitHub Pages (static HTML/JS/CSS)
```

**Key characteristics:**
- `output: 'export'` in `next.config.ts` — fully static, no server
- `basePath` set for GitHub Pages subdirectory URL
- Zero backend — everything runs in the browser
- Data lives in `window.localStorage` under specific keys
- Cleared browser data = lost all progress

### 4.2 v2 Architecture

```
Browser (Client)
  └── Next.js (App Router, SSR + Client Components)
        ├── middleware.ts               ← Auth gate, session refresh
        ├── src/app/(auth)/             ← Login, Signup pages
        ├── src/app/(dashboard)/        ← All app pages (protected)
        ├── src/lib/supabase/client.ts  ← Browser Supabase client
        └── src/lib/supabase/server.ts  ← Server Supabase client

Vercel (Server)
  └── Next.js serverless functions
        ├── Dashboard layout → server component (auth check + DB queries)
        └── Individual pages → mix of server + client components

Supabase (Backend)
  ├── auth.users              ← Authentication
  ├── PostgreSQL (18 tables)  ← All user data
  ├── Row Level Security      ← Data isolation per user
  └── DB Trigger              ← Auto-setup on signup
```

---

## 5. Data Layer Changes

### 5.1 How Data Was Stored in v1

| Data Type | v1 Storage | v1 Source |
|-----------|-----------|-----------|
| 90-day task plan | localStorage (`lifeOS_days`) | Generated from `src/data/days.ts` — hardcoded function that builds all 90 days |
| Task completion | localStorage (`lifeOS_tasks`) | Zustand task-store |
| Goals / Scorecard | localStorage (`lifeOS_goals`) | Hardcoded in `src/data/goals.ts` |
| Blog posts | localStorage (`lifeOS_blogs`) | Hardcoded in `src/data/blogs.ts` |
| Learning topics | localStorage (`lifeOS_learning`) | Hardcoded in `src/data/learning.ts` |
| Timetable blocks | localStorage (`lifeOS_timetable`) | Hardcoded in `src/data/timetables.ts` |
| Settings | localStorage | Zustand stores |
| Notes | localStorage | Zustand stores |
| Rentlyf hours | localStorage | Zustand stores |
| User identity | None (single user, no concept of user) | — |

**Critical v1 data facts:**
- Cycle start date was hardcoded as `"2026-03-24"` in `src/data/days.ts`
- Date was updated by commit `f425c28` to March 26, 2026 and auto-migrated by `e852f58`
- All tasks started as `completed: false, skipped: false` — no work was actually done in v1
- Data would survive browser refreshes (localStorage) but be lost on: cache clear, private browsing, different device, different browser

### 5.2 How Data Is Stored in v2

| Data Type | v2 Table | Notes |
|-----------|---------|-------|
| User identity | `auth.users` (Supabase managed) | Email, password hash, created_at |
| User profile | `user_profiles` | display_name, bio, role, avatar_url |
| User preferences | `user_settings` | theme, timezone, week_start, debt_remaining |
| Module visibility | `user_module_settings` | Per-user, per-module toggle |
| 90-day cycle | `ninety_day_cycles` | title, goal, start_date, end_date, is_active |
| Daily plans | `days` | day_number, date, plan_type, theme, notes, rentlyf_hours |
| Tasks | `tasks` | title, category, status (pending/completed/skipped/postponed), content |
| Goals | `goals` | goal_type (life/annual/quarterly/monthly), status, target_value, current_value |
| Timetable plans | `timetable_plans` | plan_type (A/B/C), name, blocks (JSONB array) |
| Timetable check-ins | `timetable_checks` | date, block_ids (which blocks were done today) |
| Health logs | `health_logs` | date, exercise, yoga, meditation, skincare, weight_kg, water_glasses, sleep_hours, mood, exercise_notes |
| Finance entries | `finance_entries` | date, type (income/expense), category, description, amount, currency |
| CRM leads | `crm_leads` | name, company, stage, deal_value, service, next_followup |
| Cold calls | `cold_calls` | name, phone, outcome, notes (no lead_id required — standalone) |
| Blog/Content posts | `content_posts` | title, platform, status (idea/draft/scheduled/published), content, url, scheduled_date |
| Learning resources | `learning_resources` | title, resource_type, topic, url, status, total_lessons, completed_lessons |
| Freelance projects | `freelance_projects` | title, client_name, platform, status, budget, paid_amount, currency, deadline |
| Rentlyf daily logs | `rentlyf_logs` | date, hours_worked, task_summary |
| Available modules | `modules` | name, slug, icon, is_default, sort_order — seeded once, admin-managed |

### 5.3 Data Ownership & Privacy

**v1:** No concept of ownership. One user. All data is global.

**v2:** Every table (except `modules`) has a `user_id` column. Row Level Security policies enforce:
```sql
-- Example: user can only see their own goals
CREATE POLICY "Users see own goals" ON goals
  FOR ALL USING (user_id = auth.uid());
```
This means even if someone discovered the API, they would only receive their own data — the database enforces isolation.

**Super admin exception:**
```sql
CREATE FUNCTION is_super_admin() RETURNS BOOLEAN AS $$
  SELECT EXISTS (SELECT 1 FROM user_profiles 
                 WHERE id = auth.uid() AND role = 'super_admin');
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Some policies allow: USING (user_id = auth.uid() OR is_super_admin())
```

---

## 6. Feature Changes — Page by Page

### 6.1 Pages That Existed in v1 AND v2

---

#### Dashboard (`/`) — Homepage

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Zustand store (localStorage) | Supabase `ninety_day_cycles` + `days` + `tasks` |
| First load | Instantly shows Day 1 of hardcoded plan | Shows `EmptyCycle` until user imports a plan |
| Day number | Calculated from hardcoded start date (Mar 24) | Calculated from `cycle.start_date` in DB |
| Streak | Calculated from localStorage task completions | Calculated from DB task completions |
| Week view | 7 day cells with completion dots | Same, but data from DB |
| 90-day heatmap | Rendered from all 90 hardcoded days | Rendered from DB days (only as many as imported) |
| Quick stats | Static mock values | Streak from DB; others are placeholders (Finance, Health) |
| Quick Access tiles | Not present | NEW: Health Log, Finance, CRM, Import Plan shortcuts |

---

#### Today (`/today`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Zustand task-store | `useDay()` hook → Supabase `days` + `tasks` |
| Task categories | linkedin, github, twitter, freelance, portfolio, blog, rentlyf, learning, networking, health, personal | Same categories |
| Task completion | Toggle in localStorage | PATCH to `tasks.status` in Supabase |
| Task statuses | `completed: boolean`, `skipped: boolean` | Enum: `pending / completed / skipped / postponed` |
| Postpone task | Not supported | NEW: Move task to any day (1–90) |
| Edit task | Not supported | NEW: Edit title + content inline |
| Delete task | Not supported | NEW: Delete task with confirmation |
| Copy post content | Supported | Supported (unchanged) |
| Daily notes | localStorage | Saved to `days.notes` in Supabase |
| Rentlyf hours | localStorage | Saved to `days.rentlyf_hours` in Supabase |
| Navigation | Prev/Next day links | Same (unchanged) |
| Progress ring | Rendered from localStorage | Rendered from DB task statuses |

---

#### Calendar (`/calendar`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Zustand (all 90 days pre-generated) | Supabase `days` + `tasks` (only existing days) |
| Empty state | Shows full calendar even with no data | Shows `EmptyCycle` if no active cycle |
| Color coding | Completion percentage dots | Same (≥80% green, 50-79% amber, <50% red, future grey) |
| Links | Navigate to day view | Same |
| Month navigation | Supported | Supported |
| Upcoming days | Listed below calendar | Same |

---

#### Progress (`/progress`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Zustand | Supabase |
| Streak | From localStorage | From DB |
| Completion rate | From localStorage | From DB |
| 90-day heatmap | Full 90 days (all hardcoded) | Only days that have been created in DB |
| Weekly bar chart | Last 13 weeks | Same |
| Category breakdown | By task category | Same |
| Last 14 days table | By day with status | Same |
| Empty state | Never empty (hardcoded data always present) | Shows `EmptyCycle` if no cycle |

---

#### Timetable (`/timetable`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Hardcoded in `src/data/timetables.ts` | Supabase `timetable_plans` (JSONB blocks) |
| Plan A default blocks | 12 blocks (12PM wake → 4:30AM sleep) | Empty by default; user fills via UI |
| Block editing | Not supported | NEW: Add, edit, delete blocks inline |
| Check-in | Not supported | NEW: Mark blocks as done for today (saved to `timetable_checks`) |
| NOW indicator | Not implemented | Shows current time indicator in timeline view |
| Weekly rhythm | Hardcoded table (Mon=A, Wed=C etc.) | Tab on timetable page, not DB-stored |
| Plans | A (Standard), B (Heavy Coding), C (Content) | Same 3 plans, but user-editable |

---

#### Goals (`/goals`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Hardcoded in `src/data/goals.ts` (ScoreCard metrics) | Supabase `goals` table, full CRUD |
| Data format | Scorecard: `{ name, target, actual, status }` | Full goal: `{ title, description, goal_type, status, target_value, current_value, unit, deadline }` |
| Goal types | Month 1, Month 2, Month 3 scorecard | life / annual / quarterly / monthly tabs |
| CRUD | Read only (data hardcoded) | Create, Read, Update, Delete |
| Progress bars | Not implemented | Progress bar: current_value / target_value |
| Status | `none / hit / partial / missed` | `not_started / in_progress / completed / on_hold` |

---

#### Blog (`/blog`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Hardcoded in `src/data/blogs.ts` | Supabase `content_posts` table |
| CRUD | Read only (25 blogs hardcoded) | Full CRUD — add, edit, delete |
| Statuses | `to_write` only | `idea / draft / scheduled / published` |
| Scheduled date | `scheduledDay` (day number in cycle) | `scheduled_date` (actual calendar date) |
| Platform filter | Not supported | Filter by platform tab |
| URL field | Not present | NEW: URL field for published posts |

---

#### Learning (`/learning`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Hardcoded in `src/data/learning.ts` (8 topics) | Supabase `learning_resources` table |
| CRUD | Read only (8 topics hardcoded) | Full CRUD |
| Fields | `{ title, category, status, resources[], notes, hoursSpent }` | `{ title, resource_type, topic, url, status, total_lessons, completed_lessons }` |
| Progress | hoursSpent field only | Progress bar: completed_lessons / total_lessons |

---

#### Freelance (`/freelance`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | Hardcoded + localStorage | Supabase `freelance_projects` |
| Fields v1 | Basic (title, status, notes) | NEW: budget, paid_amount, currency, deadline, platform, client_name |
| Statuses | 3 stages | 5 stages: `lead / proposal / active / completed / cancelled` |
| Revenue summary | Not present | NEW: Total earned, Active pipeline value, Active project count |
| CRUD | Limited | Full CRUD |

---

#### Rentlyf (`/rentlyf`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | localStorage | Supabase `rentlyf_logs` |
| Daily logging | Hours input on today page | Dedicated page with upsert per date |
| Weekly view | Not present | NEW: Hours grouped by week |
| Stats | Not present | NEW: Total hours, this week hours, average per day |

---

#### Settings (`/settings`)

| Aspect | v1 | v2 |
|--------|----|----|
| Data source | localStorage | Supabase `user_profiles` + `user_settings` |
| Fields | Theme toggle, basic prefs | Display name, bio, timezone, week_start, daily reminder time |
| Password change | Not applicable (no auth) | NEW: Change password via Supabase Auth |
| Sign out | Not applicable | NEW: Sign out button |

---

### 6.2 Pages New in v2 (Did Not Exist in v1)

---

#### Health Tracker (`/health`) — NEW

Tracks daily physical and mental wellbeing.

**Logs per day:**
- Exercise (checkbox)
- Yoga (checkbox)
- Meditation (checkbox)
- Skincare (checkbox)
- Weight (kg, number)
- Water glasses (number, target: 8)
- Sleep hours (number)
- Mood (1–5 range slider)
- Exercise notes (text)

**Storage:** Upsert on `(user_id, date)` — one row per user per day.

**Display:** Today's form at top + last 14 days log table.

---

#### Finance Tracker (`/finance`) — NEW

Income/expense tracking with debt countdown.

**Features:**
- Log income or expense entries with category, amount, date, description
- Categories: Salary, Freelance, Rentlyf, Investment Returns (income); Food, Rent, Transport, Utilities, EMI/Debt, and more (expense)
- Summary cards: Total Income, Total Expense, Net Balance
- **Debt Countdown:** Tracks ₹80,000 total debt. Log payments to reduce remaining. Progress bar shows % repaid.
- Filter entries by type (all / income / expense)

**Storage:** `finance_entries` table + `user_settings.debt_remaining`

---

#### CRM (`/crm`) — NEW

Lead pipeline management for freelance/Rentlyf sales.

**Features:**
- 6-stage pipeline: Cold → Warm → Hot → Proposal → Client → Lost
- Lead fields: name, company, email, phone, service, deal_value, stage, notes, next_followup
- Inline stage update (quick-move leads through pipeline)
- **Cold Call Logger:** Standalone section — log calls without a lead ID. Fields: name, phone, outcome (no_answer / callback / interested / not_interested / converted), notes, date.

**Storage:** `crm_leads` + `cold_calls` tables

---

#### Prompt & Import (`/prompt`) — NEW

3-step AI-assisted 90-day plan creation and import.

**Step 1 — Copy Prompt:**
Copy a structured prompt template. Fill in your name, start date, goal, situation, and objectives. Paste into Claude/ChatGPT.

**Step 2 — Get JSON from AI:**
AI returns a JSON object with `cycle` + `days` (each with tasks). Copy that JSON.

**Step 3 — Paste & Import:**
Paste the JSON. Click Import. The app:
- Deactivates any existing active cycle
- Creates a new `ninety_day_cycles` record
- Creates 90 `days` records
- Creates all tasks in batches of 10 (to avoid timeout)
- Redirects to dashboard

**Storage:** `ninety_day_cycles` + `days` + `tasks`

---

#### Admin Panel (`/admin`) — NEW

Only accessible to users with `role = 'super_admin'`.

**Features:**
- Lists all registered users (email from `auth.users`, name from `user_profiles`)
- Per-user, per-module enable/disable checkbox grid
- Bulk operations: select multiple users → choose a module → enable or disable for all
- Search/filter users by name or email
- "Enable All" shortcut to enable every module for a user

**Access control:** If any non-admin user navigates to `/admin`, they are immediately redirected to `/`.

---

#### Day View (`/day/[dayNumber]`) — UPDATED

This page existed in v1 but was minimal. In v2:

**v1:** Just a static view showing tasks for that day from localStorage.

**v2 additions:**
- Edit task title and content inline
- Delete task with confirmation
- Postpone task to a different day (1–90)
- Skip task (marks as `skipped`)
- Copy post content to clipboard
- Daily notes saved to DB
- Rentlyf hours saved to DB
- Navigate prev/next with arrow links

---

## 7. UI / UX Changes

### 7.1 Layout

| Element | v1 | v2 |
|---------|----|----|
| Sidebar | Fixed left, hardcoded links | Dynamic — links rendered from DB based on user's enabled modules |
| Sidebar admin link | Not present | Conditionally rendered for super_admin only |
| Top bar | Static, no user info | Shows user display name, dynamic |
| Route structure | `src/app/page.tsx`, `src/app/goals/page.tsx` etc. | `src/app/(auth)/login/page.tsx`, `src/app/(dashboard)/goals/page.tsx` etc. |
| Auth pages | Not present | `/login` and `/signup` — separate layout with centered card |

### 7.2 Design System

| Property | v1 | v2 |
|----------|----|----|
| Core colors | CSS variables (`--text`, `--accent` etc.) | Same CSS variables — design system carried over |
| Component classes | `.card`, `.badge` | `.card`, `.badge`, `.label`, `.input`, `.btn-primary`, `.btn-ghost` — 4 new utility classes added |
| Color palette | Dark theme: bg `#0A0A0F`, accent `#6C5CE7` | Same — unchanged |
| Typography | System fonts | Same |
| Animations | Minimal | Unchanged |
| Emoji usage | Emojis in page headers | Retained in v2 |

### 7.3 Empty States

**v1:** Empty states almost never appeared. Hardcoded data always populated every page.

**v2:** Every page that depends on a 90-day cycle shows a custom `EmptyCycle` component until a cycle is imported:

```
✨ No Active 90-Day Cycle
You haven't started your 90-day journey yet.
Use the Prompt & Import tool to generate your plan with AI.
[Go to Prompt & Import →]
```

Pages that don't depend on a cycle (Goals, Health, Finance, CRM, Blog, Learning, Freelance, Rentlyf) show empty list states but are immediately usable.

---

## 8. Authentication Changes

| Aspect | v1 | v2 |
|--------|----|----|
| Auth system | None | Supabase Auth (GoTrue) |
| Login | Not required | Required — redirected by middleware |
| Password | None | Min 8 characters, stored as bcrypt hash in `auth.users` |
| Session | None | HTTP-only session cookie, managed by `@supabase/ssr` |
| Route protection | None | `middleware.ts` — every `/` route checks session |
| Signup | Not applicable | `/signup` — creates account + triggers DB setup |
| Password reset | Not applicable | Available via Supabase dashboard or SQL |
| Email confirmation | Not required | Bypassed for dashboard-created users (email_confirmed_at set manually) |

**Middleware flow (v2):**
```
Every request to the app:
  1. middleware.ts intercepts
  2. Calls supabase.auth.getUser()
  3. If no user AND path is not /login or /signup:
     → redirect to /login
  4. If user AND path is /login or /signup:
     → redirect to / (already logged in)
  5. Otherwise: let request through, refresh session cookie
```

---

## 9. Deployment Changes

| Aspect | v1 | v2 |
|--------|----|----|
| Platform | GitHub Pages | Vercel |
| Build type | Static export (`output: 'export'`) | Server-side rendering (default Next.js) |
| Build command | `next build` (with static output) | `next build` (standard) |
| Deploy trigger | GitHub Actions on push to main | Vercel auto-deploy on push to main |
| Environment variables | Not needed (no backend) | `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` |
| Custom domain | GitHub Pages subdomain | Custom domain can be added in Vercel settings |
| URL | `https://prajjawalsingh1997.github.io/MyHelpingHand/` | `https://my-helping-hand.vercel.app` |
| HTTPS | GitHub provides | Vercel provides |
| basePath | Set in `next.config.ts` for GitHub Pages | Removed — no basePath needed on Vercel |
| Cold starts | None (static) | Vercel serverless — ~100ms cold start on free tier |

---

## 10. Database Schema Reference

### Tables Overview (v2 only — v1 had no database)

```
auth.users                ← Supabase managed (email, password)
  │
  ├── user_profiles       ← display_name, bio, role, avatar_url
  ├── user_settings       ← theme, timezone, week_start, debt_remaining
  ├── user_module_settings─── modules (id, name, slug, icon, sort_order)
  │
  ├── ninety_day_cycles
  │     └── days
  │           └── tasks
  │
  ├── goals
  ├── timetable_plans
  ├── timetable_checks
  ├── health_logs
  ├── finance_entries
  ├── crm_leads
  │     └── cold_calls
  ├── content_posts       ← unified blog + social media posts
  ├── learning_resources
  ├── freelance_projects
  └── rentlyf_logs
```

### Enum Types

```sql
task_status:             pending | completed | skipped | postponed
plan_type:               A | B | C
goal_type:               life | annual | quarterly | monthly
goal_status:             not_started | in_progress | completed | on_hold
finance_type:            income | expense
lead_stage:              cold | warm | hot | proposal | client | lost
call_outcome:            no_answer | callback | interested | not_interested | converted
content_post_status:     idea | draft | scheduled | published
learning_status:         not_started | in_progress | completed | on_hold
freelance_project_status: lead | proposal | active | completed | cancelled
user_role:               super_admin | user
```

---

## 11. Breaking Changes

The following v1 behaviours no longer exist in v2 and require action to migrate:

### BC-01: localStorage data is NOT automatically imported
All progress stored in localStorage (task completions, notes, settings) from v1 does NOT transfer to v2. The v2 app never reads from localStorage. Users must re-import their data.

**Resolution:** Use the Prompt & Import page (`/prompt`) + `supabase/seed-my-data.sql` to restore data.

### BC-02: Hardcoded start date is replaced by DB-stored cycle
v1 had a hardcoded start date of March 24, 2026 in `src/data/days.ts`. v2 uses whatever start date is in the `ninety_day_cycles` table.

**Resolution:** New cycle imported with start date June 30, 2026.

### BC-03: Single static URL is replaced by authenticated routes
v1 URL: `https://prajjawalsingh1997.github.io/MyHelpingHand/`
v2 URL: `https://my-helping-hand.vercel.app`

All old bookmarks or shared links point to the v1 URL. v2 is a completely separate deployment.

### BC-04: Blog post status `to_write` removed
v1 `blogs.ts` used status `to_write`. v2 `content_posts` table uses `idea | draft | scheduled | published`. Content migrated with status `idea`.

### BC-05: Learning topics table renamed
v1 had `learning_topics` in mind. v2 uses `learning_resources` with different field names (`total_lessons` instead of `resources[]`, `resource_type` instead of `category`).

### BC-06: Goals format completely changed
v1 goals were a scorecard (`{ name, target, actual, status }`). v2 goals are full CRUD entities with `goal_type`, `target_value`, `current_value`, `unit`, `deadline`, `description`.

### BC-07: GitHub Actions deploy workflow removed
v1 deployed via `.github/workflows/deploy.yml` to GitHub Pages. v2 deploys via Vercel automatically. The old GitHub Actions file has been removed from the repo.

---

## 12. Known Limitations

| # | Limitation | Impact | Planned Fix |
|---|-----------|--------|------------|
| L-01 | No email confirmation flow — users created via dashboard have `email_confirmed_at` set manually | Low (internal tool) | Not needed for personal use |
| L-02 | Admin `listUsers()` call requires service role — may fail if anon key is used | The admin page email column may show "unknown@email.com" | Need `SUPABASE_SERVICE_ROLE_KEY` as server-only env var |
| L-03 | Timetable NOW indicator uses client-side `new Date()` — no timezone awareness | Minor visual issue | Use user's timezone from `user_settings` |
| L-04 | `/prompt` import has no progress bar — large plans (90 days × 8 tasks) take 5–10 seconds with no feedback except "Importing…" | UX annoyance | Add step counter ("Creating day 45 of 90…") |
| L-05 | Finance page debt amount (₹80,000) is hardcoded in the frontend | Cannot be customised without code change | Move to `user_settings.debt_total` column |
| L-06 | No offline support | App requires internet | Not planned for v2 |
| L-07 | Content page and Blog page both use `content_posts` table — no platform-based routing | Minor confusion between the two pages | Could be merged into one page with platform filter |
| L-08 | Vercel free tier has 100GB bandwidth limit and 6000 build minutes/month | Unlikely to hit for personal use | Upgrade plan if needed |

---

*Document maintained by Prajjawal Singh. Last updated June 30, 2026.*  
*This document should be updated whenever significant changes are made to the codebase.*
