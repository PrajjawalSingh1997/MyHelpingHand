-- Migration 002: Life OS enhancements
-- Run this in Supabase SQL Editor

-- Add debt_total to user_settings (defaults to 80000 to match old hardcode)
ALTER TABLE user_settings
  ADD COLUMN IF NOT EXISTS debt_total NUMERIC(10,2) DEFAULT 80000;

-- Update any existing rows that have a debt_remaining but no debt_total set yet
UPDATE user_settings
  SET debt_total = 80000
  WHERE debt_total IS NULL OR debt_total = 0;
