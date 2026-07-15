# How to Run Life OS (MyHelpingHand)

**App:** Life OS v2.1  
**Stack:** Next.js 16, React 19, TypeScript, Supabase, Tailwind CSS 4  
**Deployed at:** https://my-helping-hand.vercel.app

---

## 1. Prerequisites

Before starting, make sure you have:

| Tool | Required Version | Check |
|------|-----------------|-------|
| Node.js | 20.x or later | `node --version` |
| npm | 10.x or later | `npm --version` |
| Git | Any recent version | `git --version` |
| Supabase account | Free tier is fine | supabase.com |
| Vercel account (for deployment) | Free tier | vercel.com |

---

## 2. Local Development

### Step 1 — Clone the repo

```bash
git clone https://github.com/prajjawalsingh1997/MyHelpingHand.git
cd MyHelpingHand
```

### Step 2 — Install dependencies

```bash
npm install
```

### Step 3 — Create your environment file

Create a file called `.env.local` in the project root:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
```

To find these values:
1. Go to [supabase.com](https://supabase.com) → select your project
2. Settings → API
3. Copy "Project URL" → paste as `NEXT_PUBLIC_SUPABASE_URL`
4. Copy "anon public" key → paste as `NEXT_PUBLIC_SUPABASE_ANON_KEY`

> Never commit `.env.local` to git. It is already in `.gitignore`.

### Step 4 — Set up the database

Run all migrations in the Supabase SQL Editor in order:

1. Go to Supabase → SQL Editor
2. Click "+ New query"
3. Open and paste each file, then click "Run":

```
supabase/migrations/001_initial_schema.sql
supabase/migrations/002_add_debt_total.sql
supabase/migrations/003_habits_brand_growth.sql
```

Then run the seed file to populate the `modules` table:

```bash
# Paste contents of supabase/seed.sql into Supabase SQL Editor and run
```

> IMPORTANT: Also run this SQL to add the missing Habits module (not in seed.sql):
> ```sql
> INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
> VALUES ('Habits', 'habits', 'Daily habit tracker and streaks', 'CheckSquare', true, 15)
> ON CONFLICT (slug) DO NOTHING;
> ```

### Step 5 — Configure Supabase Auth

1. Supabase → Authentication → URL Configuration
2. Set "Site URL" to `http://localhost:3000`
3. Add to "Redirect URLs": `http://localhost:3000/**`

### Step 6 — Start the development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

The app will redirect to `/login` if you are not signed in.

---

## 3. Essential First-Run Setup

Once you are logged in for the first time, do these steps in order:

**Step 1 — Set yourself as super_admin** (run in Supabase SQL Editor):

```sql
-- Replace with your actual Supabase user ID (find it in Auth → Users)
UPDATE user_profiles
SET role = 'super_admin'
WHERE id = 'your-user-id-here';
```

**Step 2 — Set your debt total** — Go to `/settings` → Finance Configuration → enter your current debt amount.

**Step 3 — Fill in profile** — Go to `/settings` → Profile. Enter your display name, bio, timezone (Asia/Kolkata), and social links.

**Step 4 — Configure timetable** — Go to `/timetable`. Add your Plan A, B, and C time blocks.

**Step 5 — Import your first 90-day plan** — Go to `/prompt`. Follow the 3-step wizard to generate and import your plan.

---

## 4. Deploy to Vercel

### Step 1 — Push to GitHub

```bash
git add .
git commit -m "ready to deploy"
git push origin main
```

### Step 2 — Create Vercel project

1. Go to [vercel.com](https://vercel.com) → "New Project"
2. Import your GitHub repository (`MyHelpingHand`)
3. Framework preset: **Next.js** (auto-detected)
4. Click "Deploy" — let the first deploy fail (we need to add env vars)

### Step 3 — Add environment variables

In Vercel → Project → Settings → Environment Variables:

| Name | Value | Environments |
|------|-------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | your Supabase project URL | Production, Preview, Development |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | your Supabase anon key | Production, Preview, Development |

### Step 4 — Update Supabase redirect URLs

1. Supabase → Authentication → URL Configuration
2. Set "Site URL" to your Vercel URL (e.g., `https://my-helping-hand.vercel.app`)
3. Add to "Redirect URLs": `https://my-helping-hand.vercel.app/**`

### Step 5 — Redeploy

In Vercel → Deployments → click "..." on the latest → "Redeploy".

The app will be live at your Vercel URL.

---

## 5. Common Issues

| Problem | Likely Cause | Fix |
|---------|-------------|-----|
| Login redirect loops | Supabase Site URL not set | Set Site URL in Supabase Auth settings |
| Page loads but shows blank / spinner forever | Missing env vars | Check that `.env.local` exists and has both Supabase keys |
| "relation does not exist" error in console | Migrations not run | Run all 3 migration files in Supabase SQL Editor |
| Sidebar shows no modules | `modules` table empty or `user_module_settings` not populated | Re-run `seed.sql`; check that signup trigger ran correctly |
| Habits page exists but sidebar link missing | Habits row missing from `modules` table | Run the Habits INSERT SQL (see Step 4 of Local Setup) |
| 500 error on `/admin` | `user_profiles.role` not set to `super_admin` | Run the UPDATE user_profiles SQL in Step 1 of First-Run Setup |

---

## 6. Useful Commands

```bash
# Start local dev server (hot reload)
npm run dev

# Build for production (runs type checking + compilation)
npm run build

# Start production build locally (test before deploying)
npm run start

# Run TypeScript type checker only (no emit)
npx tsc --noEmit

# Run ESLint on all source files
npx eslint src --ext .ts,.tsx

# Check which version of Next.js is installed
npm list next
```

---

## 7. Project Structure Quick Reference

```
MyHelpingHand/
├── src/
│   ├── app/
│   │   ├── (auth)/          # Login, signup pages (no sidebar)
│   │   └── (dashboard)/     # All app pages (with sidebar)
│   │       ├── page.tsx          → Dashboard (/)
│   │       ├── today/page.tsx    → Today's tasks
│   │       ├── habits/page.tsx   → Habit tracker
│   │       ├── brand/page.tsx    → Brand Hub
│   │       ├── finance/page.tsx  → Finance tracker
│   │       ├── health/page.tsx   → Health logger
│   │       ├── goals/page.tsx    → Goals tracker
│   │       ├── crm/page.tsx      → CRM leads
│   │       ├── content/page.tsx  → Content calendar
│   │       ├── blog/page.tsx     → Blog manager
│   │       ├── prompt/page.tsx   → Plan import wizard
│   │       ├── settings/page.tsx → User settings
│   │       └── layout.tsx        → Dashboard shell (sidebar + theme)
│   ├── components/
│   │   ├── layout/sidebar.tsx    → Navigation sidebar
│   │   └── ui/                   → Shared UI components (button, toast, etc.)
│   ├── hooks/
│   │   ├── use-day.ts            → Task toggle/skip/add/postpone
│   │   └── use-active-cycle.ts   → Current 90-day cycle state
│   ├── lib/
│   │   └── supabase/             → Supabase client (browser + server + middleware)
│   └── types/
│       └── database.ts           → All Supabase table types (Row/Insert/Update)
├── supabase/
│   ├── migrations/               → SQL migration files (run in order)
│   └── seed.sql                  → Module rows for initial setup
├── middleware.ts                 → Session refresh + admin role guard
└── package.json                  → Next.js 16.2.1, React 19, Supabase SSR
```

---

*Last updated: July 8, 2026*
