import fs from 'fs';
import path from 'path';

const files = [
  'supabase/schema.sql',
  'supabase/migrations/002_life_os_enhancements.sql',
  'supabase/migrations/003_habits_brand_growth.sql',
  'supabase/seed.sql'
];

let combined = '-- ================================================================\n';
combined += '-- MASTER DATABASE SETUP SCRIPT\n';
combined += '-- Run this once in the Supabase SQL Editor\n';
combined += '-- ================================================================\n\n';

combined += '-- Reset the public schema for a clean slate\n';
combined += 'DROP SCHEMA public CASCADE;\n';
combined += 'CREATE SCHEMA public;\n';
combined += 'GRANT ALL ON SCHEMA public TO postgres;\n';
combined += 'GRANT ALL ON SCHEMA public TO public;\n\n';

for (const file of files) {
  if (fs.existsSync(file)) {
    combined += `\n\n-- >>> SOURCE: ${file} <<<\n\n`;
    combined += fs.readFileSync(file, 'utf8');
  }
}

// Add the extra snippet
combined += `\n\n-- >>> EXTRA SNIPPET: Add Habits Module <<<\n\n`;
combined += `
INSERT INTO modules (name, slug, description, icon, is_default, sort_order)
VALUES ('Habits', 'habits', 'Daily habit tracker and streaks', 'CheckSquare', true, 15)
ON CONFLICT (slug) DO NOTHING;
`;

fs.writeFileSync('supabase/complete-database-setup.sql', combined);
console.log('Combined SQL created at supabase/complete-database-setup.sql');
