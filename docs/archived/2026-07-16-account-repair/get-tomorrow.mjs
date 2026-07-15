import postgres from 'postgres'
import path from 'path'
import dotenv from 'dotenv'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })
async function run() {
  const [user] = await sql`SELECT id FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com'`
  const uid = user.id
  const [day1] = await sql`SELECT d.day_number, d.date, d.plan_type, d.theme FROM days d JOIN ninety_day_cycles c ON d.cycle_id = c.id WHERE c.user_id = ${uid} AND c.is_active = true AND d.day_number = 1`
  const [day2] = await sql`SELECT d.id, d.day_number, d.date, d.plan_type, d.theme FROM days d JOIN ninety_day_cycles c ON d.cycle_id = c.id WHERE c.user_id = ${uid} AND c.is_active = true AND d.day_number = 2`
  console.log('DAY 1 (today):', JSON.stringify(day1))
  console.log('DAY 2 (tomorrow):', JSON.stringify(day2))
  const tasks = await sql`SELECT title, category, platform, content, notes, sort_order FROM tasks WHERE day_id = ${day2.id} ORDER BY sort_order`
  console.log('\nDAY 2 TASKS:')
  for (const t of tasks) console.log(JSON.stringify(t))
  const [plan] = await sql`SELECT plan_type, name, blocks FROM timetable_plans WHERE user_id = ${uid} AND plan_type = ${day2.plan_type}`
  console.log('\nTIMETABLE PLAN', day2.plan_type, ':', plan.name)
  console.log(JSON.stringify(plan.blocks, null, 2))
  await sql.end()
}
run().catch(async e => { console.error(e.message); await sql.end(); process.exit(1) })
