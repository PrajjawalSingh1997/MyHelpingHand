# scripts/

Utility scripts for the Life OS project. Run from the project root using:
```bash
node scripts/<script-name>.mjs
```
All scripts use `dotenv` to load `.env.local`.

## Active Scripts
(None currently — add future scripts here)

## Archived Scripts
The following scripts were used during initial setup and archived to `docs/archived/2026-07-15-cleanup/`:

| Script | Purpose | Status |
|--------|---------|--------|
| `combine.mjs` | Combined SQL migrations into one file | ✅ Already ran — output at `supabase/complete-database-setup.sql` |
| `fix_data.mjs` | One-time trigger data repair | ✅ Already applied |
| `seed_api_data.mjs` | Initial 90-day plan seeder | ✅ Already ran — use `/prompt` page for future imports |
| `setup.mjs` | Full project bootstrapper | ✅ Already ran — DB fully set up |
