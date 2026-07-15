// One-time script: apply supabase/seed-my-data.sql directly to the live database.
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  const query = fs.readFileSync(path.resolve(process.cwd(), 'supabase/seed-my-data.sql'), 'utf8')
  console.log('--- Applying supabase/seed-my-data.sql ---')
  await sql.unsafe(query)
  console.log('OK')

  const [user] = await sql`SELECT id FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com'`
  const uid = user.id
  const [{ count: goals }] = await sql`SELECT count(*)::int AS count FROM goals WHERE user_id = ${uid}`
  const [{ count: posts }] = await sql`SELECT count(*)::int AS count FROM content_posts WHERE user_id = ${uid} AND platform = 'blog'`
  const [{ count: learn }] = await sql`SELECT count(*)::int AS count FROM learning_resources WHERE user_id = ${uid}`
  const plans = await sql`SELECT plan_type, name FROM timetable_plans WHERE user_id = ${uid} ORDER BY plan_type`

  console.log('\n--- Verification ---')
  console.log('goals:', goals, '(expect 29)')
  console.log('blog content_posts:', posts, '(expect 25)')
  console.log('learning_resources:', learn, '(expect 8)')
  console.log('timetable_plans:', plans)

  await sql.end()
}
run().catch(async (e) => { console.error('Failed:', e.message); await sql.end(); process.exit(1) })
