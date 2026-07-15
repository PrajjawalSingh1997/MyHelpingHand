# docs/archived/ — Archive Manifest

All files here were moved out of active project directories. Preserved for historical reference.
**Rule**: Never delete files from this folder without explicit decision.

---

## Pre-existing batch (archived ~2026-07-08)

### GAPS_AND_IMPROVEMENTS.md
- **Original Path**: `docs/archieved/GAPS_AND_IMPROVEMENTS.md`
- **Archived**: 2026-07-08 (approx)
- **Reason**: Original 35+ gap analysis from v2.0 baseline. Superseded by `docs/FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md`
- **Still Relevant?**: No — all tracked items absorbed into active gap doc

### MASTER_IMPLEMENTATION_PLAN.md
- **Original Path**: `docs/archieved/MASTER_IMPLEMENTATION_PLAN.md`
- **Archived**: 2026-07-08 (approx)
- **Reason**: Earlier planning document; superseded by current active docs
- **Still Relevant?**: Historical reference only

### v1-reference-data.md
- **Original Path**: `docs/archieved/v1-reference-data.md`
- **Archived**: 2026-07-08 (approx)
- **Reason**: v1 (localStorage) era reference data. v2 uses Supabase.
- **Still Relevant?**: No

---

## Batch: 2026-07-15-cleanup/

### combine.mjs
- **Original Path**: `combine.mjs` (repo root)
- **Archived**: 2026-07-15
- **Reason**: One-time SQL combiner. Output already exists at `supabase/complete-database-setup.sql`.
- **Still Relevant?**: No. Re-running skips missing `seed.sql` and produces incomplete output.

### fix_data.mjs
- **Original Path**: `fix_data.mjs` (repo root)
- **Archived**: 2026-07-15
- **Reason**: One-time repair for missing DB trigger data. Trigger now works. Re-running overwrites profile.
- **Still Relevant?**: No. Contains hardcoded personal data.

### seed_api_data.mjs
- **Original Path**: `seed_api_data.mjs` (repo root)
- **Archived**: 2026-07-15
- **Reason**: One-time 90-day plan seeder. Plan already imported. Use `/prompt` page for future imports.
- **Still Relevant?**: No. Re-running inserts duplicate cycle row.

### setup.mjs
- **Original Path**: `setup.mjs` (repo root)
- **Archived**: 2026-07-15
- **Reason**: One-time bootstrapper (6 steps). DB fully set up. Contains hardcoded default password. References schema fields that no longer exist.
- **Still Relevant?**: No. Dangerous if re-run.

### walkthrough-v1.md
- **Original Path**: `docs/walkthroughof helping hand`
- **Archived**: 2026-07-15
- **Reason**: v1-era walkthrough describing localStorage sync hooks. No longer reflects v2 (Supabase) architecture.
- **Still Relevant?**: No. Actively misleading for v2 codebase.

### personal-90day-tasks-v1
- **Original Path**: `docs/9.1personal_90day_tasks`
- **Archived**: 2026-07-15
- **Reason**: Personal planning file, not technical documentation. No extension, non-standard naming.
- **Still Relevant?**: Historical personal reference only.

---

## Batch: 2026-07-16-doc-consolidation/

Superseded by the audited, verified-against-source set in `docs/IndustryDoc/` (`SRS_LifeOS.md`, `LLD_LifeOS.md`, `USER_GUIDE_LifeOS.md`, `DIRECTORY_MAP.md`) plus the new `docs/OPEN_ISSUES.md`. Full rationale for each file: `docs/CODEBASE_AUDIT.md` §4.

### FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md
- **Original Path**: `docs/FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md`
- **Archived**: 2026-07-16
- **Reason**: 36-item gap tracker; several "open" items were already fixed in the working tree, uncommitted, at time of archiving. Replaced by `docs/OPEN_ISSUES.md`.
- **Still Relevant?**: No — historical snapshot only.

### HOW_TO_RUN.md
- **Original Path**: `docs/HOW_TO_RUN.md`
- **Archived**: 2026-07-16
- **Reason**: Referenced migration files that no longer exist (`002_life_os_enhancements.sql`, `003_habits_brand_growth.sql`) and was missing 2 of 4 required env vars. Setup instructions folded into `README.md`.
- **Still Relevant?**: No.

### HOW_TO_USE_AND_MIGRATE.md
- **Original Path**: `docs/HOW_TO_USE_AND_MIGRATE.md`
- **Archived**: 2026-07-16
- **Reason**: Daily-workflow half duplicated `IndustryDoc/USER_GUIDE_LifeOS.md` Part 4; v1→v2 migration half described a migration finished months ago from a codebase that no longer exists.
- **Still Relevant?**: No.

### LAUNCH_PLAN.md
- **Original Path**: `docs/LAUNCH_PLAN.md`
- **Archived**: 2026-07-16
- **Reason**: v2.1 feature checklist — every item on it was already shipped in live code.
- **Still Relevant?**: No.

### LIFE_OS_USER_GUIDE.md
- **Original Path**: `docs/LIFE_OS_USER_GUIDE.md`
- **Archived**: 2026-07-16
- **Reason**: Self-superseded — `DIRECTORY_MAP.md` already listed this as replaced by `IndustryDoc/USER_GUIDE_LifeOS.md`.
- **Still Relevant?**: No.

### PROJECT_FILE_MAP.md
- **Original Path**: `docs/PROJECT_FILE_MAP.md`
- **Archived**: 2026-07-16
- **Reason**: Self-superseded — described deleted v1 files (`use-sync.ts`, `lib/export.ts`, `lib/storage.ts`); replaced by `IndustryDoc/DIRECTORY_MAP.md`.
- **Still Relevant?**: No.

### V1_VS_V2_USER_CHANGES.md
- **Original Path**: `docs/V1_VS_V2_USER_CHANGES.md`
- **Archived**: 2026-07-16
- **Reason**: v1-to-v2 comparison; v1 no longer exists in this repo to compare against.
- **Still Relevant?**: Historical reference only.

### VERSION_CHANGELOG.md
- **Original Path**: `docs/VERSION_CHANGELOG.md`
- **Archived**: 2026-07-16
- **Reason**: Frozen changelog, not kept current as its own header required; login-workflow section superseded by `IndustryDoc/LLD_LifeOS.md` §3.
- **Still Relevant?**: Historical reference only.

### apply-migrations-2026-07-16.mjs
- **Original Path**: `scripts/apply-migrations-2026-07-16.mjs`
- **Archived**: 2026-07-16
- **Reason**: One-time script — connected via `DATABASE_URL` (pooler connection; the direct `db.*.supabase.co` host is IPv6-only) and applied migrations 003-006 directly to production. Ran successfully; verified `goals.previous_status`, `finance_entries.is_debt_payment`, `habits`, and `brand_metrics` all exist post-run.
- **Still Relevant?**: No — migrations 003-006 are now applied. Re-running is harmless (every statement in those files is idempotent) but unnecessary.

---

## Batch: 2026-07-16-account-repair/

Diagnostic + one-time repair scripts for a real account-provisioning gap found while verifying data: `prajjawalsingh1997@gmail.com`'s `on_auth_user_created` trigger never fully completed at signup (2026-06-30) — `user_profiles` and `timetable_plans` had zero rows, even though `user_settings` and `user_module_settings` were populated correctly. This silently broke once the admin-auth fix (see `CODEBASE_AUDIT.md` §2.1) switched to reading `user_profiles.role` — there was no row to read.

### check-my-data.mjs, check-profile.mjs, check-trigger.mjs, check-full-account.mjs
- **Archived**: 2026-07-16 — read-only diagnostic scripts used to find the above, and to compare `seed-my-data.sql`'s expected content against what was actually in the database (0 of 29 goals, 0 of 25 blog posts, 0 of 8 learning resources were present — the seed file had never been run).
- **Still Relevant?**: No — findings captured here and in `docs/OPEN_ISSUES.md`.

### repair-account.mjs
- **Reason**: Backfilled the missing `user_profiles` row (`role='super_admin'`) and the three default `timetable_plans` (A/B/C), using the exact same default content the trigger would have inserted. Ran successfully.
- **Still Relevant?**: No.

### apply-seed-data-2026-07-16.mjs
- **Reason**: Applied `supabase/seed-my-data.sql` to production for the first time. Required two follow-up fixes to the seed file itself (enum casts — `content_post_status`, `goal_type`, `goal_status`, `learning_status` — needed explicit casting when inserting via `SELECT ... FROM (VALUES ...)` instead of a plain `INSERT ... VALUES`). Verified 29/29 goals, 25/25 blog posts, 8/8 learning resources.
- **Still Relevant?**: No — `seed-my-data.sql` itself remains in `supabase/` as the corrected, re-run-safe source.

### reimport-90day-plan.mjs
- **Reason**: The live 90-day cycle still had the old `start_date: 2026-07-11` baked in — the `my-90-day-plan.json` date shift done earlier that day was only applied to the local file, never re-imported. This script deactivated the old cycle (data preserved, not deleted) and imported the corrected one, mirroring exactly what `/prompt`'s "Full 90-Day" import does. Verified: new cycle starts 2026-07-16, 90 days, 407 tasks.
- **Still Relevant?**: No.

## Relocated (not archived)

### developer_growth_engine.md → docs/personal/growth-engine.md
- **Moved**: 2026-07-16
- **Reason**: Not application documentation — it's a personal LinkedIn/GitHub/freelance content-and-career plan. Still live/active content, so relocated rather than archived, out of the technical-docs path.
