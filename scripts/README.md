# scripts/

Utility scripts for the Life OS project. Run from the project root using:
```bash
node scripts/<script-name>.mjs
```
All scripts use `dotenv` to load `.env.local`.

## Active Scripts
(None currently — add future scripts here)

## Archived Scripts
The following scripts were used during initial setup and archived:

| Script | Purpose | Status |
|--------|---------|--------|
| `combine.mjs` | Combined SQL migrations into one file | ✅ Already ran — output at `supabase/complete-database-setup.sql` — `docs/archived/2026-07-15-cleanup/` |
| `fix_data.mjs` | One-time trigger data repair | ✅ Already applied — `docs/archived/2026-07-15-cleanup/` |
| `seed_api_data.mjs` | Initial 90-day plan seeder | ✅ Already ran — use `/prompt` page for future imports — `docs/archived/2026-07-15-cleanup/` |
| `setup.mjs` | Full project bootstrapper | ✅ Already ran — DB fully set up — `docs/archived/2026-07-15-cleanup/` |
| `apply-migrations-2026-07-16.mjs` | Applied migrations 003-006 directly via `DATABASE_URL` (pooler connection) | ✅ Ran 2026-07-16 — `docs/archived/2026-07-16-doc-consolidation/` |
