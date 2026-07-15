import postgres from 'postgres'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  const [{ count: totalProfiles }] = await sql`SELECT count(*)::int AS count FROM user_profiles`
  console.log('Total rows in user_profiles table (all users):', totalProfiles)

  const [user] = await sql`SELECT id, email FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com'`
  console.log('auth.users row:', user)

  const rows = await sql`SELECT * FROM user_profiles WHERE id = ${user.id}`
  console.log('user_profiles rows matching that id:', rows)

  const settingsRows = await sql`SELECT * FROM user_settings WHERE user_id = ${user.id}`
  console.log('user_settings rows:', settingsRows.length)

  // Check trigger existence
  const triggers = await sql`
    SELECT tgname, tgrelid::regclass AS table_name
    FROM pg_trigger
    WHERE tgname ILIKE '%new_user%' OR tgname ILIKE '%on_auth%'
  `
  console.log('Relevant triggers on the DB:', triggers)

  await sql.end()
}

run().catch(async (err) => {
  console.error('Failed:', err.message)
  await sql.end()
  process.exit(1)
})
