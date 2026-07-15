# Open Issues

**Rule for this file:** only add or close an item after reading the actual source that proves it — never from a planning conversation. Keep it short. When it gets long again, that's a signal to fix things, not to reorganize the list.

Full audit history: `docs/CODEBASE_AUDIT.md`. Superseded planning docs: `docs/archived/2026-07-16-doc-consolidation/`.

---

## Fixed 2026-07-16

These were real, verified issues, closed in the pre-deployment pass:

- **Admin access had two disagreeing gates.** `middleware.ts` checked `user_profiles.role`, while the sidebar, `/admin` page, and `/api/admin/users` checked `NEXT_PUBLIC_ADMIN_EMAIL`. Unified on `user_profiles.role` everywhere; the env var is no longer used by the app.
- **`.env.local.example` was missing required variables.** Now lists all variables the app actually reads.
- **No data export existed.** Settings page now has an "Export My Data" button — downloads every user-owned table as one JSON file, client-side, no new backend.
- **Un-completing a goal always reset it to `not_started`**, discarding whatever status it had before. `goals.previous_status` now stores it and restores it on un-toggle.
- **Habits module missing from `modules` table, debt-payment/expense sync, CRM overdue follow-up alert** — these were already fixed in the working tree as of the audit, just uncommitted; this pass commits them (see `migrations/004`, `migrations/005`, `finance/page.tsx`, `crm/page.tsx`). Forgot-password (`(auth)/login/page.tsx`) turned out to already be committed as of the prior commit, not actually pending — the audit's wording conflated the two.
- **Sidebar had zero mobile handling.** Fixed 240px width, no collapse, no way to hide it — on a phone it ate most of the screen. Now an off-canvas drawer under the `md:` breakpoint with a hamburger toggle; summary-card grids and form rows across every CRUD page now reflow instead of overflowing.
- **The `prajjawalsingh1997@gmail.com` account was missing `user_profiles` and `timetable_plans` rows entirely** — the `on_auth_user_created` trigger never fully completed at signup (2026-06-30). `docs/archived/2026-07-15-cleanup/fix_data.mjs` claimed to have already patched this; verified 2026-07-16 that it hadn't. This silently became a live bug the moment admin access moved to reading `user_profiles.role` (previous item in this list) — there was no row to read, so admin access broke for the one account that needed it. Backfilled via `docs/archived/2026-07-16-account-repair/repair-account.mjs`, using the same defaults the trigger would have created. **If any other account was created the same way, it likely has the same gap** — the trigger itself has not been fixed, only this one account's data was patched. Worth checking `SELECT id FROM auth.users WHERE id NOT IN (SELECT id FROM user_profiles)` if more users sign up.
- **`supabase/seed-my-data.sql` had never actually been run.** Zero of its 29 goals / 25 blog post ideas / 8 learning resources existed in the database despite the file existing and being referenced as done. Applied 2026-07-16 — also had to add explicit enum casts (`content_post_status`, `goal_type`, `goal_status`, `learning_status`) since its rewritten anti-join `INSERT ... SELECT ... FROM (VALUES ...)` form doesn't get the same implicit casting a plain `INSERT ... VALUES` gets.
- **The live 90-day cycle had the wrong start date.** A local fix shifted `my-90-day-plan.json`'s `start_date` from `2026-07-11` to `2026-07-16`, but that was never re-imported — the database still had the old cycle, showing "Day 6" instead of "Day 1". Re-imported via `reimport-90day-plan.mjs` (old cycle deactivated, not deleted).

## Currently open

Real absences, not bugs — nothing here silently breaks, the features just don't exist yet.

- **No account-deletion flow.** Only removable via the Supabase dashboard (Authentication → Users). Cascading deletes depend on `ON DELETE CASCADE` being set on every foreign key — not independently re-verified.
- **No offline support / PWA.** The app requires a live network connection; no service worker or manifest.
- **No recurring tasks or goal↔task linking.** Tasks and goals are independent; completing a task never updates a goal's `current_value`.
- **No in-app notifications.** `user_settings.daily_reminder_time` is stored but nothing reads it — the Settings UI already discloses this next to the field.

## How to add an item here

Confirm it by reading the file and line that proves it (not by inference from another doc), then add one bullet: what's missing, where you looked, and whether it's a bug (something should work and doesn't) or an absence (nothing promises this exists yet).
