import postgres from 'postgres'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  const [user] = await sql`SELECT id FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com'`
  const uid = user.id

  const [{ count: profileCount }] = await sql`SELECT count(*)::int AS count FROM user_profiles WHERE id = ${uid}`
  const [{ count: settingsCount }] = await sql`SELECT count(*)::int AS count FROM user_settings WHERE user_id = ${uid}`
  const [{ count: moduleSettingsCount }] = await sql`SELECT count(*)::int AS count FROM user_module_settings WHERE user_id = ${uid}`
  const [{ count: timetableCount }] = await sql`SELECT count(*)::int AS count FROM timetable_plans WHERE user_id = ${uid}`
  const [{ count: modulesTotal }] = await sql`SELECT count(*)::int AS count FROM modules`

  console.log('user_profiles rows:', profileCount)
  console.log('user_settings rows:', settingsCount)
  console.log('user_module_settings rows:', moduleSettingsCount, '(total modules available:', modulesTotal, ')')
  console.log('timetable_plans rows:', timetableCount, '(expect 3: A/B/C)')

  await sql.end()
}
run().catch(async (e) => { console.error(e.message); await sql.end(); process.exit(1) })
