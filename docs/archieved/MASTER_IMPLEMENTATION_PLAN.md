# Life OS — Master Implementation Plan
### For AI Agents: Complete, Line-by-Line Execution Guide

**Repository:** `d:\Mine\My projects\MyProjects\MyHelpingHand`  
**Live App:** https://my-helping-hand.vercel.app  
**Supabase Project:** `etwxjgpqlinikoiudnha`  
**Stack:** Next.js 16 (App Router) · TypeScript · Supabase (PostgreSQL + Auth + RLS) · Vercel  
**Generated:** June 30, 2026

---

## SECTION 0 — DOCUMENT INTELLIGENCE MAP

Before implementing anything, read this section. Each source document covers a different slice of truth.

| Document | Location | What It Tells You | Use When |
|----------|----------|------------------|----------|
| `walkthroughof helping hand` | `/walkthroughof helping hand` | v1 architecture — Zustand stores, sync hooks, chart sources. THE SOURCE OF TRUTH for v1 data that needs to be reimported. | Understanding what v1 had that v2 might be missing |
| `developer_growth_engine.md` | `/developer_growth_engine.md` | Prajjawal's personal 90-day plan, exact daily posts, timetable blocks, goals, blog post ideas. The REAL DATA that belongs in the app. | Populating the app with actual user data |
| `GAPS_AND_IMPROVEMENTS.md` | `/docs/GAPS_AND_IMPROVEMENTS.md` | Honest audit of every bug, UX gap, missing feature in v2.0. Priority tagged (🔴🟠🟡🟢). | Deciding what to fix and in what order |
| `V1_VS_V2_USER_CHANGES.md` | `/docs/V1_VS_V2_USER_CHANGES.md` | User-facing view of everything that changed between v1 and v2. Good for understanding what users expect. | Writing onboarding text and empty states |
| `LIFE_OS_USER_GUIDE.md` | `/docs/LIFE_OS_USER_GUIDE.md` | Complete v2 user guide — every page, every field, every workflow. Canonical page-by-page spec. | Understanding what each page should do |
| `life-os-complete-gap-fix.md` | `C:\Users\Prajjawal Singh\.commandcode\plans\life-os-complete-gap-fix.md` | A previous AI's implementation plan — 4 phases, file list, DB migrations, new features. STARTING POINT for execution. | Cross-reference with GAPS doc for completeness |
| `VERSION_CHANGELOG.md` | `/docs/VERSION_CHANGELOG.md` | Technical v1→v2 comparison. Admin vs user workflow. All DB tables, enums. | Architectural reference |

---

## SECTION 1 — CURRENT APP STATE (What Works vs What's Broken)

### Working ✅
- Login/Signup with Supabase Auth (`/login`, `/signup`)
- Middleware auth protection on all dashboard routes
- Dashboard with heatmap, streak, week view (requires imported cycle)
- Today / Day view — task completion, skip, postpone, edit, delete, copy content
- Calendar — monthly grid with completion colors
- Progress — stats, heatmap, weekly breakdown, category breakdown
- Timetable — Plan A/B/C with CRUD blocks + daily check-in
- Goals — CRUD with 4 types (life/annual/quarterly/monthly) + progress bars
- Health — daily log form with upsert, 14-day history table
- Finance — income/expense CRUD + debt countdown (hardcoded ₹80,000)
- CRM — lead pipeline (6 stages) + cold call log
- Content Calendar — week view + list view + CRUD
- Blog — status-based CRUD
- Learning — CRUD with lesson progress bars
- Freelance — CRUD with budget tracking
- Rentlyf — daily hours log grouped by week
- Settings — profile, preferences, password change, sign out
- Admin Panel — user list, module toggles (client-side role check — see Bug #3)
- Prompt/Import — 3-step with start date override (date recalculation added June 30)

### Broken / Missing ❌
(Sorted by priority — fix in this order)

| # | Issue | Severity | File |
|---|-------|----------|------|
| B1 | No "+ Add Task" button on Today/Day view | 🔴 Critical | `today/page.tsx` |
| B2 | Debt total hardcoded ₹80,000 in source | 🔴 Critical | `finance/page.tsx` |
| B3 | Admin panel auth is client-side JS redirect only | 🔴 Critical | `admin/page.tsx`, `middleware.ts` |
| B4 | No "Forgot Password" link on login page | 🔴 Critical | `login/page.tsx` |
| B5 | Daily reminder setting is stored but does nothing | 🔴 Critical | `settings/page.tsx` |
| B6 | Health page only loads last 30 days of data | 🔴 Critical | `health/page.tsx` |
| B7 | Goal un-toggle always resets to `in_progress` regardless of prior status | 🔴 Critical | `goals/page.tsx` |
| B8 | Sidebar always 240px, no collapse on desktop | 🟠 High | `sidebar.tsx`, `layout.tsx` |
| B9 | No success toast after any save action | 🟠 High | App-wide |
| B10 | Dashboard Finance + Health cards show placeholder ₹0 / — | 🟠 High | `page.tsx` (dashboard) |
| B11 | Admin page emails show "unknown" if service role key missing | 🟠 High | `admin/page.tsx` |
| B12 | Sidebar breaks on mobile (hardcoded ml-[240px]) | 🟠 High | `layout.tsx` |

---

## SECTION 2 — IMPLEMENTATION PHASES

Phases are ordered by dependency. A later phase MUST NOT be implemented before the earlier phase is complete.

---

## PHASE 0 — CRITICAL BUG FIXES
*Do these first. Each is a one-file fix. No DB changes.*

### P0.1 — Fix Goal Un-Toggle Bug
**File:** `src/app/(dashboard)/goals/page.tsx`

**Problem:** The toggle icon calls something like `updateGoal({ status: current === 'completed' ? 'in_progress' : 'completed' })` — always going to `in_progress`. But a `not_started` goal would incorrectly become `in_progress`.

**Fix:** Track prior status before completing. In the goal card, store previous status and restore it on uncheck.

```typescript
// Find the toggle handler. Replace the ternary:
// BEFORE:
status: g.status === 'completed' ? 'in_progress' : 'completed'

// AFTER:
status: g.status === 'completed'
  ? (g._prev_status ?? 'in_progress')
  : 'completed'
```

Because there's no `_prev_status` column, use the simpler fix: when unchecking `completed`, check if `target_value` is null → set `not_started`, else `in_progress`.

```typescript
const prevStatus = (g.target_value || g.current_value)
  ? 'in_progress'
  : 'not_started'

const newStatus = g.status === 'completed' ? prevStatus : 'completed'
```

---

### P0.2 — Remove Non-Functional Daily Reminder Field
**File:** `src/app/(dashboard)/settings/page.tsx`

**Problem:** Daily reminder time picker is stored to DB but never used. Confusing to users.

**Action:** Either:
- (Option A — Simple) Remove the `daily_reminder_time` input entirely, or
- (Option B — Keep but disable) Add a notice: `"⚠️ Push notifications coming soon. This is saved for future use."`

Choose Option B — keep the field, add a `<p>` tag immediately below the time input:
```tsx
<p className="text-xs mt-1" style={{ color: 'var(--text-muted)' }}>
  Push notifications not yet active — your time preference is saved for a future update.
</p>
```

---

### P0.3 — Fix Health Page 30-Day Limit
**File:** `src/app/(dashboard)/health/page.tsx`

**Problem:** Query uses `gte('date', subDays(new Date(), 30))` — only 30 days visible.

**Fix:** Change query window to 90 days (matches a full cycle), and add a "Load earlier" button that fetches the next 90-day window.

```typescript
// Change:
.gte('date', subDays(new Date(), 30).toISOString().split('T')[0])

// To:
.gte('date', subDays(new Date(), 90).toISOString().split('T')[0])
```

And add a `loadMore` button that queries another 90-day chunk before the earliest loaded date.

---

### P0.4 — Add "Forgot Password" to Login
**File:** `src/app/(auth)/login/page.tsx`

**Add:** Below the password field, add a "Forgot password?" link. On click, show a small inline form: email input + "Send reset email" button.

```typescript
// State additions:
const [showForgot, setShowForgot] = useState(false)
const [resetEmail, setResetEmail] = useState('')
const [resetSent, setResetSent] = useState(false)

// Handler:
const sendReset = async () => {
  const supabase = createClient()
  await supabase.auth.resetPasswordForEmail(resetEmail, {
    redirectTo: `${window.location.origin}/auth/callback?type=recovery`
  })
  setResetSent(true)
}
```

**Auth callback route needed:** Create `src/app/auth/callback/route.ts`:
```typescript
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const type = requestUrl.searchParams.get('type')

  if (code) {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(c => cookieStore.set(c)) } }
    )
    await supabase.auth.exchangeCodeForSession(code)
  }

  if (type === 'recovery') {
    return NextResponse.redirect(new URL('/settings', request.url))
  }
  return NextResponse.redirect(new URL('/', request.url))
}
```

---

### P0.5 — Fix Admin Panel Server-Side Auth
**File:** `src/app/(dashboard)/admin/page.tsx` + `middleware.ts`

**Problem:** The admin page's role check is a client-side `router.push('/')` — a determined user could bypass it.

**Fix 1 — Middleware:** Add server-side admin guard in `middleware.ts`:
```typescript
// In the matcher logic, after confirming user exists:
if (request.nextUrl.pathname.startsWith('/admin')) {
  const supabase = createServerClient(...)
  const { data: profile } = await supabase
    .from('user_profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  if (profile?.role !== 'super_admin') {
    return NextResponse.redirect(new URL('/', request.url))
  }
}
```

**Fix 2 — Admin emails:** Create `src/server/admin.ts` as a server action:
```typescript
'use server'
import { createClient as createAdmin } from '@supabase/supabase-js'

export async function adminListUsers() {
  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  const { data } = await admin.auth.admin.listUsers()
  return data?.users ?? []
}
```

Add to `.env.local`:
```
SUPABASE_SERVICE_ROLE_KEY=<get from Supabase Dashboard → Settings → API → service_role key>
```
Add to Vercel environment variables as well (NON-public, do not prefix with NEXT_PUBLIC_).

---

### P0.6 — Fix Debt Hardcode
**File:** `src/app/(dashboard)/finance/page.tsx`

**Problem:** `const DEBT_TOTAL = 80000` is a constant in the file.

**Fix:** Move to `user_settings` table.

**Step 1 — SQL migration** (run in Supabase SQL Editor):
```sql
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS debt_total DECIMAL(12,2) DEFAULT 80000;
-- Migrate existing: set debt_total to 80000 for all existing rows
UPDATE user_settings SET debt_total = 80000 WHERE debt_total IS NULL;
```

**Step 2 — Finance page** — in the `loadData` function, read `debt_total` from `user_settings`:
```typescript
const { data: settingsData } = await supabase
  .from('user_settings')
  .select('debt_remaining, debt_total')
  .eq('user_id', user.id)
  .single()
const debtTotal = settingsData?.debt_total ?? 80000
const debtRemaining = settingsData?.debt_remaining ?? debtTotal
```

**Step 3 — Finance page** — add a "Set Debt Total" form in the Debt Countdown section:
```tsx
<button onClick={() => setEditingDebt(true)} className="btn-ghost text-xs">Edit total</button>
// When editing:
<input type="number" value={debtTotal} onChange={...} />
<button onClick={() => saveDebtTotal(newTotal)} className="btn-primary text-xs">Save</button>
```
Save handler: `supabase.from('user_settings').update({ debt_total: newTotal }).eq('user_id', user.id)`

---

### P0.7 — Add Toast Notification System (App-Wide)
**New file:** `src/components/ui/toast.tsx`

Create a lightweight toast component and context. This is needed for P0 through P3 to give users feedback on save actions.

```typescript
// src/components/ui/toast.tsx
'use client'
import { createContext, useContext, useState, useCallback } from 'react'

type Toast = { id: string; message: string; type: 'success' | 'error' | 'info' }
type ToastCtx = { show: (message: string, type?: Toast['type']) => void }

const ToastContext = createContext<ToastCtx>({ show: () => {} })

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const show = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = Date.now().toString()
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3000)
  }, [])

  return (
    <ToastContext.Provider value={{ show }}>
      {children}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-[9999]">
        {toasts.map(t => (
          <div key={t.id} className="px-4 py-3 rounded-xl text-sm font-medium shadow-lg animate-fade-in"
            style={{
              background: t.type === 'success' ? 'var(--success)' : t.type === 'error' ? 'var(--danger)' : 'var(--accent)',
              color: '#fff'
            }}>
            {t.type === 'success' ? '✓ ' : t.type === 'error' ? '✗ ' : 'ℹ '}{t.message}
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  )
}

export const useToast = () => useContext(ToastContext)
```

**Wire up in layout:** `src/app/(dashboard)/layout.tsx` — wrap children with `<ToastProvider>`.

**Usage in any page:**
```typescript
const { show } = useToast()
// After save:
show('Health log saved')
// After error:
show('Failed to save', 'error')
```

Add this call after every successful save/create/update/delete across ALL pages.

---

## PHASE 1 — DATABASE MIGRATION

Run this SQL in Supabase SQL Editor before touching any frontend code in Phase 2+.

**File to create:** `supabase/migrations/002_life_os_enhancements.sql`

```sql
-- ================================================================
-- Life OS v2 — Enhancement Migration 002
-- Run in Supabase SQL Editor
-- ================================================================

-- 1. user_settings: Add debt_total column (for P0.6)
ALTER TABLE user_settings ADD COLUMN IF NOT EXISTS debt_total DECIMAL(12,2) DEFAULT 80000;
UPDATE user_settings SET debt_total = 80000 WHERE debt_total IS NULL;

-- 2. New table: daily_reviews (for end-of-day reflection)
CREATE TABLE IF NOT EXISTS daily_reviews (
  id          UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id     UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  date        DATE NOT NULL,
  mood        SMALLINT CHECK (mood BETWEEN 1 AND 5),
  gratitude   TEXT,
  reflection  TEXT,
  day_rating  SMALLINT CHECK (day_rating BETWEEN 1 AND 10),
  wins        TEXT,
  created_at  TIMESTAMPTZ DEFAULT NOW(),
  updated_at  TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (user_id, date)
);
ALTER TABLE daily_reviews ENABLE ROW LEVEL SECURITY;
CREATE POLICY "reviews_own" ON daily_reviews FOR ALL USING (user_id = auth.uid());

-- 3. New table: habits
CREATE TABLE IF NOT EXISTS habits (
  id              UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id         UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name            TEXT NOT NULL,
  icon            TEXT DEFAULT '⭐',
  color           TEXT DEFAULT '#6C5CE7',
  category        TEXT DEFAULT 'personal',
  frequency       TEXT DEFAULT 'daily' CHECK (frequency IN ('daily', 'weekdays', 'weekends', 'custom')),
  times_per_week  SMALLINT DEFAULT 7,
  is_active       BOOLEAN DEFAULT TRUE,
  sort_order      INTEGER DEFAULT 0,
  created_at      TIMESTAMPTZ DEFAULT NOW()
);
ALTER TABLE habits ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habits_own" ON habits FOR ALL USING (user_id = auth.uid());

-- 4. New table: habit_logs
CREATE TABLE IF NOT EXISTS habit_logs (
  id         UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id    UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  habit_id   UUID NOT NULL REFERENCES habits(id) ON DELETE CASCADE,
  date       DATE NOT NULL,
  completed  BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE (habit_id, date)
);
ALTER TABLE habit_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "habit_logs_own" ON habit_logs FOR ALL USING (user_id = auth.uid());

-- 5. health_logs: Add exercise_minutes column
ALTER TABLE health_logs ADD COLUMN IF NOT EXISTS exercise_minutes INTEGER DEFAULT 0;

-- 6. learning_resources: Add minutes_studied column
ALTER TABLE learning_resources ADD COLUMN IF NOT EXISTS minutes_studied INTEGER DEFAULT 0;

-- 7. Ensure UNIQUE constraint on rentlyf_logs (user_id, date)
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_constraint WHERE conname = 'rentlyf_logs_user_date_unique'
  ) THEN
    ALTER TABLE rentlyf_logs ADD CONSTRAINT rentlyf_logs_user_date_unique UNIQUE (user_id, date);
  END IF;
END $$;

-- 8. Add 'habits' to modules table if not present
INSERT INTO modules (name, slug, icon, is_default, sort_order)
VALUES ('Habits', 'habits', 'CheckSquare', true, 17)
ON CONFLICT (slug) DO NOTHING;

-- Add user_module_settings for habits for ALL existing users
INSERT INTO user_module_settings (user_id, module_id, is_enabled)
SELECT u.id, m.id, true
FROM auth.users u
CROSS JOIN modules m
WHERE m.slug = 'habits'
ON CONFLICT (user_id, module_id) DO NOTHING;

-- 9. Supabase Storage: 'avatars' bucket
INSERT INTO storage.buckets (id, name, public)
VALUES ('avatars', 'avatars', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY IF NOT EXISTS "avatars_public_read" ON storage.objects
  FOR SELECT USING (bucket_id = 'avatars');

CREATE POLICY IF NOT EXISTS "avatars_user_upload" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "avatars_user_update" ON storage.objects
  FOR UPDATE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

CREATE POLICY IF NOT EXISTS "avatars_user_delete" ON storage.objects
  FOR DELETE USING (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Done
DO $$ BEGIN
  RAISE NOTICE '✅ Migration 002 complete';
END $$;
```

---

## PHASE 2 — MODULE IMPROVEMENTS

### P2.1 — Add "+ Quick Task" Button to Today/Day View

**Files:** 
- `src/app/(dashboard)/today/page.tsx`
- Create `src/components/today/add-task-form.tsx`

**`add-task-form.tsx`:**
```typescript
'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, X } from 'lucide-react'

const CATEGORIES = ['linkedin','github','twitter','freelance','portfolio','blog','rentlyf','learning','networking','health','personal']

export function AddTaskForm({ dayId, userId, onAdded }: {
  dayId: string
  userId: string
  onAdded: () => void
}) {
  const [open, setOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [category, setCategory] = useState('personal')
  const [content, setContent] = useState('')
  const [saving, setSaving] = useState(false)

  const save = async () => {
    if (!title.trim()) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('tasks').insert({
      day_id: dayId,
      user_id: userId,
      title: title.trim(),
      category,
      content: content.trim() || null,
      status: 'pending',
      sort_order: 999,
    })
    setTitle(''); setContent(''); setCategory('personal')
    setOpen(false)
    setSaving(false)
    onAdded()
  }

  if (!open) return (
    <button onClick={() => setOpen(true)} className="flex items-center gap-2 btn-ghost text-sm w-full mt-2">
      <Plus size={14} /> Quick Add Task
    </button>
  )

  return (
    <div className="card mt-2 space-y-3">
      <div className="flex items-center justify-between">
        <span className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Add Task</span>
        <button onClick={() => setOpen(false)}><X size={14} style={{ color: 'var(--text-muted)' }} /></button>
      </div>
      <input className="input w-full text-sm" placeholder="Task title" value={title} onChange={e => setTitle(e.target.value)} />
      <select className="input w-full text-sm" value={category} onChange={e => setCategory(e.target.value)}>
        {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
      </select>
      <textarea className="input w-full text-sm resize-none" rows={3} placeholder="Content / notes (optional)" value={content} onChange={e => setContent(e.target.value)} />
      <div className="flex gap-2">
        <button onClick={save} disabled={saving || !title.trim()} className="btn-primary text-sm">
          {saving ? 'Adding…' : 'Add Task'}
        </button>
        <button onClick={() => setOpen(false)} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}
```

**In `today/page.tsx`:** Import `AddTaskForm`. After the task list (before the Rentlyf hours section), render:
```tsx
<AddTaskForm dayId={day.id} userId={user.id} onAdded={reloadDay} />
```
Where `reloadDay` is a function that re-fetches the day's tasks (call existing `loadDay()` or `refresh()`).

---

### P2.2 — Fix Health Page to Load 90 Days + Month Selector

**File:** `src/app/(dashboard)/health/page.tsx`

**Changes:**
1. Change the date window from 30 days to 90 days:
```typescript
// Replace subDays(new Date(), 30) with:
const windowStart = subDays(new Date(), 90)
```

2. Add a "Load Earlier" button below the table:
```tsx
const [windowEnd, setWindowEnd] = useState(new Date())
const [windowStart, setWindowStart] = useState(subDays(new Date(), 90))

const loadEarlier = () => {
  const newEnd = subDays(windowStart, 1)
  const newStart = subDays(newEnd, 90)
  setWindowStart(newStart)
  setWindowEnd(newEnd)
  // re-query with new window
}
```

3. Show the total count: "Showing X logs (last 90 days)"

---

### P2.3 — Fix Dashboard Finance + Health Cards

**File:** `src/app/(dashboard)/page.tsx`

In the dashboard `loadData()` function, add these queries in parallel:

```typescript
// Add to Promise.all or parallel fetches:
const [, , financeRes, healthRes] = await Promise.all([
  // ... existing cycle + days queries
  supabase.from('finance_entries')
    .select('type, amount')
    .eq('user_id', user.id)
    .gte('date', new Date(new Date().getFullYear(), new Date().getMonth(), 1).toISOString().split('T')[0]),
  supabase.from('health_logs')
    .select('date, exercise_done, mood, sleep_hours')
    .eq('user_id', user.id)
    .gte('date', subDays(new Date(), 7).toISOString().split('T')[0])
])

const monthIncome = (financeRes.data ?? []).filter(e => e.type === 'income').reduce((s, e) => s + e.amount, 0)
const weekExerciseDays = (healthRes.data ?? []).filter(e => e.exercise_done).length
const avgMood = healthRes.data?.length
  ? ((healthRes.data.reduce((s, e) => s + (e.mood ?? 0), 0)) / healthRes.data.length).toFixed(1)
  : null
```

Then replace the placeholder Finance card content with:
```tsx
<div>₹{monthIncome.toLocaleString('en-IN')}</div>
<div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>This month income</div>
```

And Health card:
```tsx
<div>{weekExerciseDays}/7 days</div>
<div style={{ color: 'var(--text-muted)', fontSize: '11px' }}>Exercise this week{avgMood ? ` · Mood ${avgMood}/5` : ''}</div>
```

---

### P2.4 — Finance: Add Spending Breakdown Chart

**File:** `src/app/(dashboard)/finance/page.tsx`

Below the entry list, add a "Spending Breakdown" section. Install Recharts if not already installed (it should be from the Rentlyf dashboard work):

```bash
npm install recharts
```

```typescript
// Group expenses by category:
const expenseByCategory = entries
  .filter(e => e.type === 'expense')
  .reduce((acc, e) => {
    acc[e.category] = (acc[e.category] ?? 0) + e.amount
    return acc
  }, {} as Record<string, number>)

const pieData = Object.entries(expenseByCategory)
  .sort((a, b) => b[1] - a[1])
  .map(([name, value]) => ({ name, value }))
```

Render a `PieChart` from recharts inside a `<div className="card">`:
```tsx
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts'

const COLORS = ['#6C5CE7','#00B894','#FDCB6E','#E17055','#74B9FF','#A29BFE','#FD79A8','#55EFC4']

<ResponsiveContainer width="100%" height={260}>
  <PieChart>
    <Pie data={pieData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} dataKey="value" nameKey="name">
      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
    </Pie>
    <Tooltip formatter={(v: number) => `₹${v.toLocaleString('en-IN')}`} />
    <Legend />
  </PieChart>
</ResponsiveContainer>
```

---

### P2.5 — Blog/Content Platform Separation

**File:** `src/app/(dashboard)/blog/page.tsx`

Add a `.in()` filter so blog page only shows blog-platform posts:
```typescript
.in('platform', ['blog', 'hashnode', 'dev.to', 'medium', 'personal'])
```

**File:** `src/app/(dashboard)/content/page.tsx`

Add a `.not()` filter to exclude blog platforms:
```typescript
.not('platform', 'in', '("blog","hashnode","dev.to","medium","personal")')
```

---

### P2.6 — CRM: Edit/Delete for Cold Calls

**File:** `src/app/(dashboard)/crm/page.tsx`

In the cold calls list, for each call row add hover-reveal edit (pencil) and delete (trash) buttons:

```tsx
// Per call row, add:
<div className="flex gap-2 opacity-0 group-hover:opacity-100">
  <button onClick={() => startEditCall(call)} style={{ color: 'var(--text-muted)' }}>
    <Pencil size={12} />
  </button>
  <button onClick={() => deleteCall(call.id)} style={{ color: 'var(--danger)' }}>
    <Trash2 size={12} />
  </button>
</div>

// Delete handler:
const deleteCall = async (id: string) => {
  if (!confirm('Delete this call log?')) return
  const supabase = createClient()
  await supabase.from('cold_calls').delete().eq('id', id)
  setCalls(calls.filter(c => c.id !== id))
}
```

---

### P2.7 — Rentlyf: Add Delete Button Per Entry

**File:** `src/app/(dashboard)/rentlyf/page.tsx`

For each log entry row, add a trash icon button:
```tsx
<button onClick={() => deleteLog(log.id)} className="opacity-0 group-hover:opacity-100 ml-2"
  style={{ color: 'var(--danger)' }}>
  <Trash2 size={12} />
</button>

const deleteLog = async (id: string) => {
  if (!confirm('Delete this log entry?')) return
  const supabase = createClient()
  await supabase.from('rentlyf_logs').delete().eq('id', id)
  setLogs(logs.filter(l => l.id !== id))
  show('Log deleted')
}
```

---

### P2.8 — Learning: Add Minutes Studied

**File:** `src/app/(dashboard)/learning/page.tsx`

In the resource form, add:
```tsx
<div>
  <label className="label">Minutes Studied</label>
  <input type="number" min={0} step={5} className="input w-full text-sm"
    placeholder="e.g. 60"
    value={form.minutes_studied ?? 0}
    onChange={e => setForm({...form, minutes_studied: parseInt(e.target.value) || 0})} />
</div>
```

In the resource card, show:
```tsx
{r.minutes_studied > 0 && (
  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
    ⏱ {Math.floor(r.minutes_studied / 60)}h {r.minutes_studied % 60}m studied
  </span>
)}
```

Below the "Currently Learning" section, show total study time:
```tsx
const totalMinutes = resources.reduce((s, r) => s + (r.minutes_studied ?? 0), 0)
const totalHours = Math.floor(totalMinutes / 60)
const remainingMins = totalMinutes % 60
// Render: "Total study time: 12h 30m"
```

---

## PHASE 3 — NEW FEATURES

### P3.1 — Habits Module (NEW PAGE)

**SQL:** Already in Phase 1 migration (habits + habit_logs tables).

**Files to create:**
- `src/app/(dashboard)/habits/page.tsx` — main page (client component)
- `src/components/habits/habit-card.tsx`
- `src/components/habits/habit-form.tsx`

**Sidebar:** In `src/components/layout/sidebar.tsx`, add `habits: '/habits'` to the `SLUG_HREF` map.

**`habits/page.tsx` structure:**

```typescript
'use client'
// State: habits[], todayLogs{}, showForm, editingHabit, loading
// On load: fetch habits + today's habit_logs
// UI sections:
//   1. Header: "🔁 Habits" + count + "+ New Habit" button
//   2. Today's Check-In: one card per active habit with big checkmark button
//   3. Habit cards with streak display and edit/delete
//   4. HabitForm (inline, shown when showForm=true)
```

**`habit-card.tsx`:**
```typescript
// Props: habit, streak, completedToday, onToggle, onEdit, onDelete
// Shows: emoji, name, category badge, streak ("🔥 N days"), 
//   edit/delete icons on hover, circular progress of week completion
```

**Streak calculation:**
```typescript
const calculateStreak = async (habitId: string): Promise<number> => {
  const supabase = createClient()
  const { data } = await supabase
    .from('habit_logs')
    .select('date, completed')
    .eq('habit_id', habitId)
    .eq('completed', true)
    .order('date', { ascending: false })
    .limit(90)

  let streak = 0
  let current = new Date()
  for (const log of (data ?? [])) {
    const logDate = new Date(log.date)
    const diffDays = Math.floor((current.getTime() - logDate.getTime()) / 86400000)
    if (diffDays <= 1) { streak++; current = logDate }
    else break
  }
  return streak
}
```

**Today check-in:**
```typescript
const toggleHabit = async (habitId: string, currentlyDone: boolean) => {
  const supabase = createClient()
  const today = new Date().toISOString().split('T')[0]
  await supabase.from('habit_logs').upsert({
    user_id: user.id, habit_id: habitId, date: today, completed: !currentlyDone
  }, { onConflict: 'habit_id,date' })
  setTodayLogs(prev => ({ ...prev, [habitId]: !currentlyDone }))
}
```

**Weekly grid display per habit:**
```typescript
// 7 small squares for Mon–Sun current week
// Green = completed, Grey = not done, future = lighter grey
// Uses habit_logs data
```

---

### P3.2 — Daily Review Modal

**Files:**
- `src/components/today/daily-review-modal.tsx` — modal component
- Modify `src/app/(dashboard)/today/page.tsx` — add trigger

**Trigger condition:** Show an "📝 End Day Review" button at the bottom of the today page, always visible. When clicked, opens the modal. Also auto-prompt when all tasks are completed (show a small banner: "All tasks done! 🎉 Write your daily review?").

**`daily-review-modal.tsx`:**
```typescript
// Props: date, dayNumber, onClose
// State: mood(1-5), gratitude(''), reflection(''), dayRating(7), wins('')
// UI:
//   Mood: 5 emoji buttons (😞 😕 😐 🙂 😄)
//   Gratitude: "3 things I'm grateful for today" textarea
//   Reflection: "What would I do differently?" textarea  
//   Wins: "What went well?" textarea
//   Day Rating: slider 1-10
//   Save: upsert to daily_reviews table
```

```typescript
const saveReview = async () => {
  const supabase = createClient()
  const today = date // passed as prop
  await supabase.from('daily_reviews').upsert({
    user_id: user.id, date: today,
    mood, gratitude, reflection, day_rating: dayRating, wins
  }, { onConflict: 'user_id,date' })
  onClose()
  show('Daily review saved ✓')
}
```

---

### P3.3 — Dashboard: Show Today's Theme

**File:** `src/app/(dashboard)/page.tsx`

In the "Today Summary Card", below the day number, add the day's theme from `days.theme`:
```tsx
{day?.theme && (
  <p className="text-xs font-medium mt-1" style={{ color: 'var(--text-muted)' }}>
    Today's theme: {day.theme}
  </p>
)}
```

---

### P3.4 — Add Responsive Sidebar (Mobile)

**File:** `src/components/layout/sidebar.tsx` + `src/app/(dashboard)/layout.tsx`

**Desktop:** Add collapse toggle button (← arrow) at the top-right of the sidebar. When collapsed, sidebar shrinks to 52px showing only icons. Uses localStorage to persist preference.

```typescript
// State:
const [collapsed, setCollapsed] = useState(() => {
  if (typeof window !== 'undefined') return localStorage.getItem('sidebar_collapsed') === 'true'
  return false
})

const toggle = () => {
  const next = !collapsed
  setCollapsed(next)
  localStorage.setItem('sidebar_collapsed', String(next))
}
```

```tsx
// Sidebar div:
<div style={{ width: collapsed ? '52px' : '240px', transition: 'width 0.2s ease' }}>
  {/* Collapse button */}
  <button onClick={toggle} style={{ position: 'absolute', top: 16, right: 8 }}>
    {collapsed ? '→' : '←'}
  </button>
  {/* Links: show only icon when collapsed */}
  {links.map(link => (
    <Link href={link.href}>
      <Icon />
      {!collapsed && <span>{link.label}</span>}
    </Link>
  ))}
</div>
```

**Mobile (< 768px):** Hamburger menu. Add `isMobileOpen` state. On small screens, sidebar renders as a full-height overlay panel that slides in from the left.

**Layout.tsx:** Replace `ml-[240px]` with:
```tsx
<main style={{ marginLeft: collapsed ? '52px' : '240px', transition: 'margin-left 0.2s ease' }}>
```
Since `collapsed` is in the sidebar component (client-side), use a CSS variable or a shared context to communicate the current width to layout.

Simplest approach: Pass `collapsed` state up via a callback prop, store in layout's parent state, use it for `ml-[*]`.

---

### P3.5 — Mobile-Responsive Tables

**Files:** All table-heavy pages: `admin/page.tsx`, `health/page.tsx`, `finance/page.tsx`, `crm/page.tsx`

For each wide table, add:
```css
/* In globals.css or inline: */
@media (max-width: 768px) {
  .responsive-table thead { display: none; }
  .responsive-table tr { display: block; margin-bottom: 12px; border-radius: 8px; }
  .responsive-table td { display: flex; justify-content: space-between; padding: 6px 12px; }
  .responsive-table td::before { content: attr(data-label); font-weight: 600; color: var(--text-muted); }
}
```

Add `data-label="Date"`, `data-label="Amount"` etc. to each `<td>`. Add `className="responsive-table"` to each `<table>`.

---

## PHASE 4 — SETTINGS ENHANCEMENTS

### P4.1 — Avatar Upload

**File:** `src/app/(dashboard)/settings/page.tsx`

Add at top of Profile section:
```tsx
<div className="flex items-center gap-4 mb-4">
  <div className="h-16 w-16 rounded-full overflow-hidden" style={{ background: 'var(--surface)', border: '2px solid var(--border)' }}>
    {profile?.avatar_url
      ? <img src={profile.avatar_url} alt="Avatar" className="w-full h-full object-cover" />
      : <div className="w-full h-full flex items-center justify-center text-2xl">{profile?.display_name?.[0]?.toUpperCase() ?? '?'}</div>
    }
  </div>
  <div>
    <label className="btn-ghost text-sm cursor-pointer">
      Upload Photo
      <input type="file" accept="image/*" className="hidden" onChange={handleAvatarUpload} />
    </label>
    {profile?.avatar_url && <button onClick={removeAvatar} className="block text-xs mt-1" style={{ color: 'var(--danger)' }}>Remove</button>}
  </div>
</div>
```

```typescript
const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0]
  if (!file) return
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const path = `${user.id}/${Date.now()}.${file.name.split('.').pop()}`
  const { error } = await supabase.storage.from('avatars').upload(path, file, { upsert: true })
  if (error) { show('Upload failed', 'error'); return }

  const { data: { publicUrl } } = supabase.storage.from('avatars').getPublicUrl(path)
  await supabase.from('user_profiles').update({ avatar_url: publicUrl }).eq('id', user.id)
  setProfile(prev => prev ? { ...prev, avatar_url: publicUrl } : prev)
  show('Avatar updated')
}
```

---

### P4.2 — Data Export

**File:** `src/app/(dashboard)/settings/page.tsx`

Add a "Data" section at the bottom of the settings page:

```tsx
<div className="card space-y-3">
  <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Export My Data</h3>
  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Download everything you've stored in Life OS.</p>
  <div className="flex gap-3">
    <button onClick={exportJSON} className="btn-ghost text-sm">📦 Download JSON</button>
  </div>
</div>
```

```typescript
const exportJSON = async () => {
  const supabase = createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  const [goals, health, finance, tasks, habits] = await Promise.all([
    supabase.from('goals').select('*').eq('user_id', user.id),
    supabase.from('health_logs').select('*').eq('user_id', user.id),
    supabase.from('finance_entries').select('*').eq('user_id', user.id),
    supabase.from('tasks').select('*').eq('user_id', user.id),
    supabase.from('habits').select('*').eq('user_id', user.id),
  ])

  const exportData = {
    exported_at: new Date().toISOString(),
    goals: goals.data,
    health_logs: health.data,
    finance_entries: finance.data,
    tasks: tasks.data,
    habits: habits.data,
  }

  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = `life-os-export-${new Date().toISOString().split('T')[0]}.json`
  a.click()
  URL.revokeObjectURL(url)
}
```

---

### P4.3 — Delete Account

**File:** `src/app/(dashboard)/settings/page.tsx`

Add at the very bottom (Danger Zone section):
```tsx
<div className="card" style={{ border: '1px solid rgba(255,107,107,0.3)' }}>
  <h3 className="text-sm font-semibold mb-1" style={{ color: 'var(--danger)' }}>Danger Zone</h3>
  <p className="text-xs mb-3" style={{ color: 'var(--text-muted)' }}>
    Permanently delete your account and all data. This cannot be undone.
  </p>
  <button onClick={deleteAccount} className="text-sm px-4 py-2 rounded-lg"
    style={{ background: 'rgba(255,107,107,0.15)', color: 'var(--danger)', border: '1px solid var(--danger)' }}>
    Delete My Account
  </button>
</div>
```

```typescript
const deleteAccount = async () => {
  const confirmed = confirm('Are you sure? Type DELETE to confirm.')
  if (!confirmed) return
  const word = prompt('Type DELETE to confirm account deletion:')
  if (word !== 'DELETE') return

  // Call server action (needs service role key)
  const response = await fetch('/api/delete-account', { method: 'DELETE' })
  if (response.ok) {
    router.push('/login')
  }
}
```

Create `src/app/api/delete-account/route.ts`:
```typescript
import { createClient as createAdmin } from '@supabase/supabase-js'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function DELETE() {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll: () => cookieStore.getAll(), setAll: (cs) => cs.forEach(c => cookieStore.set(c)) } }
  )
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const admin = createAdmin(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  )
  await admin.auth.admin.deleteUser(user.id)
  return NextResponse.json({ success: true })
}
```

---

## PHASE 5 — ONBOARDING (New User First-Visit)

### P5.1 — Welcome Modal for New Users

**Trigger:** On first login, if the user has no active cycle AND no completed goals (genuinely fresh).

**File:** `src/app/(dashboard)/page.tsx` — add state and modal component.

```typescript
// Check if first visit:
const isFirstVisit = !cycle && goals.length === 0 && healthLogs.length === 0

// Show welcome modal if first visit:
const [showOnboarding, setShowOnboarding] = useState(false)
useEffect(() => {
  if (isFirstVisit) setShowOnboarding(true)
}, [isFirstVisit])
```

**`src/components/onboarding/welcome-modal.tsx`:**
```tsx
// 3-step modal:
// Step 1: "Welcome to Life OS" — brief explanation of what the app is
// Step 2: "Your first step is to import a 90-day plan" — go to /prompt
// Step 3: "While that generates, you can set up: Goals, Timetable, Settings"
// CTA: "Let's Start" → goes to /prompt

// Modal stores "seen" in localStorage so it never shows again:
localStorage.setItem('life_os_onboarding_done', 'true')
```

---

## SECTION 3 — DATA TO IMPORT FROM `developer_growth_engine.md`

The `developer_growth_engine.md` file is Prajjawal's personal strategy document. The following data from it should be imported into the app. Run `supabase/seed-my-data.sql` (already created) for goals and blog posts. Additionally:

### Timetable Blocks (Plan A — From Chapter 5)

These exact blocks should be in Plan A via the Timetable page or SQL:

```sql
UPDATE timetable_plans
SET blocks = '[
  {"id":"a1","emoji":"🌅","name":"Wake & Prep","activity":"Morning routine, check messages","time":"12:00–12:30 PM","duration":"30 min","fixed":true},
  {"id":"a2","emoji":"📱","name":"Networking","activity":"LinkedIn: comment on 5-10 posts, accept connections, reply to DMs","time":"12:30–1:30 PM","duration":"1 hr","fixed":false},
  {"id":"a3","emoji":"💻","name":"Coding Block 1","activity":"Rentlyf: Dashboard / Testing / Backend","time":"1:30–4:30 PM","duration":"3 hrs","fixed":false},
  {"id":"a4","emoji":"☕","name":"Break","activity":"Snack, walk, recharge","time":"4:30–5:00 PM","duration":"30 min","fixed":true},
  {"id":"a5","emoji":"💻","name":"Coding Block 2","activity":"Rentlyf: Continue coding or bug fixes","time":"5:00–7:00 PM","duration":"2 hrs","fixed":false},
  {"id":"a6","emoji":"🍽️","name":"Dinner","activity":"Break","time":"7:00–8:00 PM","duration":"1 hr","fixed":true},
  {"id":"a7","emoji":"✍️","name":"Content Creation","activity":"Write today LinkedIn post + prepare GitHub commit","time":"8:00–9:30 PM","duration":"1.5 hrs","fixed":false},
  {"id":"a8","emoji":"📤","name":"Posting & Engagement","activity":"Post on LinkedIn/Twitter, reply to comments","time":"9:30–10:00 PM","duration":"30 min","fixed":false},
  {"id":"a9","emoji":"🌐","name":"Freelancing","activity":"Build client websites / update gigs / send proposals","time":"10:00 PM–1:00 AM","duration":"3 hrs","fixed":false},
  {"id":"a10","emoji":"📚","name":"Learning & Future","activity":"Portfolio rebuild, learn Three.js, marketing research","time":"1:00–3:00 AM","duration":"2 hrs","fixed":false},
  {"id":"a11","emoji":"💻","name":"Light Coding","activity":"Planning for next day or light coding","time":"3:00–4:00 AM","duration":"1 hr","fixed":false},
  {"id":"a12","emoji":"📝","name":"Daily Wrap","activity":"Update bug sheet, tomorrows tasks, Discord check","time":"4:00–4:30 AM","duration":"30 min","fixed":false},
  {"id":"a13","emoji":"🛌","name":"Wind Down","activity":"Sleep by 5 AM","time":"4:30 AM","duration":"—","fixed":true}
]'::JSONB
WHERE user_id = (SELECT id FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com')
  AND plan_type = 'A';
```

Plan B and C blocks follow the same structure — derive from Chapter 5 in `developer_growth_engine.md`.

---

## SECTION 4 — COMPLETE FILE CHANGE MANIFEST

Every file that needs to be created or modified. Ordered by phase.

### Phase 0 (Critical Bugs)

| File | Action | What Changes |
|------|--------|--------------|
| `src/app/(dashboard)/goals/page.tsx` | MODIFY | Fix goal un-toggle to restore `not_started` vs `in_progress` correctly |
| `src/app/(dashboard)/settings/page.tsx` | MODIFY | Add disclaimer below daily_reminder_time input |
| `src/app/(dashboard)/health/page.tsx` | MODIFY | Extend query window from 30 to 90 days; add load-more |
| `src/app/(auth)/login/page.tsx` | MODIFY | Add "Forgot password?" toggle + inline reset form |
| `src/app/auth/callback/route.ts` | CREATE | Handle Supabase auth callbacks (password reset redirect) |
| `src/app/(dashboard)/admin/page.tsx` | MODIFY | Call server action for user list; remove client-side role redirect |
| `src/server/admin.ts` | CREATE | Server action using service role key for `auth.admin.listUsers()` |
| `middleware.ts` | MODIFY | Add server-side role check for `/admin` route |
| `src/app/(dashboard)/finance/page.tsx` | MODIFY | Read `debt_total` from DB; add "Edit total" form |
| `src/components/ui/toast.tsx` | CREATE | ToastProvider + useToast hook |
| `src/app/(dashboard)/layout.tsx` | MODIFY | Wrap children in ToastProvider |
| `.env.local` | MODIFY | Add `SUPABASE_SERVICE_ROLE_KEY=...` (never commit) |
| Vercel Settings | ACTION | Add `SUPABASE_SERVICE_ROLE_KEY` as non-public env var |

### Phase 1 (DB Migration)

| File | Action | What Changes |
|------|--------|--------------|
| `supabase/migrations/002_life_os_enhancements.sql` | CREATE | New tables: daily_reviews, habits, habit_logs. New columns: debt_total, exercise_minutes, minutes_studied. avatars storage bucket. |

### Phase 2 (Module Improvements)

| File | Action | What Changes |
|------|--------|--------------|
| `src/components/today/add-task-form.tsx` | CREATE | Inline form to add task to any day |
| `src/app/(dashboard)/today/page.tsx` | MODIFY | Render AddTaskForm component |
| `src/app/(dashboard)/page.tsx` | MODIFY | Wire up Finance + Health stats in dashboard cards; add day theme display |
| `src/app/(dashboard)/finance/page.tsx` | MODIFY | Add spending breakdown pie chart (Recharts) |
| `src/app/(dashboard)/blog/page.tsx` | MODIFY | Filter to blog platforms only |
| `src/app/(dashboard)/content/page.tsx` | MODIFY | Exclude blog platforms |
| `src/app/(dashboard)/crm/page.tsx` | MODIFY | Add edit/delete for cold calls |
| `src/app/(dashboard)/rentlyf/page.tsx` | MODIFY | Add delete per log entry; add total hours display |
| `src/app/(dashboard)/learning/page.tsx` | MODIFY | Add minutes_studied field and total display |

### Phase 3 (New Features)

| File | Action | What Changes |
|------|--------|--------------|
| `src/app/(dashboard)/habits/page.tsx` | CREATE | Full habits page with check-in, streaks, weekly grid |
| `src/components/habits/habit-card.tsx` | CREATE | Habit card with streak + weekly grid |
| `src/components/habits/habit-form.tsx` | CREATE | Add/edit habit form |
| `src/components/today/daily-review-modal.tsx` | CREATE | End-of-day mood/reflection modal |
| `src/app/(dashboard)/today/page.tsx` | MODIFY | Add "End Day Review" button + completion auto-prompt |
| `src/components/layout/sidebar.tsx` | MODIFY | Add `habits` to SLUG_HREF map; add collapse toggle |
| `src/app/(dashboard)/layout.tsx` | MODIFY | Responsive sidebar: mobile hamburger + desktop collapse |

### Phase 4 (Settings + Polish)

| File | Action | What Changes |
|------|--------|--------------|
| `src/app/(dashboard)/settings/page.tsx` | MODIFY | Add avatar upload, data export, account deletion |
| `src/app/api/delete-account/route.ts` | CREATE | API route for account deletion using service role |
| All page files | MODIFY | Add `useToast()` show() call after every successful save/delete |

### Phase 5 (Onboarding)

| File | Action | What Changes |
|------|--------|--------------|
| `src/components/onboarding/welcome-modal.tsx` | CREATE | 3-step first-visit welcome modal |
| `src/app/(dashboard)/page.tsx` | MODIFY | Show welcome modal on first visit detection |

---

## SECTION 5 — GLOBAL CSS ADDITIONS

Add to `src/app/globals.css` (or wherever the CSS lives):

```css
/* Fade-in animation for toasts */
@keyframes fade-in {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
.animate-fade-in { animation: fade-in 0.2s ease; }

/* Sidebar transition */
.sidebar { transition: width 0.2s ease; }

/* Responsive tables on mobile */
@media (max-width: 768px) {
  .responsive-table thead { display: none; }
  .responsive-table tr { display: block; margin-bottom: 12px; background: var(--surface); border-radius: 12px; padding: 8px; }
  .responsive-table td { display: flex; justify-content: space-between; align-items: center; padding: 6px 12px; font-size: 13px; }
  .responsive-table td::before { content: attr(data-label); font-weight: 600; color: var(--text-muted); }
}

/* Mobile sidebar overlay */
.sidebar-overlay {
  position: fixed; inset: 0; background: rgba(0,0,0,0.5); z-index: 40;
  display: none;
}
@media (max-width: 768px) {
  .sidebar-overlay { display: block; }
  .sidebar-mobile { position: fixed; left: 0; top: 0; bottom: 0; z-index: 50; transform: translateX(-100%); transition: transform 0.25s ease; }
  .sidebar-mobile.open { transform: translateX(0); }
  main { margin-left: 0 !important; }
}
```

---

## SECTION 6 — IMPLEMENTATION ORDER (Day-by-Day Suggestion)

**Day 1:**
- P0.7 (Toast system) — needed by everything else
- P0.1 (Goal toggle fix) — 5-min fix
- P0.2 (Daily reminder note) — 2-min fix
- P0.5 (Admin server-side guard + middleware) + server action

**Day 2:**
- Phase 1 SQL migration (run in Supabase)
- P0.6 (Debt total from DB)
- P0.4 (Forgot password + auth callback route)
- P0.3 (Health 90-day window)

**Day 3:**
- P2.1 (Add Task button — most impactful missing feature)
- P2.3 (Dashboard Finance + Health real stats)
- P2.5 (Blog/Content platform separation)
- Add toast calls to Health, Goals, Finance, Blog pages

**Day 4:**
- P2.4 (Finance spending chart)
- P2.6 (CRM cold call edit/delete)
- P2.7 (Rentlyf delete)
- P2.8 (Learning minutes)

**Day 5:**
- P3.1 (Habits page — the most complex new feature)

**Day 6:**
- P3.2 (Daily review modal)
- P3.3 (Dashboard theme display)
- P3.4 (Sidebar collapse — desktop only)
- P3.5 (Mobile-responsive tables)

**Day 7:**
- P4.1 (Avatar upload)
- P4.2 (Data export)
- P4.3 (Delete account)
- P5.1 (Onboarding modal)

**Day 8:**
- Full test pass of all phases
- Run `npx tsc --noEmit` — zero errors expected
- Git push → Vercel deploy
- Update Timetable blocks with real Plan A/B/C data from `developer_growth_engine.md`

---

## SECTION 7 — VERIFICATION CHECKLIST

Before shipping, verify each item manually in the browser at `localhost:3000`:

**Phase 0:**
- [ ] Completing and un-completing a `not_started` goal returns to `not_started` (not `in_progress`)
- [ ] Settings page shows disclaimer under daily reminder input
- [ ] Health page shows 90+ days of logs
- [ ] Login page has "Forgot password?" that sends email
- [ ] Navigating to `/admin` as a regular user redirects to `/` (test in incognito, not as admin)
- [ ] Admin page shows real emails (requires service role key)
- [ ] Finance page shows editable debt total input
- [ ] Toast appears for 3s then disappears after any save

**Phase 2:**
- [ ] On `/today`, "+ Quick Task" button opens a form, adds task, refreshes list
- [ ] Dashboard Finance card shows real this-month income
- [ ] Dashboard Health card shows exercise days this week
- [ ] Finance page shows spending pie chart grouped by category
- [ ] Blog page does NOT show LinkedIn/Twitter posts
- [ ] Content page does NOT show blog/hashnode posts
- [ ] CRM cold call rows have edit/delete icons on hover

**Phase 3:**
- [ ] `/habits` page loads, sidebar shows "Habits" link
- [ ] Can add a habit, check it off today, see streak increment
- [ ] "End Day Review" button on today page opens modal, saves to DB
- [ ] Dashboard shows `day.theme` below day number when cycle is active

**Phase 4:**
- [ ] Avatar upload works, image appears in sidebar and settings
- [ ] "Download JSON" button downloads a valid `.json` file with user data
- [ ] Delete account: double-confirm → account deleted → redirect to login

**Phase 5:**
- [ ] New user sees welcome modal on first login
- [ ] Modal never shows again after clicking "Let's Start"
- [ ] Existing users with data never see the modal

---

## SECTION 8 — DO NOT DO LIST

These are things that look tempting but should NOT be done:

1. **Do NOT add a theme toggle in Phase 4** — `user_settings.theme` exists but is not wired to CSS. Adding a broken theme toggle is worse than no toggle. Leave for a dedicated CSS-variables theme overhaul later.

2. **Do NOT implement push notifications** for daily reminders — it requires a service worker, VAPID keys, a cron job, and Supabase Edge Functions. Way out of scope. Keep the note in settings UI (P0.2).

3. **Do NOT add a WeeklyReview page yet** — it's in the wishlist but needs design work. The daily review modal (P3.2) covers the most important daily reflection.

4. **Do NOT add a Net Worth Tracker** — scope creep. Finance page needs its own improvements first.

5. **Do NOT change the database schema for tasks** beyond what's in Phase 1. Adding `recurring_tasks` requires significant logic changes across the daily task generation, today page, and cycle import flow.

6. **Do NOT add `<Database>` generic to Supabase clients** — the current pattern `createBrowserClient()` without the generic works and TypeScript passes. Adding it requires updating the full `database.ts` type file to match every table. Skip unless specifically tasked.

7. **Do NOT delete the `walkthroughof helping hand` file** — it's a v1 architecture audit. Historical reference.

---

*This plan covers 30+ files, 5 phases, and all critical bugs identified in `GAPS_AND_IMPROVEMENTS.md`. Implement in order. Do not skip the DB migration (Phase 1) before Phase 2+. Each phase is independently deployable — commit and push after each phase completion.*
