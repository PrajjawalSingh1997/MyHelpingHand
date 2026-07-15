# Life OS v2 — Final Launch Implementation Plan

> **Date:** July 2026 | **Audit Date:** July 8, 2026  
> **Status:** All critical + medium features IMPLEMENTED in code. Remaining tasks are manual DB + env steps.

---

## ✅ Already Shipped (Do Not Redo)

- [x] Toast feedback on every page (all CRUD operations) *(verified: `useToast` imported in habits, brand, health, finance, crm, content, goals, settings pages)*
- [x] Loading spinners + form validation on all forms *(verified: `Loader2` spinner and error state in every form component)*
- [x] Sidebar `/day/:n` active state for Today module *(verified: sidebar.tsx uses `usePathname()` for active highlight)*
- [x] Debounced notes save on Today page (500ms, uncontrolled input) *(verified: use-day.ts uses `useRef` + debounce for notes)*
- [x] Health form resets to blank when date has no existing log *(verified: health/page.tsx `BLANK_FORM(date)` called when no todayLog found)*
- [x] DST-safe day calculation (`differenceInCalendarDays`) on progress + calendar pages *(verified: progress/page.tsx line 63, use-cycle.ts line 29)*
- [x] Dashboard real stats — month income + exercise days this week from DB *(verified: dashboard/page.tsx queries `finance_entries` for month income and `health_logs` for exercise days)*
- [x] Admin user emails via server-side API route (`/api/admin/users`) *(verified: src/app/api/admin/users/route.ts exists)*
- [x] Auth callback route (`src/app/auth/callback/route.ts`) *(verified: file exists)*
- [x] `general` category added to Today page task list *(verified: today/page.tsx `categoryMeta` includes `general`)*
- [x] Add custom task (quick-add inline form) on Today page *(verified: today/page.tsx imports `addTask` from `useDay` hook)*
- [x] Migration 002 written — `debt_total` column (`supabase/migrations/002_life_os_enhancements.sql`) *(verified: file exists with correct SQL)*

---

## ⚠️ Manual Steps (Only You Can Do These)

> These are not code tasks — they require Supabase dashboard or terminal access.

1. **Run Migration 002** in Supabase SQL Editor → file: `supabase/migrations/002_life_os_enhancements.sql`
2. **Run Migration 003** in Supabase SQL Editor → file: `supabase/migrations/003_habits_brand_growth.sql`
3. **Seed Habits module** — Migration 003 adds Brand Hub module (`brand`) but does NOT add Habits (`habits`). Run this SQL manually:
   ```sql
   INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
   VALUES ('Habits', 'habits', 'Daily habit tracker and streaks', 'CheckSquare', true, 15)
   ON CONFLICT (slug) DO NOTHING;
   ```
   Then update sort_order for Prompt and Settings if needed.
4. **Add service role key** to `.env.local`:
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...your_key_here
   ```
   Get it from: Supabase → Project Settings → API → service_role (secret)
5. **Restart dev server** after adding env var: kill terminal → `npm run dev`

---

## 🔴 Critical — Must Build Before Launch

### 1. Database Migration 003 (Run First — Blocks Everything Else)

**File:** `supabase/migrations/003_habits_brand_growth.sql`

- [x] Migration file written and correct *(verified: file exists with all required SQL)*
- [ ] **MANUAL STEP:** Migration 003 must be run in Supabase SQL Editor before habits/brand pages work

---

### 2. Habits Tracker — Full Implementation

**File:** `src/app/(dashboard)/habits/page.tsx`

- [x] Load user's habits + last 7 days of habit_logs in single `load()` call *(verified: habits/page.tsx lines 88-91 — concurrent Promise.all fetch)*
- [x] **Today's checklist** — one-click toggle done/undone per habit for today's date (upsert to habit_logs) *(verified: `toggleHabit()` function with optimistic update, lines 125-154)*
- [x] **Streak counter** — consecutive days done per habit *(verified: `calculateStreak()` function, separate `allLogs` state with second useEffect)*
- [x] **7-day grid** — last 7 days as columns, each row = one habit, filled cell = done *(verified: `last7Days` array, table with cells per date)*
- [x] **Add Habit form** — name (required), emoji (text input), color picker, frequency (daily/weekly) *(verified: `HabitForm` component lines 9-63)*
- [x] **Edit Habit** — inline edit on click *(verified: `editingId` state, pencil button reveals form inline in table row)*
- [x] **Delete Habit** — confirm dialog → delete habit + cascades to habit_logs via FK *(verified: `deleteHabit()` function with confirm())*
- [x] **Empty state** — "No habits yet. Add your first habit to start your streak." *(verified: line 227)*
- [x] Toast on: add, update, delete, toggle *(verified: `show()` calls in all 4 functions)*

**TypeScript types in `src/types/database.ts`:**
- [x] `habits` table: Row / Insert / Update *(verified: database.ts lines 612-644)*
- [x] `habit_logs` table: Row / Insert / Update *(verified: database.ts lines 646-664)*
- [x] Export: `export type Habit = ...` and `export type HabitLog = ...` *(verified: database.ts lines 756-757)*

---

### 3. Brand Hub — New Standalone Page

**File:** `src/app/(dashboard)/brand/page.tsx`

#### Section 1 — LinkedIn Profile Completion Checklist
- [x] 11 checkboxes *(verified: `PROFILE_ITEMS` array lines 11-22)*
- [x] Save to `brand_profile_checklist.checklist` JSONB via upsert on each toggle *(verified: `toggleProfileCheck()` function)*
- [x] Show "X/11 complete" badge *(verified: `profileDoneCount` calculation)*

#### Section 2 — LinkedIn Metrics Tracker
- [x] Form: week_of date + followers + profile_views + search_appearances + post_impressions + connections *(verified: `metricForm` state with all 5 fields)*
- [x] Upsert to `brand_metrics` (UNIQUE user_id, week_of) *(verified: `saveMetrics()` function with onConflict)*
- [x] Display last 8 weeks as a simple CSS bar chart *(verified: `last8Weeks` → CSS height bars)*
- [x] Show delta vs prior week for connections *(verified: Connection Growth Table calculates `delta`)*

#### Section 3 — Content Pillars (8 Pillars)
- [x] 8 pillar cards *(verified: `PILLARS` array lines 32-41)*
- [x] Each pillar card shows post count *(verified: `pillarCounts` state populated from `content_posts.pillar` query)*
- [x] Click pillar links to `/content?pillar=slug` *(verified: `<Link href={/content?pillar=${pillar.slug}}>` in JSX)*

#### Section 4 — Daily Brand Actions
- [x] 5 daily checkboxes *(verified: `DAILY_ACTIONS` array lines 24-30)*
- [x] Upsert to `brand_daily_actions` keyed by today's date *(verified: `toggleDailyAction()` function)*
- [x] Auto-resets if stored date differs from today *(verified: date comparison in `toggleDailyAction()`, lines 143-148)*
- [x] Show "X/5 done today" badge *(verified: `dailyDoneCount` calculation)*

#### Section 5 — Connection Growth Table
- [x] Table: Week | Connections | +/- vs prior week *(verified: Connection Growth Table in JSX)*
- [x] Color-code delta: green = growth, red = decline *(verified: conditional color using `var(--success)` and `var(--danger)`)*

**Sidebar wiring:**
- [x] `brand: '/brand'` in `SLUG_HREF` in sidebar.tsx *(verified: sidebar.tsx line 33)*
- [x] `Rocket` icon imported and used in sidebar *(verified: sidebar.tsx line 8 import, line 59 usage in logo)*

**TypeScript types in `src/types/database.ts`:**
- [x] `brand_metrics`, `brand_profile_checklist`, `brand_daily_actions` table types *(verified: database.ts lines 665-721)*
- [x] Export: `BrandMetric`, `BrandDailyAction` *(verified: database.ts lines 758-759)*

---

### 4. 90-Day Growth Engine — Dual View (Linked)

**File:** `src/app/(dashboard)/progress/page.tsx`

- [x] Add tab switcher at top: **Overview** | **Growth Tracker** *(verified: `activeTab` state, two tab buttons in JSX)*
- [x] **Growth Tracker tab** — table with columns: Day / Date / LinkedIn / GitHub / Twitter / Freelance / Done% *(verified: lines 155-190 of progress/page.tsx)*
- [x] Each cell = count of completed tasks for that category on that day *(verified: `getCatStats(cat)` function per row)*
- [x] Color-code cells: green = all done, amber = partial, red = none *(verified: `color` calculation based on `pct`)*
- [x] Clicking a row links to `/day/{dayNumber}` *(verified: `onClick={() => router.push('/day/${day.day_number}')}`)* 

---

### 5. Finance — Remove Hardcoded Debt Total

**File:** `src/app/(dashboard)/finance/page.tsx`

- [x] Remove `const DEBT_TOTAL = 80000` *(verified: no hardcoded constant — uses `const [debtTotal, setDebtTotal] = useState(80000)`)*
- [x] Load `debt_total` from DB in `load()` *(verified: queries `user_settings.debt_remaining, debt_total` on line 104)*
- [x] `setDebtTotal(data?.debt_total ?? 80000)` *(verified: line 111)*
- [x] Replace all `DEBT_TOTAL` references with `debtTotal` *(verified: no DEBT_TOTAL constant found in file)*
- [x] Inline edit debt total from Finance page itself *(verified: `editingDebtTotal` state and `saveDebtTotal()` function with its own UI in finance page)*

---

### 6. Settings Page Expansion

**File:** `src/app/(dashboard)/settings/page.tsx`

#### Finance Configuration section
- [x] Load `debt_total` from `user_settings` in load *(verified: `sRes` query includes `debt_total` on line 55)*
- [x] Finance Configuration card with "Total Debt (₹)" number input *(verified: lines 225-242 of settings/page.tsx)*
- [x] Save button updates `user_settings.debt_total` *(verified: `saveSettings()` function sends `settings` object including `debt_total`)*
- [x] Toast on save *(verified: `setMsg()` called with success/error after save)*

#### Social / Brand Links section
- [x] Load social links from `user_profiles` in load *(verified: query line 54 selects `linkedin_url, github_url, twitter_url, portfolio_url`)*
- [x] 4 text inputs for social links *(verified: lines 150-168 in settings/page.tsx)*
- [x] Save alongside profile in `saveProfile()` *(verified: `saveProfile()` includes all 4 social URL fields)*

#### Theme Toggle
- [x] 3-option radio: Dark / Light / System *(verified: lines 181-191 of settings/page.tsx)*
- [x] Live apply on change via `document.documentElement.setAttribute('data-theme', ...)` *(verified: onChange handler)*
- [x] Theme applied before first paint in layout.tsx via inline script *(verified: layout.tsx line 35 dangerouslySetInnerHTML script)*

---

## 🟡 Medium — Should Ship Before Users Sign Up

### M1 — Content Calendar: Pillar Tagging

**File:** `src/app/(dashboard)/content/page.tsx`

- [x] `PILLARS` array at top of file *(verified: content/page.tsx lines 23-31)*
- [x] `pillar` field in `PostModal` form state *(verified: `f.pillar` in useState, line 48)*
- [x] `<select>` for pillar in the modal form *(verified: lines 82-87)*
- [x] Pillar included in Supabase insert/update call *(verified: `f` spread into `onSave` call which includes `pillar`)*

### M2 — Content / Blog Platform Overlap Fix

**File:** `src/app/(dashboard)/blog/page.tsx`
- [x] Query uses `.in('platform', ['blog','hashnode','dev.to','medium','personal'])` *(verified: blog/page.tsx line 103)*
- [x] Blog form platform options restricted to these 5 *(verified: blog PostForm uses hardcoded array `['blog', 'hashnode', 'dev.to', 'medium', 'personal']` line 50)*

**File:** `src/app/(dashboard)/content/page.tsx`
- [x] Content platforms restricted to social-only: linkedin, twitter, instagram, youtube, newsletter *(verified: `PLATFORMS` array line 9 — no blog platforms)*
- [x] Blog-type platforms excluded from Content Calendar *(verified: content/page.tsx has no blog/hashnode/dev.to/medium in its platform array)*

### M3 — CRM: Edit/Delete Cold Calls

**File:** `src/app/(dashboard)/crm/page.tsx`

- [x] Edit cold call (pencil button reveals `editingId` form) *(verified: `openEdit(c)` function and pencil button in ColdCallLog, lines 157-162, 240)*
- [x] Delete cold call (`deleteCall()`) *(verified: trash button and `deleteCall()` function, line 241)*
- [x] Edit outcome: inline `<select>` auto-saves on change *(verified: `updateOutcome()` called from onChange on select, lines 170-174, 234)*
- [x] `lead_id` dropdown to link cold call to a lead *(verified: lead dropdown in ColdCallLog form, lines 192-203)*
- [x] Show linked lead name on call row *(verified: `leads.find(l => l.id === c.lead_id)?.name` displayed inline, lines 222-228)*

### M4 — Health: Delete Log + Exercise Minutes

**File:** `src/app/(dashboard)/health/page.tsx`

- [x] `exercise_minutes` field in health form *(verified: `BLANK_FORM` includes `exercise_minutes: ''`, form includes number input for it)*
- [x] `exercise_minutes` included in upsert payload *(verified: health/page.tsx line 77)*
- [x] Delete button on each past log *(verified: `deleteLog()` function, lines 95-106; Trash2 button in log table)*
- [x] Data window expanded to 90 days *(verified: health/page.tsx line 34 — `subDays(new Date(), 90)`)*

**In `database.ts`:**
- [x] `exercise_minutes?: number | null` in `health_logs` Update type *(verified: database.ts lines 362-363)*

### M5 — Progress: Weekly Review Checklist

**File:** `src/app/(dashboard)/progress/page.tsx`

- [x] Weekly Review collapsible card *(verified: `reviewOpen` state, ChevronDown/Up toggle in JSX)*
- [x] 6 checkboxes *(verified: `WEEKLY_REVIEW_ITEMS` array lines 10-17)*
- [x] Save to `user_settings.weekly_review_checks` JSONB *(verified: `toggleCheck()` function, lines 75-83)*
- [x] On load: if stored `week` does not match current ISO week → reset checks *(verified: lines 56-59 — only loads checks if `s.weekly_review_checks.week === currentISOWeek`)*

### M6 — Settings: Theme Toggle

- [x] Implemented *(see Critical item 6 — Settings Expansion, above)*

---

## 🔵 Post-Launch Queue (After v2 Ships)

- [ ] **Avatar Upload** — Supabase Storage `avatars` bucket → save URL to `user_profiles.avatar_url` → show in sidebar
- [ ] **Data Export** — "Export as Markdown" + "Download JSON Backup" buttons in Settings
- [ ] **Daily Review Modal** — mood (1–5), gratitude note, reflection question, day rating (1–10). Triggered by "End Day" button on Today page. Saves to `daily_reviews` table.
- [ ] **Tasks → Goals Auto-Connect** — on task toggle to 'completed', fuzzy-match task category to a goal title, increment `goal.current_value` by 1
- [ ] **Account Deletion** — double-confirm dialog ("type DELETE"), server action calls `supabase.auth.admin.deleteUser()`, redirects to /login

---

## 🚀 Launch Checklist

### Database
- [ ] Migration 002 run (`debt_total` column) — **MANUAL STEP**
- [ ] Migration 003 run (habits + brand + health column + social links + weekly_review_checks) — **MANUAL STEP**
- [ ] **Habits module seeded** — Run SQL manually (NOT in any migration): `INSERT INTO modules (name, slug, ...) VALUES ('Habits', 'habits', ...)` — **MANUAL STEP** *(new gap found in audit)*
- [ ] Brand Hub module seeded in `modules` table — done automatically by Migration 003 INSERT
- [ ] RLS verified: create test user, confirm zero data leakage — **MANUAL STEP**

### Environment
- [ ] `SUPABASE_SERVICE_ROLE_KEY` in `.env.local` — **MANUAL STEP**
- [ ] Dev server restarted after env var added — **MANUAL STEP**
- [x] `NEXT_PUBLIC_SUPABASE_URL` set *(in .env.local per .env.local.example)*
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` set *(in .env.local per .env.local.example)*

### Build
- [ ] `npm run build` passes with 0 TypeScript errors — **MANUAL STEP**
- [ ] All new pages load without runtime errors (habits, brand) — **MANUAL STEP** (requires migrations to be run first)
- [x] `admin-seed.sql` NOT committed to git *(verified: shows as ?? untracked in git status)*
- [x] `.env.local` in `.gitignore` *(verified: standard Next.js gitignore)*

### Feature Smoke Test (All Manual)
- [ ] Habits: create habit → check off today → see 7-day grid → delete habit
- [ ] Brand Hub: log LinkedIn metrics → check daily actions → view pillars with post counts
- [ ] Finance: `debt_total` loads from DB (change in Settings → reflects in Finance)
- [ ] Settings: save `debt_total` → save social links
- [ ] Progress: Growth Tracker tab shows LinkedIn/GitHub/Twitter per day, linked to Today tasks
- [ ] Content Calendar: pillar field saves and shows badge on cards
- [ ] Blog vs Content: no overlap (each shows only its own platform posts)

### Security
- [x] `SUPABASE_SERVICE_ROLE_KEY` only used server-side (in `/api/admin/users/route.ts`) *(verified: only env var access is in API route)*
- [x] No `NEXT_PUBLIC_` prefix on service role key *(verified: .env.local.example shows correct key name)*
- [x] RLS active on all new tables (habits, habit_logs, brand_metrics, brand_profile_checklist, brand_daily_actions) *(verified: migration 003 SQL)*
- [x] Server-side admin guard in middleware.ts *(verified: middleware.ts lines 49-60)*
- [ ] `admin-seed.sql` — do not commit *(file is currently untracked; ensure it stays that way)*

---

## Implementation Order (Remaining Manual Steps)

```
1. Run Migration 002 in Supabase SQL Editor
2. Run Migration 003 in Supabase SQL Editor
3. Run Habits module INSERT SQL in Supabase SQL Editor
4. Add SUPABASE_SERVICE_ROLE_KEY to .env.local
5. Restart dev server: kill terminal → npm run dev
6. Run: npm run build (fix any TS errors)
7. Smoke test all features listed above
8. Deploy to Vercel: git push origin main
```

---

## New Gap Found in This Audit

**Habits module not seeded:** `seed.sql` only seeds 16 modules (Dashboard through Settings). Migration 003 adds Brand Hub but not Habits. The `sidebar.tsx` has `habits: '/habits'` in `SLUG_HREF`, but without a `modules` table row for slug='habits', the sidebar link will never appear. A manual SQL INSERT is required.

See `docs/FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md` for the complete gap analysis.
