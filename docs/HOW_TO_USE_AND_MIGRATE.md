# Life OS — Personal Usage Guide for Prajjawal

**Written for:** Prajjawal Singh  
**Date:** July 8, 2026  
**App URL:** https://my-helping-hand.vercel.app  
**What this doc is:** How you'll actually use this app day-to-day. Not a technical spec — just a practical guide.

---

## Section 1: Your Daily Workflow

The app is built around a rhythm. Once you're in it, it takes about 10–15 minutes in the morning and 10 minutes in the evening. Here's the flow.

### Morning (5–10 minutes)

1. **Open Dashboard (`/`)** — See your day number, completion ring, and streak. This is your snapshot.
2. **Go to Today (`/today`)** — Read the day's theme. Scan the task list.
3. **Check off any tasks you've already done** (e.g., morning ritual tasks). Skip tasks you won't do today. Postpone anything that needs to move to another day.
4. **Open Brand Hub (`/brand`)** — Check off your daily brand actions (comment on 5 posts, send 3 connection requests, etc.) as you do them during the day.
5. **Log health** — Go to `/health`. Takes 90 seconds: toggle exercise/yoga/meditation/skincare, enter water glasses, weight, sleep hours from last night, mood. Hit Save.
6. **Check Habits (`/habits`)** — Mark off any habits you've already completed this morning (e.g., cold shower, no phone before 9 AM).

### During the Day

- **Copy post content from Today** — When it's time to post on LinkedIn or Twitter, go to `/today`, find the LinkedIn/Twitter task, click the Copy button, paste into the platform.
- **Check off tasks as you complete them** — The ring on the Today page updates in real time.
- **Log Rentlyf hours** — Bottom of the Today page. Enter hours as you go, or update at end of session.
- **Update CRM after calls/emails** — Go to `/crm`. Change lead stage with the inline dropdown. Log any new cold calls with the "+ Log Call" button.

### Evening (5–10 minutes)

1. **Complete remaining tasks** — Mark done, skip anything you won't do, move tomorrows tasks with Postpone.
2. **Fill in the day's health log** — Sleep hours, mood for the day.
3. **Log finance** — Go to `/finance`. Add any income received today (freelance, Rentlyf). Add any expenses. If you made a debt payment, use the Log Payment field.
4. **Write daily notes** — Bottom of Today page. A sentence or two about the day — what worked, what didn't.
5. **Update Timetable check-ins** — Go to `/timetable`. Click off which time blocks you completed today.

### Sunday (Weekly Review — 20–30 minutes)

1. **Progress (`/progress`)** — Review completion rate, streak, category breakdown. Fill in the Weekly Review checklist at the bottom.
2. **Goals (`/goals`)** — Update `current` values for any tracked goals (e.g., freelance clients gained this week).
3. **CRM (`/crm`)** — Review pipeline. Follow up on any warm/hot leads. Update next_followup dates.
4. **Freelance (`/freelance`)** — Update project status. Log any payments received.
5. **Content (`/content`)** — Plan next week's posts in the calendar.
6. **Learning (`/learning`)** — Update lesson progress on whatever you're studying.
7. **Brand Hub (`/brand`)** — Log this week's LinkedIn metrics (followers, connections, views).

### Every 90 Days (Cycle Reset — 1 hour)

1. **Review the cycle** — Go to `/progress`. Screenshot your completion rate and stats.
2. **Review goals** — Which quarterly goals did you hit? Move them to completed.
3. **Check finance summary** — Net balance over the 90 days.
4. **Generate new plan** — Go to `/prompt`. Fill in your new objectives, start date. Paste into Claude or ChatGPT.
5. **Import the new plan** — Paste the JSON into Step 3. Hit Import.
6. **Start Day 1** — Dashboard will show your new cycle live.

> Warning: Importing a new plan deactivates the old one. All old task data stays in the database but is no longer shown. You can still view old data by going directly to `/day/N` if you remember the day numbers.

---

## Section 2: How Each Module Helps You

### 1. Dashboard (`/`)
**What it does:** Mission control — shows you where you are in the cycle right now.  
**When to use it:** First thing every morning. Glance at the streak and ring before opening Today.  
**Day 1:** Nothing to fill in. It will show the EmptyCycle state until you import your first plan.

### 2. Today / Day View (`/today`, `/day/N`)
**What it does:** Shows today's specific tasks from your 90-day plan. Where you execute.  
**When to use it:** Every morning and throughout the day.  
**Day 1:** Empty until you import a plan. Once imported, this is your primary working view.

### 3. Prompt & Import (`/prompt`)
**What it does:** Generates your 90-day plan using an AI prompt and imports the JSON.  
**When to use it:** At the start of each new 90-day cycle (roughly every 3 months). Also when you want to restart with new goals.  
**Day 1:** Start here. Fill in your name, start date, main goal, situation, and 3 objectives. Paste into Claude or ChatGPT. Copy the JSON. Import it.

### 4. Calendar (`/calendar`)
**What it does:** Monthly view of your 90-day cycle. Shows which days are green/amber/red based on completion.  
**When to use it:** Weekly for planning. Good to see which days are coming up and their themes.  
**Day 1:** Empty until plan is imported.

### 5. Progress (`/progress`)
**What it does:** Analytics — streak, completion rate, 90-day heatmap, category breakdown, weekly breakdown, and Growth Tracker tab.  
**When to use it:** Sunday weekly review. End of cycle review.  
**Day 1:** Empty until plan is imported. The Weekly Review checklist is usable once you have data.

### 6. Timetable (`/timetable`)
**What it does:** Your Plan A/B/C daily schedule templates. Check off time blocks as you complete them.  
**When to use it:** Morning to see today's plan type (A/B/C is shown on Today page). Evening to check off completed blocks.  
**Day 1:** Plan A/B/C shells are created at signup but blocks are empty. Fill them in now — customize the default blocks to match your actual schedule.

### 7. Goals (`/goals`)
**What it does:** Tracks your life/annual/quarterly/monthly goals with progress bars.  
**When to use it:** During Sunday weekly review to update current values. At start of each 90-day cycle to set new quarterly goals.  
**Day 1:** Add all your current goals. At minimum: 1 life goal, 1-2 annual goals, 2-3 quarterly goals.

### 8. Health Tracker (`/health`)
**What it does:** Daily log of exercise, yoga, meditation, skincare, weight, water, sleep, mood, exercise minutes.  
**When to use it:** Every day — morning for habits done, evening for sleep/mood.  
**Day 1:** Log today immediately. The 14-day summary stats start appearing after a few days of data.

### 9. Finance Tracker (`/finance`)
**What it does:** Income/expense tracking with a debt payoff countdown.  
**When to use it:** Every time you receive income or spend money. Daily is ideal; weekly is acceptable.  
**Day 1:** Set your debt total in Settings first. Then add your starting income/expense entries. Add any current freelance projects' received payments.

### 10. CRM (`/crm`)
**What it does:** Lead pipeline for freelance/Rentlyf business development. Also logs cold calls.  
**When to use it:** After any lead interaction — calls, emails, proposals. After cold calling sessions.  
**Day 1:** Add all your current leads with their stage. Add any pending follow-up dates.

### 11. Content Calendar (`/content`)
**What it does:** Weekly content planning grid for LinkedIn, Twitter, Instagram, YouTube, Newsletter posts. Pillar tagging.  
**When to use it:** Sunday during weekly review to plan next week's posts.  
**Day 1:** Leave empty or add any posts you're planning. The weekly grid becomes useful once you batch-plan content.

### 12. Blog Manager (`/blog`)
**What it does:** Long-form writing pipeline — blog posts, Hashnode articles, dev.to posts, Medium drafts.  
**When to use it:** When you have a blog idea or are tracking a post from idea to published.  
**Day 1:** Add any blog post ideas you already have. Use status = "idea" to start.

### 13. Learning Hub (`/learning`)
**What it does:** Tracks courses, books, tutorials, documentation you're learning from.  
**When to use it:** When starting a new resource, and weekly to update lesson progress.  
**Day 1:** Add everything you're currently learning. Mark each with the correct status (in_progress if you've started it).

### 14. Freelance Manager (`/freelance`)
**What it does:** Tracks freelance projects from lead to payment.  
**When to use it:** When you start a new project or receive payment on an existing one.  
**Day 1:** Add all current and pipeline projects. The summary cards show your total earnings and active pipeline value.

### 15. Rentlyf Time Logger (`/rentlyf`)
**What it does:** Dedicated daily time log for hours worked on Rentlyf.  
**When to use it:** Daily after Rentlyf work sessions. Or update the hours field on the Today page (bottom of task list) — it syncs to rentlyf_logs.  
**Day 1:** Start logging today. The weekly grouped view and stats will build up over time.

### 16. Brand Hub (`/brand`)
**What it does:** LinkedIn brand strategy and metrics. Daily action checklist, weekly metrics log, profile completion tracker, 8 content pillars, connection growth table.  
**When to use it:** Every morning for daily actions. Every Sunday for weekly metrics.  
**Day 1:** Complete the LinkedIn Profile Checklist (check off what you've done). Log this week's metrics.

### 17. Habits Tracker (`/habits`)
**What it does:** Daily habit tracking with streaks and a 7-day grid.  
**When to use it:** Every morning to check off habits done. Can backfill past 7 days.  
**Day 1:** Add all your daily habits. Examples: "Cold shower", "Read 30 min", "Drink 3L water", "No phone before 9 AM".

### 18. Admin Panel (`/admin`)
**What it does:** User management and module access control. Only visible to your account (super_admin).  
**When to use it:** If you add new users to the app and need to configure their module access.  
**Day 1:** Ignore for personal use.

### 19. Settings (`/settings`)
**What it does:** Profile info, theme, timezone, debt total, social links, password, sign out.  
**When to use it:** First time setup. When your debt amount changes. When you change your social links.  
**Day 1:** Fill in everything: display name, bio, timezone (Asia/Kolkata), LinkedIn URL, GitHub URL, debt total.

---

## Section 3: Migrating Old Data (v1 to v2)

The v1 app stored all your data in browser localStorage. The v2 app uses a cloud database (Supabase). v1 data does NOT transfer automatically.

### How to Find Your v1 Data

If you still have access to the v1 URL (`https://prajjawalsingh1997.github.io/MyHelpingHand/`) in the same browser you used it:

1. Open that URL in Chrome/Firefox
2. Press F12 → Application tab → Local Storage
3. Click the URL entry → you'll see keys starting with `lifeOS_`

Keys to look for:
- `lifeOS_tasks` — task completion data per day
- `lifeOS_goals` — your goals (scorecard format from v1)
- `lifeOS_blogs` — blog post ideas and statuses
- `lifeOS_learning` — learning topics
- `lifeOS_timetable` — timetable blocks
- `lifeOS_rentlyf` — Rentlyf hours per day
- `lifeOS_notes` — any notes you saved

### What to Do With Each Data Type

**Task completions from v1** — Start fresh. Your v1 completions were on a hardcoded start date (March 24, 2026) and are not transferable to the new date-based system. Import a new 90-day plan starting today.

**Daily notes from v1** — If you have important notes, copy them manually into the daily notes field on the corresponding Day View pages in v2.

**Goals from v1** — The v1 format was a scorecard (`name, target, actual, status`). Manually re-create your goals in `/goals`. The v2 format is richer — add a description, set target_value and current_value, choose a goal type (life/annual/quarterly/monthly) and add a deadline.

**Blog post ideas from v1** — Manually add each idea to `/blog` with status = "idea".

**Learning topics from v1** — Manually add each resource to `/learning`. Update status and lesson counts.

**Finance data from v1** — Start tracking fresh from today. Historical finance data would need to be manually entered — only do this if you need the data for tax or personal records.

**Rentlyf hours from v1** — You can enter past hours in `/rentlyf` by selecting a past date in the date picker and logging hours for that day.

**Timetable blocks from v1** — Recreate your blocks in `/timetable`. Go to Plan A, click "+ Add Block" for each time slot.

### Using seed-my-data.sql for Bulk Import

The file `supabase/seed-my-data.sql` contains bulk INSERT statements for your personal data — goals, tasks, blog posts, etc. that you prepared when migrating from v1.

To use it:
1. Open Supabase dashboard → SQL Editor
2. Open the file `supabase/seed-my-data.sql` in a text editor
3. Copy and paste the SQL into the Supabase SQL Editor
4. Click "Run"

> Important: Make sure you are logged in and the `user_id` in the seed file matches your actual Supabase user ID. The file should be pre-configured with your user ID. If not, update all `user_id` references in the file.

### Importing a New 90-Day Plan Step by Step

1. Go to `/prompt`
2. **Step 1 — Copy the prompt template:** Click "Copy Prompt Template". Open Claude (claude.ai) or ChatGPT.
3. **Fill in the template variables:**
   - `[YOUR NAME]` → Prajjawal Singh
   - `[START DATE]` → today's date (e.g., 2026-07-08)
   - `[YOUR MAIN GOAL]` → your primary 90-day goal (e.g., "Get 5 freelance clients and build Rentlyf's sales pipeline")
   - `[BRIEF DESCRIPTION]` → 2-3 sentences about your current situation
   - `[OBJECTIVE 1, 2, 3]` → your 3 specific objectives for this cycle
4. Paste the filled prompt into Claude/ChatGPT → wait for all 90 days to generate (you should see `"day_number": 90` at the end)
5. **Copy the entire JSON output** (including any ` ```json ` fences — the app strips them)
6. **Step 3 in Life OS:** Paste the JSON into the textarea. Set the start date to today. Click "Import 90-Day Plan"
7. Wait 5–10 seconds for the import to complete. You'll be redirected to the dashboard.

---

## Section 4: Adding New Data Going Forward

### Completing Tasks Day-to-Day

- Go to `/today` every morning
- Click the checkbox next to each task as you complete it
- Use the Copy button on LinkedIn/Twitter tasks to copy the post content to your clipboard
- Use Postpone (arrow icon) if a task needs to move — enter the day number
- Use Skip if you're definitely not doing a task today

### Logging Rentlyf Work

You have two options:
- **From Today page:** Scroll to the bottom, enter hours in the "Rentlyf Hours Today" input — saves automatically to `days.rentlyf_hours` and creates a `rentlyf_logs` entry
- **From Rentlyf page:** Go to `/rentlyf`, select the date, enter hours and category, click "+ Log"

Both methods update the same underlying data.

### Adding CRM Leads

1. Go to `/crm`
2. Click "+ Add Lead"
3. Fill in: Name (required), Company, Email, Phone, Service, Deal Value, Stage (start at cold), Source, Next Follow-up date
4. Once added, move the lead through stages using the dropdown on the lead card (no need to open the edit form)

### Publishing Content

1. Plan posts in `/content` during your Sunday review
2. Set status = "scheduled" with the posting date
3. When you post, change status to "published" and add the URL
4. The Brand Hub will pick up the pillar count automatically

### Logging Income and Expenses

Every time you receive money or spend money:
1. Go to `/finance`
2. Click "+ Add Entry"
3. Fill in: Date, Type (Income/Expense), Category, Amount
4. Click Save

For Rentlyf salary: Category = "Rentlyf" (income type)  
For freelance payment: Category = "Freelance" (income type)  
For personal expenses: Any expense category

For debt payments: Use the "Log Payment" field in the Debt Countdown section — this reduces `debt_remaining` AND creates an expense entry automatically.

### Paying Off Debt

1. Go to `/finance`
2. In the Debt Countdown section, click "Edit" next to the debt total (to change total if needed)
3. Enter the amount paid in the "Log Payment" field → click the button
4. The progress bar updates and an expense entry is auto-created

### Creating Blog Posts

1. Go to `/blog`
2. Click "+ New Post"
3. Fill in: Title, Platform (blog/hashnode/dev.to/medium/personal), Status (start with "idea"), any outline notes
4. When it's published, update status to "published" and add the URL

### End of 90-Day Cycle

1. Screenshot or export your Progress page stats
2. Go to `/goals` — mark completed quarterly goals as "completed"
3. Go to `/finance` — review net balance for the cycle
4. Go to `/prompt` — generate a new 90-day plan for the next cycle
5. Import with the new start date (Day 91 = new start date)
6. After import: check `/timetable` (blocks carry over), `/goals` (add new quarterly goals), `/habits` (habits carry over)

---

*This guide reflects the app as of July 8, 2026 (v2.1). Update this document when major workflow changes are made.*
