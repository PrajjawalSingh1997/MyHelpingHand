-- Migration 005: Add is_debt_payment flag to finance_entries
-- Gap M3 from docs/FINAL_GAPS_AND_IMPLEMENTATION_PLAN.md
-- Applied: 2026-07-15 in Supabase SQL Editor

ALTER TABLE finance_entries ADD COLUMN IF NOT EXISTS is_debt_payment BOOLEAN DEFAULT false;
