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

## Currently open

Real absences, not bugs — nothing here silently breaks, the features just don't exist yet.

- **No account-deletion flow.** Only removable via the Supabase dashboard (Authentication → Users). Cascading deletes depend on `ON DELETE CASCADE` being set on every foreign key — not independently re-verified.
- **No offline support / PWA.** The app requires a live network connection; no service worker or manifest.
- **No recurring tasks or goal↔task linking.** Tasks and goals are independent; completing a task never updates a goal's `current_value`.
- **No in-app notifications.** `user_settings.daily_reminder_time` is stored but nothing reads it — the Settings UI already discloses this next to the field.

## How to add an item here

Confirm it by reading the file and line that proves it (not by inference from another doc), then add one bullet: what's missing, where you looked, and whether it's a bug (something should work and doesn't) or an absence (nothing promises this exists yet).
