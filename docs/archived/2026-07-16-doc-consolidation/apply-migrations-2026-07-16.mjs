// One-time script: apply migrations 003-006 directly to the live Supabase database.
// Run: node scripts/apply-migrations-2026-07-16.mjs
// Archive to docs/archived/ after running — see scripts/README.md convention.
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const DATABASE_URL = process.env.DATABASE_URL
if (!DATABASE_URL) {
  console.error('DATABASE_URL missing in .env.local')
  process.exit(1)
}

const sql = postgres(DATABASE_URL, { ssl: 'require' })

const files = [
  'supabase/migrations/003_missing_tables_and_columns.sql',
  'supabase/migrations/004_add_habits_module.sql',
  'supabase/migrations/005_finance_debt_payment_flag.sql',
  'supabase/migrations/006_goals_previous_status.sql',
]

async function run() {
  for (const file of files) {
    const filePath = path.resolve(process.cwd(), file)
    const query = fs.readFileSync(filePath, 'utf8')
    console.log(`\n--- Applying ${file} ---`)
    await sql.unsafe(query)
    console.log(`OK: ${file}`)
  }

  console.log('\n--- Verification ---')
  const debtFlag   = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='finance_entries' AND column_name='is_debt_payment'`
  const prevStatus = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='goals' AND column_name='previous_status'`
  const debtTotal  = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='user_settings' AND column_name='debt_total'`
  const exerciseMin= await sql`SELECT column_name FROM information_schema.columns WHERE table_name='health_logs' AND column_name='exercise_minutes'`
  const weeklyRev  = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='user_settings' AND column_name='weekly_review_checks'`
  const pillar     = await sql`SELECT column_name FROM information_schema.columns WHERE table_name='content_posts' AND column_name='pillar'`
  const habitsTbl  = await sql`SELECT to_regclass('public.habits') AS reg`
  const brandTbls  = await sql`SELECT to_regclass('public.brand_metrics') AS reg`
  const modules    = await sql`SELECT slug, sort_order, is_default FROM modules WHERE slug IN ('habits','brand') ORDER BY slug`

  console.log('finance_entries.is_debt_payment exists:', debtFlag.length > 0)
  console.log('goals.previous_status exists:', prevStatus.length > 0)
  console.log('user_settings.debt_total exists:', debtTotal.length > 0)
  console.log('health_logs.exercise_minutes exists:', exerciseMin.length > 0)
  console.log('user_settings.weekly_review_checks exists:', weeklyRev.length > 0)
  console.log('content_posts.pillar exists:', pillar.length > 0)
  console.log('habits table exists:', habitsTbl[0].reg !== null)
  console.log('brand_metrics table exists:', brandTbls[0].reg !== null)
  console.log('modules seeded (habits/brand):', JSON.stringify(modules))

  await sql.end()
}

run().catch(async (err) => {
  console.error('\nMigration run failed:', err.message)
  await sql.end()
  process.exit(1)
})
