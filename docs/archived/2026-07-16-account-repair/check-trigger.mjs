import postgres from 'postgres'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  const [fn] = await sql`
    SELECT p.proname, pg_get_functiondef(p.oid) AS definition
    FROM pg_trigger t
    JOIN pg_proc p ON t.tgfoid = p.oid
    WHERE t.tgname = 'on_auth_user_created'
  `
  console.log('--- Trigger function definition ---\n')
  console.log(fn ? fn.definition : 'NOT FOUND')

  // Also check user_profiles table structure for NOT NULL constraints
  const cols = await sql`
    SELECT column_name, is_nullable, column_default, data_type
    FROM information_schema.columns
    WHERE table_name = 'user_profiles'
    ORDER BY ordinal_position
  `
  console.log('\n--- user_profiles columns ---')
  for (const c of cols) console.log(`  ${c.column_name}: ${c.data_type}, nullable=${c.is_nullable}, default=${c.column_default}`)

  await sql.end()
}

run().catch(async (err) => {
  console.error('Failed:', err.message)
  await sql.end()
  process.exit(1)
})
