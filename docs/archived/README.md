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

---

## Relocated (not archived)

### developer_growth_engine.md → docs/personal/growth-engine.md
- **Moved**: 2026-07-16
- **Reason**: Not application documentation — it's a personal LinkedIn/GitHub/freelance content-and-career plan. Still live/active content, so relocated rather than archived, out of the technical-docs path.
