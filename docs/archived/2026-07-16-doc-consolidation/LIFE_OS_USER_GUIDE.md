# Life OS — Complete User Guide
**Version:** 2.1  
**App Name:** MyHelpingHand (Life OS)  
**Author:** Prajjawal Singh  
**Last Updated:** July 8, 2026  
**Repository:** https://github.com/PrajjawalSingh1997/MyHelpingHand  
**Live URL:** https://my-helping-hand.vercel.app

---

## Table of Contents

1. [What is Life OS?](#1-what-is-life-os)
2. [Architecture Overview](#2-architecture-overview)
3. [Getting Started — Account & First Login](#3-getting-started--account--first-login)
4. [Dashboard (Home)](#4-dashboard-home)
5. [Today View & Day View](#5-today-view--day-view)
6. [Prompt & Import (AI Plan Generator)](#6-prompt--import-ai-plan-generator)
7. [Calendar](#7-calendar)
8. [Progress](#8-progress)
9. [Timetable](#9-timetable)
10. [Goals](#10-goals)
11. [Health Tracker](#11-health-tracker)
12. [Finance Tracker](#12-finance-tracker)
13. [CRM — Lead & Cold Call Manager](#13-crm--lead--cold-call-manager)
14. [Content Calendar](#14-content-calendar)
15. [Blog & Content Manager](#15-blog--content-manager)
16. [Learning Hub](#16-learning-hub)
17. [Freelance Project Manager](#17-freelance-project-manager)
18. [Rentlyf Time Logger](#18-rentlyf-time-logger)
19. [Settings](#19-settings)
20. [Admin Panel (Super Admin Only)](#20-admin-panel-super-admin-only)
21. [Complete Workflow Reference](#21-complete-workflow-reference)
22. [Data Model & Database Reference](#22-data-model--database-reference)
23. [Security & Row Level Security](#23-security--row-level-security)
24. [Troubleshooting & FAQ](#24-troubleshooting--faq)
25. [Habits Tracker](#25-habits-tracker) *(v2.1)*
26. [Brand Hub](#26-brand-hub) *(v2.1)*

---

## 1. What is Life OS?

Life OS (also called **MyHelpingHand**) is a personal operating system built for ambitious individuals who want to run their lives with the same discipline and clarity as a well-run business. It is a full-stack SaaS web application that gives you:

- A **90-day structured framework** for tracking daily tasks, plans, and cycles
- **Health, Finance, CRM, Content, Learning, and Freelance** modules — a complete life management system
- **AI-assisted planning** via a structured prompt and JSON import flow
- **Cloud-first data** — your data is stored in a PostgreSQL database (Supabase), never in your browser. Accessible from any device, any browser, anywhere.
- **Multi-user capable** with a super admin layer for user and module management

### Core Philosophy

The app is built around a **90-day cycle model**. Every 90 days, you define your goals, generate a day-by-day plan using AI, import it, and then live it — checking off tasks, logging health, tracking finances, managing leads, and building your presence — all within one unified system.

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14 (App Router), TypeScript, Vanilla CSS |
| Backend | Supabase (PostgreSQL + Auth + Row Level Security) |
| Auth | Supabase Auth (email/password, HTTP-only session cookies) |
| Hosting | Vercel (serverless, auto-deploy from GitHub) |
| State | Server components + Supabase client queries (no Zustand in v2) |

---

## 2. Architecture Overview

```
Browser (Client)
  └── Next.js App Router
        ├── middleware.ts          ← Session check on every request
        ├── /login, /signup        ← Public auth pages
        └── / (dashboard)         ← All protected pages
              ├── layout.tsx       ← Sidebar + TopBar (server component)
              └── [module pages]   ← Client components, each fetching from Supabase

Vercel (Edge/Serverless)
  └── Next.js server functions

Supabase (Backend)
  ├── auth.users                  ← User accounts
  ├── PostgreSQL (18 tables)      ← All user data
  ├── Row Level Security          ← Data isolation (users see ONLY their own data)
  └── DB Trigger: on_auth_user_created
        └── Auto-creates: user_profiles, user_settings, user_module_settings (all 16 modules), 3 timetable plan shells
```

### Authentication Flow

Every request goes through `middleware.ts`:

1. Middleware calls `supabase.auth.getUser()` using the session cookie.
2. **No session + not on `/login` or `/signup`** → redirect to `/login`.
3. **Has session + on `/login` or `/signup`** → redirect to `/` (dashboard).
4. Otherwise → let request through, refresh session cookie.

---

## 3. Getting Started — Account & First Login

### 3.1 Signing Up (New User)

**URL:** `/signup`

1. Navigate to `https://my-helping-hand.vercel.app`.
2. Since you have no session, middleware redirects you to `/login`.
3. Click **"Sign up"** at the bottom of the login card.
4. Fill in:
   - **Email** — your email address
   - **Display Name** — your name (will appear in sidebar and top bar)
   - **Password** — minimum 8 characters
5. Click **"Create Account"**.

**What happens behind the scenes:**
- `supabase.auth.signUp()` is called.
- Supabase creates a row in `auth.users`.
- A database trigger (`on_auth_user_created`) fires automatically and creates:
  - `user_profiles` row → `display_name` set to your name, `role` = `user`
  - `user_settings` row → defaults: `theme='dark'`, `timezone='Asia/Kolkata'`, `week_start='monday'`
  - `user_module_settings` → 16 rows, one per module, all `is_enabled = true`
  - `timetable_plans` → 3 shell records (Plan A, B, C) with pre-filled blocks from the schema default
- You are automatically signed in and redirected to `/` (dashboard).

> **Important:** Until you import a 90-day plan via `/prompt`, the Dashboard, Today, Calendar, and Progress pages will show an **empty state** ("No Active 90-Day Cycle"). Modules like Goals, Health, Finance, CRM, Blog, Learning, Freelance, and Rentlyf are **immediately usable** without a cycle.

---

### 3.2 Logging In (Returning User)

**URL:** `/login`

1. Enter your email and password.
2. Click the eye icon to toggle password visibility.
3. Click **"Sign In"**.
4. On success, you are redirected to `/` (dashboard).

**Error handling:** If credentials are invalid, Supabase returns an error message shown below the password field.

---

### 3.3 What You See After First Login (No Cycle)

| Page | What You See |
|------|-------------|
| Dashboard `/` | "✨ No Active 90-Day Cycle" → button to go to `/prompt` |
| Today `/today` | Same empty state |
| Calendar `/calendar` | Same empty state |
| Progress `/progress` | Same empty state |
| Day View `/day/1` | "This day doesn't exist in your cycle yet" |
| Timetable `/timetable` | Plan A/B/C shells with pre-filled blocks (from schema defaults) — usable immediately |
| Goals `/goals` | Empty list — usable immediately (no cycle needed) |
| Health `/health` | Empty log — usable immediately |
| Finance `/finance` | Empty entries — usable immediately |
| CRM `/crm` | Empty pipeline — usable immediately |
| Blog `/blog` | Empty posts — usable immediately |
| Content `/content` | Empty calendar — usable immediately |
| Learning `/learning` | Empty resources — usable immediately |
| Freelance `/freelance` | Empty projects — usable immediately |
| Rentlyf `/rentlyf` | Empty logs — usable immediately |
| Settings `/settings` | Shows profile and preferences — fully functional |
| Prompt & Import `/prompt` | Full 3-step AI import flow — **start here** |

**The First Step:** Go to `/prompt` → import your 90-day plan → every other page comes alive.

---

## 4. Dashboard (Home)

**URL:** `/` (after login)  
**Requires:** An active 90-day cycle (imported via `/prompt`)

The dashboard is your **mission control** — a bird's-eye view of your entire cycle.

### 4.1 Components

#### Today Summary Card
- **Day number** and date displayed prominently (e.g., "Day 12 — Thursday, July 4")
- **Plan type badge** (Plan A / B / C) shown as a colored badge
- **Task progress** — "X/Y tasks done"
- **Circular progress ring** showing today's completion percentage
- "View Full Day" link → navigates to `/today`
- **Progress bar** at the bottom of the card

#### Quick Stats (4 cards)
| Card | Data Source | Description |
|------|-------------|-------------|
| 🔥 Streak | DB task completions | How many consecutive past days had ≥50% tasks completed |
| 📈 Cycle Progress | DB cycle + current day | "X/90 days elapsed" |
| 💰 Finance | Placeholder | Click to go to `/finance` |
| ❤️ Health | Placeholder | Click to go to `/health` |

#### This Week (Mini Calendar)
- Shows the 7 days of the current week
- Each day cell has:
  - Day abbreviation (Mon, Tue…)
  - Day number in the cycle
  - **Colored dot:** green (≥80% complete), amber (50–79%), red (<50%), grey (future)
- Clicking any day navigates to `/day/[dayNumber]`

#### Quick Access (4 shortcuts)
- 💪 Health Log → `/health`
- 💰 Finance → `/finance`
- 📞 CRM → `/crm`
- ✨ Import Plan → `/prompt`

#### 90-Day Heatmap
- A row of 90 thin bars (7px wide each), one per day
- Color code:
  - **Green** — ≥80% completed
  - **Amber** — 50–79% completed
  - **Red** — <50% but some work done
  - **Grey** — no tasks recorded or future day
- Hover shows tooltip: "Day X: Y%"
- Clicking any bar navigates to `/day/[dayNumber]`
- Empty bars fill in for days not yet created in the DB

### 4.2 Streak Calculation Logic
```
1. Take all past days, sorted most-recent-first.
2. For each day (skipping future days):
   - Count completed tasks / total tasks.
   - If ratio ≥ 50% → streak++
   - If ratio < 50% OR no tasks → break the streak
3. Return the streak count.
```

---

## 5. Today View & Day View

**URLs:** `/today` (always current day), `/day/[dayNumber]` (any specific day)  
**Requires:** An active 90-day cycle

Both pages show the same `TodayContent` component — they differ only in which day number is displayed. `/today` automatically detects the current day from the cycle's start date.

### 5.1 Page Header
- **DAY [N]** in large bold text
- Full date (e.g., "Thursday, July 4, 2026")
- Plan type badge (A/B/C with different colors: blue/orange/green)
- "X/Y completed" counter
- **Large circular progress ring** (percentage)

### 5.2 Task List

Tasks are grouped by **category**. Categories and their colors:

| Category | Emoji | Color |
|----------|-------|-------|
| LinkedIn | 📝 | Blue |
| GitHub | 🐙 | Grey |
| Twitter/X | 🐦 | Cyan |
| Freelancing | 💼 | Amber |
| Portfolio | 🎨 | Pink |
| Blog | ✍️ | Purple |
| Rentlyf | 🏠 | Green |
| Learning | 📚 | Indigo |
| Networking | 📱 | Teal |
| Health | 💪 | Rose |
| Personal | 🌱 | Lime |

Each task shows:
- **Checkbox** (click to toggle between pending and completed)
- Task **title** (struck through when completed)
- **[Skipped]** badge if skipped
- **Notes** in amber (if any)
- **Content preview** (first 200 characters) with **Copy button** (copies full content to clipboard)

#### Task Action Buttons (hover to reveal)
These appear on hover in the top-right of each task:

| Button | Icon | Action |
|--------|------|--------|
| ✏️ Edit | Pencil | Opens inline edit form for title + content |
| 🗑️ Delete | Trash | Deletes task (with confirmation dialog) |
| → Postpone | Arrow | Opens postpone input — enter a day number (1-90), click Move |
| ⏭️ Skip | Skip Forward | Marks task as `skipped` |

#### Inline Edit Form
When editing a task:
1. Click the pencil icon on any task.
2. Edit **Task Title** field.
3. Edit **Content / Notes** textarea (character count shown).
4. Click **Save** → updates in DB; click **Cancel** to abort.

#### Postpone Workflow
1. Click the arrow (→) icon on a task.
2. A yellow panel appears: "Postpone to day: [input]"
3. Enter any day number between 1 and 90 (cannot be the current day).
4. Click **Move** → the task is deleted from the current day and added as a new `pending` task on the target day.

### 5.3 Rentlyf Hours
- Below the task list, a numeric input: "🏠 Rentlyf Hours Today"
- Enter hours worked on the Rentlyf platform (0 to 12, step 0.5)
- Automatically saved to `days.rentlyf_hours` on change

### 5.4 Daily Notes
- A 3-row textarea: "📝 Daily Notes"
- Free-form text for anything about the day
- Auto-saved to `days.notes` in the DB on change

### 5.5 Day Navigation
- **← Day N-1** link at bottom-left (hidden on Day 1)
- **Day N+1 →** link at bottom-right (hidden on Day 90)

---

## 6. Prompt & Import (AI Plan Generator)

**URL:** `/prompt`  
**Purpose:** Generate your entire 90-day plan using AI and import it into the app

This is the **most important page** when first setting up Life OS. It uses a 3-step wizard.

### 6.1 Step 1 — Fill & Copy the Prompt Template

The app provides a structured prompt template. You need to fill in:
- **[YOUR NAME]** — your name
- **[START DATE]** — e.g., `2026-07-05`
- **[YOUR MAIN GOAL]** — e.g., "Get my first 5 freelance clients"
- **[BRIEF DESCRIPTION]** — your current situation
- **[OBJECTIVE 1, 2, 3]** — your 3 main objectives for this cycle

The prompt instructs the AI to generate a JSON object with:
- A `cycle` object (title, start_date, end_date, goal)
- A `days` array with 90 entries, each containing:
  - `day_number`, `date`, `plan_type` (A/B/C), `theme`, `notes`
  - A `tasks` array (6–10 tasks per day), each with `title`, `category`, `platform`, `content`, `sort_order`

**Click "Copy Prompt Template"** → paste into ChatGPT 4, Claude, or Gemini.

### 6.2 Step 2 — Get JSON from AI

Instructions in the app:
1. Paste the filled prompt into your AI of choice.
2. Wait for the AI to generate all 90 days (you should see `"day_number": 90` at the end of the JSON).
3. Copy the **entire JSON response** (with or without the markdown code fences — the app strips them automatically).

Click **"Next: Import"** to proceed.

### 6.3 Step 3 — Paste & Import

1. **Cycle Start Date** — you can override the AI's start date. All 90 day dates are recalculated from this date automatically.
2. **Paste your JSON** into the large textarea.
3. Click **"Import 90-Day Plan"**.

> ⚠️ **Warning:** Importing a new plan **deactivates your current active cycle**. All task data from the old cycle stays in the database but is no longer shown.

**Import Process (behind the scenes):**
```
1. Parse JSON (strip ```json fences if present)
2. Validate: must have `cycle` object and `days` array
3. Recalculate all dates from chosen start date
4. UPDATE ninety_day_cycles SET is_active=false WHERE user_id = $userId
5. INSERT INTO ninety_day_cycles → get new cycle ID
6. For each batch of 10 days:
   a. INSERT INTO days (cycle_id, user_id, day_number, date, plan_type, theme, notes)
   b. INSERT INTO tasks for each day's tasks
7. On success → redirect to dashboard after 2 seconds
```

On success: "🎉 90-Day Plan Imported! Redirecting to your dashboard..."

**Error handling:**
- Invalid JSON → shows error below textarea
- Missing `cycle` or `days` fields → shows specific error
- Database errors → shows Supabase error message

---

## 7. Calendar

**URL:** `/calendar`  
**Requires:** An active 90-day cycle

A full **monthly calendar view** of your 90-day cycle.

### 7.1 Features
- **Month navigation** — Previous/Next month buttons
- **Day cells** with:
  - Day number in the cycle (if it falls in this month)
  - **Completion dot color:** green (≥80%), amber (50–79%), red (<50%), grey (future/no data)
- **Upcoming Days** list below the calendar — shows next few days with their day numbers and themes

### 7.2 Navigation
- Clicking any day in the calendar navigates to `/day/[dayNumber]`
- Today is highlighted with an accent color outline

---

## 8. Progress

**URL:** `/progress`  
**Requires:** An active 90-day cycle

A comprehensive analytics view of your performance over the 90-day cycle.

### 8.1 Summary Cards (4 cards)
| Card | Description |
|------|-------------|
| 🔥 Streak | Consecutive days with ≥50% task completion |
| ✅ Completed | Total completed tasks across all past days |
| ⏭️ Skipped | Total skipped tasks |
| ⏱️ Pending | Total pending + postponed tasks |

### 8.2 Overall Completion Rate
- Large percentage number with a gradient progress bar
- Shows: "X completed out of Y total tasks in Z days"

### 8.3 90-Day Heatmap
- Square grid view (20×20px per square) with 90 + empty squares
- Same color logic as Dashboard heatmap
- Today's square has a 2px accent outline
- Legend: green=≥80%, amber=50–79%, red=<50%

### 8.4 Weekly Breakdown (Last 4 Weeks)
- Bar charts showing completion % per week
- "Week N: X done / Y total (Z%)" for each week

### 8.5 Category Breakdown
- For each task category, shows:
  - Category name (left-aligned, 96px wide)
  - Progress bar (flex-1)
  - "X/Y" count (right-aligned)
- Sorted by total tasks (most active categories first)
- Shows top 8 categories

### 8.6 Last 14 Days Detail
- Row for each of the last 14 days
- Day label (D12), date (Thu, Jul 4), progress bar, "X/Y" count
- Color-coded bars: green (≥80%), amber (50–79%), red (<50%)

---

## 9. Timetable

**URL:** `/timetable`

A daily schedule manager with 3 plan templates and a check-in system.

### 9.1 The 3 Plans

| Plan | Name | Focus |
|------|------|-------|
| **A** | Standard Day | Balanced: morning ritual, deep work, exercise, content, learning |
| **B** | Heavy Work Day | Maximum output: 10.5 hours of work blocks, minimal overhead |
| **C** | Business Dev Day | Sales-focused: cold calls, proposals, client work, networking |

Default Plan A blocks (pre-filled by signup trigger):
- 🌅 5:00–5:30 AM — Wake & Refresh (fixed)
- 🧘 5:30–6:30 AM — Morning Ritual (fixed)
- 🍳 6:30–7:00 AM — Breakfast (fixed)
- 🏋️ 7:00–9:00 AM — Exercise (editable)
- 💻 9:00–1:00 PM — Deep Work Block (editable)
- 🍽️ 1:00–2:00 PM — Lunch & Rest (fixed)
- ⚡ 2:00–5:00 PM — Afternoon Work (editable)
- 🚶 5:00–6:00 PM — Walk & Reset (fixed)
- 📱 6:00–8:00 PM — Content & Social (editable)
- 📚 8:00–10:00 PM — Learning (editable)
- 🌙 10:00–11:00 PM — Wind Down (fixed)
- 😴 11:00 PM–12:00 AM — Sleep (fixed)

### 9.2 Tabs
- **Plan A — Standard** | **Plan B — Heavy Work** | **Plan C — Business Dev** | **Weekly Rhythm**

### 9.3 Timeline View (Plans A/B/C)

Each block shows:
- **Checkbox** — click to mark as done for today
- **Emoji** — visual anchor
- **Block name** + `• fixed` badge (if the block is fixed/cannot be deleted)
- **Activity description**
- **Time range** + **"◀ NOW"** indicator (if current time falls within this block's hours)
- **Duration**

**NOW Indicator:** The timetable automatically detects the current time and highlights the currently active block with:
- Purple/accent background
- Accent outline around the block
- "◀ NOW" text in the time column

> **Note on "fixed" blocks:** Fixed blocks (like Wake & Refresh, Sleep, Lunch) cannot be deleted. They can be edited but not removed. Non-fixed blocks have edit/delete icons.

### 9.4 Editing Blocks
1. Hover over any non-fixed block → edit (pencil) and delete (trash) icons appear.
2. Click pencil → inline `BlockForm` appears with fields:
   - **Emoji** (text, single character)
   - **Block Name** (text)
   - **Activity** (text — what you actually do)
   - **Time** (text, e.g., "9:00–1:00 PM")
   - **Duration** (text, e.g., "4h")
3. Click **Save** → updates in DB (`timetable_plans.blocks` JSONB array).
4. Click **Cancel** → discards changes.

### 9.5 Adding a New Block
- Click **"+ Add Block"** at the bottom of any plan.
- Fill in the `BlockForm` and click Save.
- New block is added to the end of the plan.

### 9.6 Deleting a Block
- Hover over any non-fixed block → click the trash icon.
- Confirm "Delete this block?" → block is removed permanently.

### 9.7 Check-In System
- Checking off blocks saves your progress to `timetable_checks` table: `(user_id, date, block_ids[])`.
- Each user has **one check record per day** — the set of completed block IDs.
- **Resets at 5:00 AM** — the timetable day is defined as starting at 5 AM. If it's before 5 AM, the "timetable day" is still yesterday.
- **Reset button** (top-right) clears all check-ins for today.

### 9.8 Weekly Rhythm Tab

A reference table (not stored in DB — static data) showing the recommended weekly schedule:

| Day | Focus | Plan | Platform |
|-----|-------|------|----------|
| Monday | Techwara + LinkedIn post | A | LinkedIn |
| Tuesday | Techwara + GitHub push | A | GitHub + Twitter |
| Wednesday | Cold calling + content batch | C | LinkedIn |
| Thursday | Techwara + freelance | B | LinkedIn |
| Friday | Freelance delivery + content | A | LinkedIn + Twitter |
| Saturday | Freelance + CRM + proposals | C | Freelance platforms |
| Sunday | Weekly review + planning | C | LinkedIn |

Today's row is highlighted in purple.

---

## 10. Goals

**URL:** `/goals`

A hierarchical goal tracker with 4 time horizons.

### 10.1 Goal Types (Tabs)
| Type | Label | Purpose |
|------|-------|---------|
| **life** | 🌟 Life Goals | Long-term, lifetime aspirations |
| **annual** | 📅 Annual Goals | This year's targets |
| **quarterly** | 📊 Quarterly Goals | This quarter (aligns with 90-day cycles) |
| **monthly** | 🗓️ Monthly Goals | Monthly milestones |

Each tab shows the count of goals in that category.

### 10.2 Goal Statuses
| Status | Color | Meaning |
|--------|-------|---------|
| not_started | Grey | Created but work hasn't begun |
| in_progress | Purple/accent | Currently being worked on |
| completed | Green | Achieved! |
| on_hold | Amber/warning | Paused temporarily |

### 10.3 Creating a Goal
1. Click **"+ New Goal"** (top-right).
2. Fill in the `GoalForm`:
   - **Goal Title** (required) — e.g., "Get 10 freelance clients"
   - **Description** (optional) — additional context
   - **Type** — life / annual / quarterly / monthly
   - **Status** — not_started (default)
   - **Target** — numeric target, e.g., "10"
   - **Current** — current progress, e.g., "3"
   - **Unit** — unit of measurement, e.g., "clients"
   - **Deadline** — optional date picker
3. Click **"Save Goal"**.

### 10.4 Goal Card

Each goal card shows:
- **Circle/CheckCircle** icon (click to toggle between `in_progress` and `completed`)
- **Title** (struck through when completed)
- **Description** (if any)
- On hover: **status badge**, **edit** (pencil), **delete** (trash) icons
- **Progress bar** (if target > 0): shows `current/target (pct%)`
- **Deadline** (if set)

### 10.5 Editing & Deleting Goals
- **Edit:** Hover → click pencil → `GoalForm` replaces the card inline → make changes → Save.
- **Delete:** Hover → click trash → confirmation dialog → confirms deletion.
- **Quick toggle:** Click the circle/checkmark icon to flip between completed and in_progress.

### 10.6 Overall Count
Header shows: "X/Y goals completed" (across all types)

---

## 11. Health Tracker

**URL:** `/health`

Daily health log for physical and mental wellbeing metrics.

### 11.1 Summary Stats (Top 4 Cards)

Based on the **last 14 days** of logs:
| Card | Metric |
|------|--------|
| 🌙 Avg Sleep | Average sleep hours |
| 💧 Avg Water | Average water glasses |
| 🏋️ Exercise | Number of days with exercise done |
| ❤️ Meditation | Number of days with meditation done |

### 11.2 Daily Log Form

**Date picker** at the top-right — change the date to edit a past day's log. If a log already exists for that date, the form pre-fills automatically.

**Activity Checklist (toggle buttons):**
| Activity | Emoji | Stored In |
|----------|-------|-----------|
| Exercise | 🏋️ | `exercise_done` (boolean) |
| Yoga | 🧘 | `yoga_done` (boolean) |
| Meditation | 🧠 | `meditation_done` (boolean) |
| Skincare | ✨ | `skincare_done` (boolean) |

Each button turns green with a ✓ when active.

**Numeric Metrics:**
| Field | Type | Notes |
|-------|------|-------|
| Weight (kg) | Decimal (step 0.1) | e.g., 70.5 |
| Water (glasses) | Integer (0–20) | Target: 8 |
| Sleep (hours) | Decimal (step 0.5) | e.g., 7.5 |
| Mood | Range slider (1–5) | 😞 😕 😐 🙂 😄 |

**Text Fields:**
- Exercise Notes — what you did (e.g., "5km run, 20 push-ups")
- Notes — how you felt overall

**Save Log** button → upserts on `(user_id, date)`. One row per user per day.

### 11.3 Last 14 Days Table

| Column | Description |
|--------|-------------|
| Date | Day abbreviation + date |
| Weight | Weight in kg or — |
| Water | Glasses or — |
| Sleep | Hours or — |
| 🏋️ | ✓ or — |
| 🧘 | ✓ or — |
| 🧠 | ✓ or — |
| ✨ | ✓ or — |
| Mood | Emoji (😞–😄) |
| Notes | Truncated text |

Today's row is highlighted in accent color.

---

## 12. Finance Tracker

**URL:** `/finance`

Income and expense tracking with a debt repayment countdown.

### 12.1 Summary Cards (3 cards)
| Card | Color | Description |
|------|-------|-------------|
| Total Income | Green | Sum of all income entries |
| Total Expense | Red | Sum of all expense entries |
| Net Balance | Green/Red | Income minus Expenses |

All values in INR (₹) with Indian number formatting.

### 12.2 Debt Countdown

A special section tracking a ₹80,000 total debt:
- **Remaining balance** shown in red
- **Progress bar** (gradient red-to-pink) showing % repaid
- "X% repaid (₹Y paid)"
- **Log Payment** input: enter amount paid → click **"Log Payment"**
  - Reduces `user_settings.debt_remaining` by the entered amount
  - Creates an `EMI / Debt` expense entry automatically
  - Updates the progress bar

> Note: The ₹80,000 total debt is hardcoded in the finance page. To change it, the `DEBT_TOTAL` constant in `finance/page.tsx` needs to be updated.

### 12.3 Adding an Entry

Click **"+ Add Entry"** → `EntryForm` appears with fields:
- **Date** — date picker (defaults to today)
- **Type** — Income or Expense
- **Category** — dropdown changes based on type:
  - Income: Salary, Freelance, Rentlyf, Investment Returns, Other Income
  - Expense: Food, Rent, Transport, Utilities, Entertainment, Health, Education, Shopping, EMI / Debt, Other
- **Amount (₹)** — numeric field
- **Description** — optional free-text

Click **Save** → entry is inserted into `finance_entries`.

### 12.4 Entry List

**Filter tabs:** All | Income | Expense

Each entry shows:
- Green (income) or Red (expense) icon
- Description or category name
- Category · Date
- Amount with + / - prefix
- On hover: **Edit** (pencil) and **Delete** (trash) icons

---

## 13. CRM — Lead & Cold Call Manager

**URL:** `/crm`

A lightweight CRM for managing freelance/business leads and cold calling activities.

### 13.1 Pipeline Overview (6-Stage Funnel)

Stages with colors:
| Stage | Emoji | Color |
|-------|-------|-------|
| Cold | 🥶 | Grey (#64748b) |
| Warm | 🔥 | Amber |
| Hot | 🚨 | Red |
| Proposal | 📋 | Purple |
| Client | ✅ | Green |
| Lost | ❌ | Dark Grey |

**Pipeline header shows:** "Pipeline: ₹X · Y clients" where X = sum of deal values of non-lost/client leads.

**Stage filter grid (6 buttons):** Click any stage to filter the list. Click again to deselect.

### 13.2 Adding a Lead

Click **"+ Add Lead"** → `LeadForm` appears with:
| Field | Type | Notes |
|-------|------|-------|
| Name | Text (required) | Contact person's name |
| Company | Text | Company name |
| Stage | Dropdown | cold (default) |
| Email | Email | Clickable `mailto:` link in card |
| Phone | Text | Clickable `tel:` link in card |
| Service | Text | What you're selling (e.g., "Web dev") |
| Deal Value (₹) | Number | Expected value of the deal |
| Source | Dropdown | LinkedIn / Cold Call / Referral / Upwork / Website / Instagram / Other |
| Next Follow-up | Date picker | When to follow up next |
| Notes | Textarea (3 rows) | Any additional notes |

Click **Save** → lead inserted into `crm_leads`.

### 13.3 Lead Card

Each lead card shows:
- **Stage badge** (colored) + **Source** + **⚠️ Follow-up overdue** (if next_followup is in the past)
- **Name** (bold) + **Company**
- **Service**
- **Notes** (2-line clamp)
- **Email** link, **Phone** link, **Next follow-up** date
- **Deal value** (right side, in green)
- **Stage dropdown** — instantly change stage without opening edit form
- On hover: **Edit** (pencil) and **Delete** (trash) icons

### 13.4 Editing & Deleting Leads
- **Edit:** Hover → pencil → `LeadForm` replaces the card.
- **Stage Quick-Update:** Use the dropdown in the card directly — saves instantly to DB.
- **Delete:** Hover → trash → confirmation → deleted.

### 13.5 Cold Call Log

A separate section below the lead list for logging **ad-hoc cold calls** (no lead record needed).

**"+ Log Call"** button opens a quick form:
| Field | Options |
|-------|---------|
| Date | Date picker |
| Name | Text |
| Phone | Text |
| Outcome | 📵 No Answer / ✅ Interested / ❌ Not Interested / 🔔 Callback / 🎯 Converted |
| Notes | Text |

Shows last 10 calls with:
- 📞 Name, Phone, Date
- Outcome label (color-coded)
- Notes

---

## 14. Content Calendar

**URL:** `/content`

A content planning and scheduling tool for social media posts.

> **Note:** This page shows all non-blog platforms. Blog posts are managed separately at `/blog`.

### 14.1 Platforms

| Platform | Emoji |
|----------|-------|
| LinkedIn | 💼 |
| Twitter/X | 𝕏 |
| Instagram | 📸 |
| YouTube | ▶️ |
| Newsletter | 📧 |

### 14.2 Post Statuses & Colors
| Status | Color |
|--------|-------|
| Idea | Grey (muted) |
| Draft | Amber (warning) |
| Scheduled | Purple (accent) |
| Published | Green (success) |

### 14.3 Views

**Toggle:** Week View | List View (top-right)

**Week View:**
- Shows the current week (Mon–Sun) in a 7-column grid
- Navigate weeks with `‹ ›` arrows
- Each day cell shows posts scheduled for that date
- Posts are color-coded by status
- Click any post chip → opens the edit modal
- Click the `+` button at the bottom of any day cell → opens new post modal with that date pre-filled

**List View:**
- Platform filter buttons (All + 5 platforms)
- Each post shows: platform emoji, status badge, scheduled date, title, hook (italic), content preview (2-line clamp)
- On hover: **Copy content** button, **Edit** (pencil), **Delete** (trash)

### 14.4 Creating a Post

Click **"+ New Post"** → `PostModal` (centered overlay) with:
| Field | Notes |
|-------|-------|
| Title / Idea | The headline or topic |
| Platform | Dropdown |
| Status | Dropdown (idea → draft → scheduled → published) |
| Hook / Opening Line | First sentence designed to grab attention |
| Content / Body | Full post body |
| Tags | Hashtags (e.g., #tech #webdev) |
| Scheduled Date | When to post |
| URL (once live) | Link to published post |

Click **Save** → inserts into `content_posts`.

---

## 15. Blog & Content Manager

**URL:** `/blog`

Manages blog articles and long-form content separately from social media posts.

### 15.1 Post Statuses
Same as Content Calendar: Idea | Draft | Scheduled | Published

### 15.2 Filter Tabs
All | Idea (N) | Draft (N) | Scheduled (N) | Published (N)

### 15.3 Adding a Blog Post

Click **"+ New Post"** → `PostForm` inline (not modal) with:
- **Title / Topic** — blog post title
- **Platform** — blog / linkedin / twitter / instagram / youtube / other
- **Status** — idea (default)
- **Schedule** — date picker
- **Notes / Outline** — your outline or draft content
- **URL (once published)** — link to the live post

### 15.4 Blog Post Card

Shows:
- Status badge (color-coded)
- Platform label
- Scheduled date
- **Title**
- **Notes/content** (2-line clamp)
- **"View post"** link (if URL set) — opens in new tab
- On hover: **Edit** (pencil) + **Delete** (trash)

---

## 16. Learning Hub

**URL:** `/learning`

Track courses, books, tutorials, videos, and other learning resources.

### 16.1 Resource Types
course | book | tutorial | documentation | video | podcast | other

### 16.2 Statuses
| Status | Color |
|--------|-------|
| not_started | Grey |
| in_progress | Purple (accent) |
| completed | Green |
| on_hold | Amber |

### 16.3 Currently Learning Section

If any resources are `in_progress`, they appear in a top card **"Currently Learning"** with:
- BookOpen icon + title
- Progress bar: `completed_lessons / total_lessons (pct%)`

### 16.4 Adding a Resource

Click **"+ Add Resource"** → `ResourceForm` inline:
| Field | Notes |
|-------|-------|
| Title | Resource name (e.g., "React Masterclass") |
| Type | Dropdown |
| Status | Dropdown |
| Topic / Skill | e.g., "React, TypeScript" |
| URL | Link to the resource |
| Total Lessons | Numeric (e.g., 40) |
| Done Lessons | Numeric (e.g., 12) |
| Notes | Any notes |

### 16.5 Resource Card

Shows:
- Status badge + resource type + topic
- **Title** (bold)
- Notes (2-line clamp)
- **Progress bar** (if total_lessons > 0): `X/Y lessons`
- **"Open resource"** link (if URL set) → opens in new tab
- On hover: **Edit** (pencil) + **Delete** (trash)

---

## 17. Freelance Project Manager

**URL:** `/freelance`

Track all your freelance projects from lead to payment.

### 17.1 Project Statuses
| Status | Color |
|--------|-------|
| lead | Grey |
| proposal | Amber |
| active | Purple (accent) |
| completed | Green |
| cancelled | Red |

### 17.2 Summary Cards (3 cards)
| Card | Metric |
|------|--------|
| Total Earned | Sum of `paid_amount` from completed projects |
| Active Pipeline | Sum of `budget` from active projects |
| Active Projects | Count of projects with status = active |

### 17.3 Adding a Project

Click **"+ New Project"** → `ProjectForm` inline:
| Field | Notes |
|-------|-------|
| Project Title | Name of the project |
| Client Name | Who hired you |
| Platform | Upwork / Fiverr / LinkedIn / Direct / Referral / Other |
| Status | Dropdown (lead default) |
| Budget | Total agreed project value (₹) |
| Paid Amount | Amount received so far (₹) |
| Currency | INR (default) |
| Deadline | Date picker |
| Notes | Any additional notes |

### 17.4 Project Card

Shows:
- Status badge (color-coded) + Platform + Client Name
- **Title**
- **Notes**
- Budget + "Paid: ₹X" (right side)
- **Payment progress bar**: `paid_amount / budget (pct%)`
- Due date (if set)
- On hover: **Edit** (pencil) + **Delete** (trash)

---

## 18. Rentlyf Time Logger

**URL:** `/rentlyf`

Dedicated time tracking for hours worked on the Rentlyf platform.

### 18.1 Summary Cards (3 cards)
| Card | Metric |
|------|--------|
| Total Hours | All-time logged hours |
| This Week | Hours in the last 7 days |
| Daily Avg | Average hours per logged day |

### 18.2 Logging Hours

Fill the quick log form:
| Field | Options |
|-------|---------|
| Date | Date picker (defaults to today) |
| Hours | Number (0–24, step 0.5) |
| Category | dashboard / development / design / meeting / support / other |
| Notes | What did you work on? |

Click **"+ Log"** → upserts on `(user_id, date)`. **One log per day** — re-logging the same date updates the existing entry.

### 18.3 Logs by Week

Below the form, logs are grouped by calendar week:
- **Week of [MMM D]** header + total hours for the week (right side)
- Each row: Day abbreviation + date + notes + category + hours (bold, accent color)

---

## 19. Settings

**URL:** `/settings`

Manage your profile, preferences, password, and account.

### 19.1 Profile

| Field | Notes |
|-------|-------|
| Display Name | Shown in sidebar and top bar |
| Bio | Optional short bio |

Click **"Save Profile"** → updates `user_profiles` table.

### 19.2 Preferences

| Setting | Options |
|---------|---------|
| Theme | Dark / Light / System (3-option radio; applies `data-theme` attribute immediately on change; value saved to DB and restored on next page load via layout script) |
| Timezone | Asia/Kolkata / UTC / America/New_York / America/Los_Angeles / Europe/London / Europe/Paris |
| Week Starts | Monday / Sunday |
| Daily Reminder | Time picker (e.g., 06:00) |

Click **"Save Preferences"** → updates `user_settings` table.

> Note: The daily reminder time is stored but push notifications are not yet active. The UI acknowledges this: "Saved to your profile, but in-app push notifications are not yet active."

### 19.2a Finance Configuration *(v2.1)*

| Field | Notes |
|-------|-------|
| Total Debt (₹) | The total debt amount that defines 100% on the Finance page debt payoff bar |

Click **"Save Finance Settings"** → updates `user_settings.debt_total`.

This allows you to change your total debt amount without touching code. The Finance page reads this value on load and uses it for the debt progress bar.

### 19.2b Social Links *(v2.1)*

Displayed in the Profile card alongside display name and bio:

| Field | Notes |
|-------|-------|
| LinkedIn URL | e.g., `https://linkedin.com/in/prajjawalsingh` |
| GitHub URL | e.g., `https://github.com/PrajjawalSingh1997` |
| Twitter / X URL | e.g., `https://x.com/handle` |
| Portfolio URL | e.g., `https://yoursite.com` |

These are saved to `user_profiles` and used as reference links. They are not yet displayed elsewhere in the UI but are required by Migration 003.

### 19.3 Change Password

| Field | Notes |
|-------|-------|
| New Password | Minimum 8 characters |
| Confirm Password | Must match |

Click **"Update Password"** → calls `supabase.auth.updateUser({ password })`.

Validation errors:
- "Passwords do not match."
- "Password must be at least 8 characters."

### 19.4 Sign Out

Click **"Sign Out"** (red button) → calls `supabase.auth.signOut()` → redirected to `/login`.

---

## 20. Admin Panel (Super Admin Only)

**URL:** `/admin`  
**Access:** Only users with `user_profiles.role = 'super_admin'`

The Admin Panel is the control center for managing all users and their module access.

### 20.1 Accessing the Admin Panel

**Who can access:** Only `super_admin` users. The sidebar shows an **Admin Panel** link at the bottom (in amber/gold color) only for admins.

**What happens if a non-admin navigates to `/admin`:**
```
1. Page loads → checks user role from user_profiles
2. If role !== 'super_admin' → router.push('/') → redirected to dashboard
```

**How to make a user a super_admin:** Run this SQL in Supabase SQL Editor:
```sql
SELECT set_super_admin('user@email.com');
```

This calls the `set_super_admin(email)` function in the database schema.

### 20.2 Admin Panel Layout

**Header:** "🛡️ Admin Panel" + "X users · Y modules"

**Page Structure:**
1. Bulk action bar (appears when users are selected)
2. Search bar + Select All button
3. Users table with module toggles

### 20.3 Users Table

Columns:
| Column | Description |
|--------|-------------|
| ☐ | Checkbox for bulk selection |
| User | Display name + email |
| Role | `super_admin` (purple badge) or `user` (grey badge) |
| [Module columns] | One column per module, toggle button |
| Actions | "Enable All" button |

**Module Toggle Button:**
- **Green with ✓** — module is enabled for this user
- **Grey (empty)** — module is disabled
- Click any button → immediately upserts to `user_module_settings`
- While saving: spinner animation shown on that button
- If a `user_module_settings` row doesn't exist, the module's `is_default` value determines the displayed state

### 20.4 Searching Users

- **Search input** — filters by email address OR display name (case-insensitive)
- Results update in real-time as you type

### 20.5 Selecting Users

**Individual selection:**
- Click the checkbox in any user's row to select/deselect

**Bulk selection:**
- **"Select All"** button (top-right of search bar) — selects all *filtered* users
- Click again → "Deselect All"
- Header checkbox in table — selects/deselects all filtered users

### 20.6 Bulk Actions

When 1 or more users are selected, a **bulk action bar** appears (purple background):

1. **"X users selected"** label
2. **Module dropdown** — select which module to affect
3. **"✓ Enable for all"** button — enables the selected module for all selected users
4. **"✗ Disable for all"** button — disables the selected module for all selected users
5. **"Clear selection"** button — deselects all

**How bulk enable/disable works:**
```sql
-- For each selected user:
UPSERT INTO user_module_settings
  (user_id, module_id, is_enabled)
VALUES
  ($userId, $moduleId, true/false)
ON CONFLICT (user_id, module_id)
DO UPDATE SET is_enabled = true/false;
```

The change is reflected in the UI immediately. Users affected will see their sidebar updated on their next page load.

### 20.7 Enable All for a Single User

Click **"Enable All"** in any user's row → enables every module for that user:
```sql
UPSERT INTO user_module_settings
  (user_id, module_id, is_enabled)
SELECT $userId, id, true FROM modules;
```

### 20.8 Module Visibility Impact

When a module is disabled for a user:
- The sidebar link for that module disappears from their sidebar (sidebar is rendered server-side from enabled modules)
- The page itself is still accessible by URL — there is no URL-level access control for individual modules
- Only `/admin` has a hard role check and redirect

---

## 21. Complete Workflow Reference

### 21.1 New User — Day 1 Complete Walkthrough

```
1. Sign up at /signup
2. You're redirected to / — see "No Active 90-Day Cycle"
3. Go to /prompt
4. Copy the prompt template (Step 1)
5. Fill in your name, start date, goals, objectives
6. Paste into Claude/ChatGPT/Gemini
7. Wait for all 90 days to generate
8. Copy the JSON output
9. Back in Life OS → Step 3: paste JSON, set start date, click Import
10. ✅ Redirected to dashboard — your cycle is live!

Optional setup:
11. Go to /timetable — review Plan A/B/C blocks, edit if needed
12. Go to /goals — add your life/annual/quarterly/monthly goals
13. Go to /health — start logging daily health
14. Go to /finance — add first income/expense entries
15. Go to /settings — update display name, timezone, week start
```

### 21.2 Daily Workflow

```
Every Morning:
1. Open / (Dashboard) → see today's day number and pending %
2. Click "View Full Day" or navigate to /today
3. Go through task list:
   - ✅ Check off completed tasks
   - ⏭️ Skip tasks you're skipping today
   - → Postpone tasks that need to move
   - ✏️ Edit tasks to refine content if needed
4. Copy LinkedIn/Twitter post content using the Copy button
5. Log Rentlyf hours (bottom of today page)
6. Write daily notes

Health & Finance (ideally daily):
7. Go to /health → log exercise, water, sleep, mood
8. Go to /finance → log any income/expense entries

Evening:
9. Check /timetable → mark completed time blocks
10. Go to /crm → update any lead stages after calls
```

### 21.3 Weekly Workflow

```
Sunday (Weekly Review):
1. /progress → review completion rate, streak, weekly breakdown
2. /goals → update current_value for any tracked goals
3. /crm → review pipeline, follow up on warm/hot leads
4. /freelance → update project status and paid amounts
5. /content → plan next week's posts in the calendar
6. /learning → update lesson progress on active courses
7. /timetable → review Weekly Rhythm tab for the coming week
```

### 21.4 Every 90 Days (Cycle Reset)

```
1. At end of cycle (Day 90):
   - Go to /progress → screenshot/export your stats
   - Review all completed goals in /goals
   - Check /finance for net balance over the cycle

2. Start new cycle:
   - Go to /prompt
   - Update the prompt template with new goals/objectives
   - Generate new JSON from AI
   - Import with new start date (Day 90+1)
   ⚠️ Old cycle data stays in DB but becomes inactive

3. New cycle begins — dashboard shows Day 1 of new cycle
```

### 21.5 Admin — User Onboarding Workflow

```
When a new user signs up and needs specific modules:
1. Go to /admin
2. Search for the user by email
3. Review their current module settings (checkboxes)
4. Toggle individual modules as needed
   OR
5. Click "Enable All" to give them full access
   OR
6. Select user → pick module → Bulk Enable

To restrict a module from multiple users at once:
1. Use search to filter relevant users
2. Click "Select All"
3. Select module in bulk action dropdown
4. Click "Disable for all"
```

---

## 22. Data Model & Database Reference

### 22.1 Database Table Summary

| Table | Purpose | Key Fields |
|-------|---------|------------|
| `auth.users` | Auth accounts (Supabase managed) | id, email, created_at |
| `user_profiles` | User identity | id, display_name, bio, role, avatar_url |
| `user_settings` | User preferences | user_id, timezone, week_start, debt_remaining |
| `modules` | Available app modules | id, name, slug, is_default, sort_order |
| `user_module_settings` | Per-user module toggles | user_id, module_id, is_enabled |
| `ninety_day_cycles` | 90-day cycles | user_id, title, goal, start_date, end_date, is_active |
| `days` | Individual days in a cycle | cycle_id, user_id, day_number, date, plan_type, notes, rentlyf_hours |
| `tasks` | Tasks per day | day_id, user_id, title, category, status, content, sort_order |
| `goals` | User goals | user_id, goal_type, title, status, target_value, current_value, unit, deadline |
| `timetable_plans` | Daily schedule templates | user_id, plan_type, name, blocks (JSONB) |
| `timetable_checks` | Daily timetable check-ins | user_id, date, block_ids (text[]) |
| `health_logs` | Daily health data | user_id, date, exercise_done, sleep_hours, mood, weight_kg… |
| `finance_entries` | Income/expense records | user_id, date, type, category, amount, description |
| `crm_leads` | Sales leads | user_id, name, stage, deal_value, next_followup… |
| `cold_calls` | Cold call log entries | user_id, lead_id?, date, name, phone, outcome |
| `content_posts` | Blog + social media posts | user_id, title, platform, status, content, hook, scheduled_date |
| `learning_resources` | Learning resources | user_id, title, resource_type, topic, url, status, total_lessons |
| `freelance_projects` | Freelance projects | user_id, title, client_name, status, budget, paid_amount |
| `rentlyf_logs` | Rentlyf time logs | user_id, date, hours, category, notes |

### 22.2 Enums

```sql
task_status:              pending | completed | skipped | postponed
plan_type:                A | B | C
goal_type:                life | annual | quarterly | monthly
goal_status:              not_started | in_progress | completed | on_hold
finance_type:             income | expense
lead_stage:               cold | warm | hot | proposal | client | lost
call_outcome:             no_answer | callback | interested | not_interested | converted
content_post_status:      idea | draft | scheduled | published
learning_status:          not_started | in_progress | completed | on_hold
freelance_project_status: lead | proposal | active | completed | cancelled
user_role:                super_admin | user
```

### 22.3 Key Relationships

```
auth.users
  ├─── user_profiles (1:1)
  ├─── user_settings (1:1)
  ├─── user_module_settings (1:many)
  │         └─── modules (many:many via user_module_settings)
  ├─── ninety_day_cycles (1:many)
  │         └─── days (1:many)
  │                   └─── tasks (1:many)
  ├─── goals (1:many)
  ├─── timetable_plans (1:3 — Plan A, B, C)
  ├─── timetable_checks (1:many — one per date)
  ├─── health_logs (1:many — one per date)
  ├─── finance_entries (1:many)
  ├─── crm_leads (1:many)
  │         └─── cold_calls (1:many, optional link)
  ├─── content_posts (1:many — unified blog + social)
  ├─── learning_resources (1:many)
  ├─── freelance_projects (1:many)
  └─── rentlyf_logs (1:many — one per date)
```

---

## 23. Security & Row Level Security

### 23.1 How Data Isolation Works

Every table (except `modules`) has a `user_id` column. Row Level Security (RLS) policies enforce:

```sql
-- Example: users see ONLY their own tasks
CREATE POLICY "tasks_all" ON tasks
  FOR ALL USING (user_id = auth.uid());
```

This means:
- A user cannot query another user's data, even if they know the API endpoint.
- The database itself enforces isolation — it's not just an application-level check.
- Even if someone gets the Supabase anon key, they can only access data for their own authenticated user.

### 23.2 Super Admin Exceptions

```sql
-- Helper function
CREATE FUNCTION is_super_admin()
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM user_profiles
    WHERE id = auth.uid() AND role = 'super_admin'
  );
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- user_profiles: admin can see ALL profiles (needed for admin panel)
CREATE POLICY "profiles_select" ON user_profiles
  FOR SELECT USING (id = auth.uid() OR is_super_admin());

-- user_module_settings: admin can manage all users' settings
CREATE POLICY "ums_admin_all" ON user_module_settings
  FOR ALL USING (is_super_admin());
```

Super admins can read all user profiles and manage all module settings. They **cannot** read other users' personal data (tasks, health, finance etc.) — RLS still applies.

### 23.3 Admin Email Access

The admin panel fetches user emails via:
```typescript
const { data: authUsers } = await supabase.auth.admin.listUsers()
```

This requires the Supabase **service role key** (or admin capabilities). In the current implementation, this uses the standard anon key via the admin API — this may require the admin user to have elevated Supabase permissions configured.

### 23.4 Password Security

- Passwords are stored as bcrypt hashes by Supabase Auth — never in plain text.
- Sessions use HTTP-only, secure cookies managed by `@supabase/ssr`.
- Session refresh happens on every request via middleware.

---

## 24. Troubleshooting & FAQ

### Q: I imported my plan but the Dashboard shows EmptyCycle.
**A:** Check that the JSON included both `cycle` and `days` fields. Also ensure the cycle's `is_active` is set to `true`. Only the most recently imported cycle (with `is_active = true`) is shown. Go to `/prompt` and re-import if needed.

---

### Q: My tasks are all "pending" after importing.
**A:** This is expected. The import creates all tasks with `status = 'pending'`. You mark them as completed each day in `/today` or `/day/[N]`.

---

### Q: I accidentally deleted a task. Can I get it back?
**A:** No — deletions are permanent (`DELETE FROM tasks`). There is no trash/undo system. To restore, you would need to re-import the cycle or manually add the task back via the edit flow.

---

### Q: Can two users see each other's data?
**A:** No. Row Level Security policies in the PostgreSQL database prevent any user from reading another user's data. Even super admins cannot see your tasks, health logs, finances, or other personal data.

---

### Q: The Admin link doesn't appear in my sidebar.
**A:** The Admin Panel link is only visible to users with `role = 'super_admin'` in `user_profiles`. To grant admin access, run `SELECT set_super_admin('your@email.com');` in the Supabase SQL Editor.

---

### Q: I changed my timezone in Settings but dates look wrong.
**A:** The app currently uses JavaScript's local `new Date()` for date calculations (like "which day of the 90-day cycle is today"). The timezone setting is stored but not yet fully applied to all date computations. Dates in the DB are stored as `DATE` (no time zone).

---

### Q: The Timetable resets at 5 AM — what does this mean?
**A:** If you're doing timetable check-ins after midnight but before 5 AM, the app considers that as still being the previous day (because your "day" started at 5 AM the previous morning). The `getTimetableDay()` function returns yesterday's date if the current hour is before 5.

---

### Q: Can I have two active cycles at the same time?
**A:** No. The app only looks for `is_active = true` cycles. Importing a new plan automatically sets `is_active = false` on all existing cycles. Only one cycle can be active at a time.

---

### Q: How do I completely start over?
**A:** 
1. Go to `/prompt` and import a new plan (old data stays in DB but is deactivated).
2. For a full reset, you would need to delete data directly in Supabase (Dashboard → Table Editor) or run SQL like:
   ```sql
   DELETE FROM ninety_day_cycles WHERE user_id = auth.uid();
   DELETE FROM health_logs WHERE user_id = auth.uid();
   -- etc.
   ```

---

### Q: What happens if the AI doesn't generate all 90 days?
**A:** The import will still work with partial data. Only the days included in the JSON will be created. The 90-day heatmap will show grey bars for missing days. You can re-import to replace the cycle.

---

### Q: How do I access a specific day that wasn't in my import?
**A:** Navigate to `/day/[N]` directly. If that day record doesn't exist in the DB, the page shows "This day doesn't exist in your cycle yet." Days are only created during import.

---

### Q: The Finance Tracker shows ₹80,000 as my debt total but mine is different.
**A:** The `DEBT_TOTAL = 80000` constant is hardcoded in `src/app/(dashboard)/finance/page.tsx`. Ask the developer (admin) to update it to your actual debt amount. The remaining balance (`user_settings.debt_remaining`) tracks how much has been paid down.

---

### Q: I'm logged in but get redirected to `/login`.
**A:** Your session may have expired. Supabase sessions have a configurable timeout. Try clearing cookies for the domain and logging in again. If this persists, check that your `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` environment variables are correctly set in Vercel.

---

---

## 25. Habits Tracker

**URL:** `/habits`  
**Added:** v2.1 (July 2026)  
**Requires:** Migration 003 run in Supabase (`supabase/migrations/003_habits_brand_growth.sql`), and `habits` module row inserted in the `modules` table

The Habits Tracker lets you define daily habits and maintain streaks by checking them off each day. Unlike the Health Tracker (which logs metrics), Habits tracks behavioral patterns — reading, cold showers, no-phone-before-9-AM, etc.

### 25.1 The 7-Day Grid

The main view is a table with one row per habit and 7 columns (one per day, last 7 days including today):

| Column | Description |
|--------|-------------|
| Habit | Emoji + habit name |
| Streak | Fire emoji + consecutive-day streak count |
| Mon–Sun | Filled colored cell = done; empty cell = not done |
| (hover) | Edit (pencil) and Delete (trash) icons appear on hover |

### 25.2 Adding a Habit

Click **"+ Add Habit"** → `HabitForm` appears with fields:

| Field | Notes |
|-------|-------|
| Emoji | Single character emoji (e.g., `💧`, `📚`, `🏋️`) |
| Habit Name | Required (e.g., "Drink 3L water", "Read 30 min") |
| Color | Color picker — determines cell fill color when done |
| Frequency | Daily or Weekly (currently only Daily is tracked in the grid) |

Click **Save** → habit is inserted into the `habits` table.

### 25.3 Logging a Habit

Click any cell in the 7-day grid for a specific habit and date:
- **Empty cell → filled cell:** Habit marked done for that date. Upserts to `habit_logs` with `done=true`.
- **Filled cell → empty cell:** Habit un-done. Updates `habit_logs` with `done=false`.

Toggling uses optimistic UI — the cell updates instantly, then confirms/reverts based on DB response.

> You can log habits retroactively for any of the past 7 days by clicking cells in past columns.

### 25.4 Streak Calculation

The streak counter shows consecutive days the habit was completed:

```
1. Load all past habit_logs for this habit where done=true, ordered by date DESC
2. If done today → start counting from today
3. If NOT done today → start counting from yesterday
4. Walk backward day by day:
   - If log exists for that day → streak++
   - If gap found → break
5. Return streak count
```

> Streak counts are calculated client-side from all historical logs (not just the last 7 days in the grid).

### 25.5 Editing a Habit

Hover over any habit row → click the Pencil icon → `HabitForm` appears inline in the table row → change name, emoji, color, or frequency → Save.

### 25.6 Deleting a Habit

Hover over any habit row → click Trash icon → confirmation dialog → "Delete this habit? Logs will be lost." → confirmed → habit and all its `habit_logs` are deleted (cascade via FK).

### 25.7 Empty State

When no habits exist and no add form is open:
> "No habits yet. Add your first habit to start your streak."

### 25.8 Toasts

| Action | Toast |
|--------|-------|
| Add habit | "Habit created!" |
| Edit habit | "Habit updated!" |
| Delete habit | "Habit deleted." |
| Toggle done | "Habit completed!" or "Habit un-completed" |
| Any failure | "Failed to [action] habit." |

### 25.9 Database

| Table | What is stored |
|-------|----------------|
| `habits` | id, user_id, name, emoji, color, category, frequency, is_active, sort_order |
| `habit_logs` | id, user_id, habit_id, date, done; UNIQUE(habit_id, date) |

Both tables have RLS enabled: users can only access their own habits and logs.

---

## 26. Brand Hub

**URL:** `/brand`  
**Added:** v2.1 (July 2026)  
**Requires:** Migration 003 run in Supabase (`supabase/migrations/003_habits_brand_growth.sql`)

The Brand Hub centralizes your LinkedIn personal brand strategy. It is divided into 5 sections across a 2-column layout.

### 26.1 Left Column

#### Daily Actions

5 daily LinkedIn actions with checkboxes:
1. Comment on 5 founder posts
2. Comment on 5 dev posts
3. Send 3 connection requests
4. Reply to all comments on own posts
5. Check LinkedIn analytics

A badge shows **"X/5 done today"**. Actions auto-reset when the date changes — if stored date differs from today, all actions start fresh (unchecked) on next page load.

**Storage:** Upserts to `brand_daily_actions` with `(user_id, date)` primary key.

#### Log Weekly Metrics

A form to record LinkedIn metrics once per week:

| Field | Type |
|-------|------|
| Week Of (Monday) | Date picker (defaults to current week's Monday) |
| Followers | Number |
| Connections | Number |
| Profile Views | Number |
| Search Appearances | Number |
| Post Impressions | Number |

Click **"Save Metrics"** → upserts to `brand_metrics` using UNIQUE constraint on `(user_id, week_of)`. Re-logging the same week replaces it.

The form pre-fills if metrics exist for the current week.

#### Follower Growth Chart

When metrics data exists, a CSS bar chart shows follower counts for the last 8 weeks. Each bar is labeled with follower count and date on hover. No external chart library used.

### 26.2 Right Column

#### LinkedIn Profile Completion

11-item checklist for building a strong LinkedIn profile:
1. Profile photo
2. Custom banner
3. Headline optimized
4. Custom URL set
5. About section written
6. Experience: Techwara added
7. Projects added
8. 50+ skills listed
9. Featured section set up
10. Creator Mode enabled
11. 3+ Recommendations

Badge shows **"X/11 complete"**. Each toggle saves immediately to `brand_profile_checklist.checklist` JSONB via upsert.

#### Content Pillars

8 content pillars displayed as clickable cards in a 2-column grid:

| Pillar | Color |
|--------|-------|
| Backend Engineering | Purple (#6C5CE7) |
| Startup Life | Amber (#FDCB6E) |
| Building Rentlyf | Teal (#00C9A7) |
| Learning | Orange (#FF9F43) |
| Product Thinking | Pink (#E84393) |
| Career Journey | Blue (#0984E3) |
| Tech Documentation | Violet (#A55EEA) |
| Business | Green (#20BF6B) |

Each card shows: pillar color dot, name, and **post count** (queried from `content_posts WHERE pillar = slug` — counts are accurate to the number of posts tagged with that pillar in Content Calendar).

Clicking a pillar card navigates to `/content?pillar=backend` (or the pillar's slug) — this applies a filter on the Content Calendar page.

#### Connection Growth Table

Table showing all logged metrics weeks with columns:
- **Week** (formatted date)
- **Connections** (bold)
- **Growth** — delta vs. prior week, color-coded (green = growth, red = decline, dash = no previous data)

### 26.3 Database

| Table | What is stored |
|-------|----------------|
| `brand_metrics` | id, user_id, week_of, followers, profile_views, search_appearances, post_impressions, connections; UNIQUE(user_id, week_of) |
| `brand_profile_checklist` | user_id (PK), checklist JSONB |
| `brand_daily_actions` | user_id + date (PK), actions_done JSONB |

All three tables have RLS enabled.

### 26.4 What is Not Yet in Brand Hub

The LAUNCH_PLAN.md originally planned a follower delta badge (vs. prior week) visible next to the metrics. This delta is visible in the Connection Growth Table but is not shown in the metrics form header. This is a minor visual enhancement, not a functional gap.

---

*This document is maintained as the canonical user guide for Life OS v2.1. For technical architecture details, refer to `VERSION_CHANGELOG.md`. For database schema, refer to `supabase/schema.sql` and `supabase/migrations/`.*
