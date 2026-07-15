# Life OS — Directory Map

## Section 1: Repository Root
- `middleware.ts` (2,090 bytes) — Auth guard: refreshes Supabase session, redirects unauthenticated users to `/login`, redirects logged-in users away from auth pages, enforces `super_admin` role check for `/admin` via `user_profiles.role` DB query
- `next.config.ts` — Standard Next.js SSR config for Vercel
- `tsconfig.json` — TypeScript config; `@/*` path alias → `src/`
- `package.json` — Next.js 16.2.1, React 19, Supabase, TailwindCSS v4, Recharts, Framer Motion, Zustand
- `eslint.config.mjs` — ESLint with `eslint-config-next`
- `postcss.config.mjs` — PostCSS for TailwindCSS v4
- `.env.local` — NOT committed; required keys: `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (admin status is DB-driven via `user_profiles.role`, no admin-email env var)
- `.env.local.example` — Safe template (198 bytes)
- `.gitignore` — Excludes: `.env*.local`, `.next/`, `node_modules/`, `*.tsbuildinfo`, `supabase/admin-seed.sql`, `supabase/seed-my-data.sql`, `supabase/my-90-day-plan.json`
- `.reticle.json` — Reticle SDK dev tooling config
- `.mcp.json` — MCP/Claude Code dev config
- `README.md` — Project overview
- `next-env.d.ts` — Auto-generated Next.js TypeScript declarations (do not edit)

## Section 2: `src/app/` — Next.js App Router
- `layout.tsx` — Root HTML shell (Inter font, dark class, ReticleDev in dev mode)
- `globals.css` — Global CSS resets and TailwindCSS base layer
- `reticle-dev.tsx` — Dev-only Reticle SDK registration component
- `favicon.ico` — Site favicon
- `(auth)/` — Auth route group (no sidebar, centered card layout)
  - `layout.tsx`, `login/page.tsx`, `signup/page.tsx`
- `auth/callback/route.ts` — OAuth/magic-link code exchange handler
- `api/admin/users/route.ts` — Only server-side API route; lists users via service role key
- `(dashboard)/` — Protected route group (requires auth, renders sidebar + topbar)
  - `layout.tsx` — Fetches user profile, enabled modules, theme in parallel; renders shell
  - 19 module pages: `admin`, `blog`, `brand`, `calendar`, `content`, `crm`, `day`, `finance`, `freelance`, `goals`, `habits`, `health`, `learning`, `progress`, `prompt`, `rentlyf`, `settings`, `timetable`, `today`

## Section 3: `src/components/`
- `layout/sidebar.tsx` — Fixed 240px sidebar; `SLUG_HREF` map; `ICON_MAP`; admin link conditional
- `layout/top-bar.tsx` — Display name top bar
- `ui/empty-cycle.tsx` — Reusable empty state for Dashboard/Today/Calendar/Progress
- `ui/toast.tsx` — `ToastProvider` + `useToast()` hook; auto-dismiss 3s

## Section 4: `src/hooks/`
- `use-cycle.ts` — `useActiveCycle()` with `currentDay` calculation
- `use-day.ts` — `useDay(dayNumber, cycleId?)` with all task mutation functions

## Section 5: `src/lib/`
- `supabase/client.ts` — Browser Supabase client (anon key)
- `supabase/server.ts` — Server Supabase client (cookie-based, async)
- `utils.ts` — `cn()` class merge utility
- `export.ts` — Data export utility (planned/missing)

## Section 6: `src/types/`
- `database.ts` — Complete Supabase type definitions for all 22 tables + enum types

## Section 7: `supabase/`
- `complete-database-setup.sql` (27,489 bytes) — Legacy combined SQL snapshot from initial setup; kept for reference only — do NOT use to apply schema changes anymore
- `seed-my-data.sql` — Personal data seed; excluded from git
- `my-90-day-plan.json` (118,865 bytes) — Current 90-day plan; excluded from git

- `generate-plan.mjs` (28,724 bytes) — Local plan JSON generator
- `migrations/` — **Active migration folder.** All schema changes MUST be written here as numbered `.sql` files before being applied anywhere. Format: `[NNN]_[description].sql` (e.g. `006_add_blog_tags.sql`). This folder is the single source of truth for the database schema history.

## Section 8: `docs/`
- `IndustryDoc/` — Formal SRS, LLD, User Guide, Directory Map
- `FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md` — Active gap tracker (July 2026)
- `PROJECT_FILE_MAP.md` — File-level descriptions
- `LAUNCH_PLAN.md` — Feature implementation tracker
- `VERSION_CHANGELOG.md` — v1 vs v2 changelog
- `V1_VS_V2_USER_CHANGES.md` — Module-by-module comparison
- `HOW_TO_RUN.md` — Local dev and Vercel setup instructions
- `HOW_TO_USE_AND_MIGRATE.md` — Personal usage workflow
- `LIFE_OS_USER_GUIDE.md` — Full user guide (superseded by `docs/IndustryDoc/USER_GUIDE_LifeOS.md`)
- `developer_growth_engine.md` — Developer reference
- `archived/` — Historical/superseded documents (see `archived/README.md`)
- `scripts/` — Proper home for future utility scripts

## Section 9: "Where Do I Put X?" Quick Reference Table

| Type of file | Where it goes |
|---|---|
| New Next.js page | `src/app/(dashboard)/[module-name]/page.tsx` |
| New auth page | `src/app/(auth)/[page-name]/page.tsx` |
| New API route | `src/app/api/[route]/route.ts` |
| New reusable component | `src/components/ui/` or `src/components/layout/` |
| New custom hook | `src/hooks/use-[name].ts` |
| New Supabase table type | Add to `src/types/database.ts` |
| New utility function | `src/lib/utils.ts` or new `src/lib/[name].ts` |
| One-time setup script | `scripts/[name].mjs` (then archive to `docs/archived/` after use) |
| SQL migration | Create `supabase/migrations/[NNN]_[description].sql` first, then run it via Supabase CLI (`supabase db push`) or paste into SQL Editor — the file is always written first |
| SQL seed data | `supabase/seed.sql` (or a named seed file in `supabase/`) |
| Technical documentation | `docs/` (with descriptive UPPERCASE filename) |
| Industry-level docs (SRS/LLD) | `docs/IndustryDoc/` |
| Completed/obsolete docs | `docs/archived/[YYYY-MM-DD-batch]/` |
| Environment variables | `.env.local` (never commit — add key to `.env.local.example`) |

## Section 10: What NOT to Put at the Repository Root
Explicit list of file types that must NOT live at repo root:
- `.mjs` or `.cjs` scripts (→ `scripts/`)
- One-time SQL files (→ `supabase/`)
- Personal data files (→ `supabase/` or excluded from git)
- Test result JSON files
- Auto-generated build files (`*.tsbuildinfo`, `*.d.ts` from tsc)
- Scratch/temp files
