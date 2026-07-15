# 🚀 Life OS (MyHelpingHand)

A personal life operating system built on a **90-Day Developer Growth Engine**. Track goals, habits, finances, CRM leads, health, learning, content, freelance work, and more — all in one cloud-synced dashboard.

**Live:** [my-helping-hand.vercel.app](https://my-helping-hand.vercel.app) — responsive down to phone-sized screens; add it to your home screen from Safari/Chrome for an app-like shortcut.

## ✨ Modules (18 + Admin)

| Module | Purpose |
|--------|---------|
| 🏠 **Dashboard** | Cycle progress, streak, 90-day heatmap, quick access |
| 📅 **Today / Day** | Deep-dive into any specific day's tasks |
| 🗓️ **Calendar** | Month-view of days with completion indicators |
| 📊 **Progress** | Completion charts, category breakdown, Growth Tracker, weekly review |
| ⏰ **Timetable** | Plan A/B/C daily schedules with block-level check-ins |
| 🎯 **Goals** | Life, annual, quarterly, and monthly goal tracking |
| 💪 **Health** | Exercise, yoga, water, sleep, mood logs |
| 💰 **Finance** | Income/expense ledger + debt payoff countdown |
| 📞 **CRM** | Lead pipeline, cold call log, follow-up tracking |
| 📝 **Blog** | Long-form post manager (Hashnode/dev.to/Medium/personal) |
| ✍️ **Content** | Social content calendar with pillars (LinkedIn/Twitter/Instagram/YouTube/newsletter) |
| 📚 **Learning** | Course and resource tracker |
| 🤝 **Freelance** | Project tracker with budget and payment progress |
| 🏢 **Rentlyf** | Work-hour logger, grouped by week |
| ✅ **Habits** | Daily habit tracker with streaks |
| 🏗️ **Brand** | LinkedIn brand strategy, metrics, and daily actions |
| 🤖 **Prompt** | AI-assisted 90-day cycle generation and import |
| ⚙️ **Settings** | Profile, preferences, finance config, password, data export |
| 🔐 **Admin** | User & module management (`super_admin` role only) |

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16.2.1 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS v4 |
| Backend | Supabase (PostgreSQL + Auth + RLS) |
| Charts | Recharts |
| Icons | Lucide React |

## 📖 Documentation

Full technical documentation lives in [`docs/IndustryDoc/`](docs/IndustryDoc/):

| Doc | Answers |
|-----|---------|
| [`SRS_LifeOS.md`](docs/IndustryDoc/SRS_LifeOS.md) | What must the app do? |
| [`LLD_LifeOS.md`](docs/IndustryDoc/LLD_LifeOS.md) | How is it actually built? |
| [`USER_GUIDE_LifeOS.md`](docs/IndustryDoc/USER_GUIDE_LifeOS.md) | How do I use it? |
| [`DIRECTORY_MAP.md`](docs/IndustryDoc/DIRECTORY_MAP.md) | Where does everything live, and where do new things go? |

Currently open, verified issues (not aspirational — only things confirmed by reading source): [`docs/OPEN_ISSUES.md`](docs/OPEN_ISSUES.md). Historical documents: [`docs/archived/`](docs/archived/).

## 🚀 Getting Started

### 1. Install and configure

```bash
npm install
cp .env.local.example .env.local   # then fill in the values below
```

`.env.local` needs three values, all from your Supabase project (**Project Settings → API**):

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key   # required for the Admin Panel; server-only, never commit
```

### 2. Set up the database

In the Supabase SQL Editor, run once, in order:

1. `supabase/complete-database-setup.sql` — baseline schema (tables, enums, RLS, triggers, seeded modules)
2. Every file in `supabase/migrations/`, in filename order (`003_...` → `004_...` → `005_...` → `006_...`) — each is safe to re-run

### 3. Promote yourself to admin

Find your user UUID in Supabase → **Authentication → Users**, then run:

```sql
UPDATE user_profiles SET role = 'super_admin' WHERE id = 'your-user-uuid';
```

Admin access is entirely database-driven via `user_profiles.role` — there is no admin-email environment variable.

### 4. Run it

```bash
npm run dev     # http://localhost:3000
npm run build   # production build, also runs the TypeScript check
npm run start   # serve the production build locally
```

The app redirects to `/login` until you sign up and confirm your email.

## 📁 Project Structure

```
src/
├── app/
│   ├── (auth)/          → login, signup — no sidebar
│   ├── (dashboard)/     → 18 module pages, all behind auth
│   └── api/admin/       → the one server route (uses the service role key)
├── components/          → layout/ (sidebar, top bar) and ui/ (toast, empty state)
├── hooks/                → use-cycle, use-day
├── lib/                  → Supabase clients, data export, utils
└── types/database.ts     → every Supabase table's Row/Insert/Update types
supabase/
├── complete-database-setup.sql   → baseline schema (reference snapshot)
└── migrations/                    → active migration history, run in filename order
```

Full breakdown: [`docs/IndustryDoc/DIRECTORY_MAP.md`](docs/IndustryDoc/DIRECTORY_MAP.md).

## 💾 Data Storage

All data is stored in **Supabase** (PostgreSQL) with Row Level Security (RLS) — every table is scoped to `auth.uid()`, so one user can never read another's data. Authentication is Supabase Auth (email + password); the app is fully cloud-synced and has no offline/localStorage fallback.

## ☁️ Deployment

Deployed on **Vercel** at [my-helping-hand.vercel.app](https://my-helping-hand.vercel.app), auto-deploying from the `main` branch. In Vercel → Project → Settings → Environment Variables, set the same three variables as `.env.local` (Production + Preview), then set Supabase Auth's **Site URL** and **Redirect URLs** to your Vercel domain.

For direct database access (one-off scripts, migrations run outside the SQL Editor), Supabase's `Connect` dialog offers a **direct connection** (IPv6-only) and a **pooler connection** (IPv4-compatible, works from any network) — use the pooler string for `DATABASE_URL` unless you know your network has IPv6 out.

## 👤 Author

**Prajjawal Singh**

---

Built as part of the 90-Day Developer Growth Engine 🌱
