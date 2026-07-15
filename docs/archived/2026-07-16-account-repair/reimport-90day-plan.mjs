// One-time script: replace the live (wrong-dated, July 11 start) 90-day cycle with the
// corrected one from supabase/my-90-day-plan.json (start date 2026-07-16), mirroring
// exactly what the /prompt page's "Full 90-Day" import does — deactivate, then insert
// cycle + days + tasks. Old cycle's data is NOT deleted, only deactivated.
import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

async function run() {
  const plan = JSON.parse(fs.readFileSync(path.resolve(process.cwd(), 'supabase/my-90-day-plan.json'), 'utf8'))
  const [user] = await sql`SELECT id FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com'`
  const uid = user.id

  await sql.begin(async (tx) => {
    const deactivated = await tx`UPDATE ninety_day_cycles SET is_active = false WHERE user_id = ${uid} AND is_active = true RETURNING id, title`
    console.log('Deactivated old cycle(s):', deactivated.map(c => c.title))

    const [newCycle] = await tx`
      INSERT INTO ninety_day_cycles (user_id, title, goal, start_date, end_date, is_active)
      VALUES (${uid}, ${plan.cycle.title}, ${plan.cycle.goal}, ${plan.cycle.start_date}, ${plan.cycle.end_date}, true)
      RETURNING id
    `
    console.log('Created new cycle:', newCycle.id, '| start:', plan.cycle.start_date)

    for (const day of plan.days) {
      const [newDay] = await tx`
        INSERT INTO days (cycle_id, user_id, day_number, date, plan_type, theme, notes)
        VALUES (${newCycle.id}, ${uid}, ${day.day_number}, ${day.date}, ${day.plan_type}, ${day.theme ?? null}, ${day.notes ?? null})
        RETURNING id
      `
      if (day.tasks?.length) {
        const rows = day.tasks.map(t => ({
          day_id: newDay.id, user_id: uid, title: t.title, category: t.category,
          platform: t.platform ?? null, content: t.content ?? null, notes: t.notes ?? null,
          sort_order: t.sort_order ?? 0, status: 'pending',
        }))
        await tx`INSERT INTO tasks ${tx(rows, 'day_id','user_id','title','category','platform','content','notes','sort_order','status')}`
      }
    }
    console.log('Inserted', plan.days.length, 'days with tasks.')
  })

  const [check] = await sql`
    SELECT c.title, c.start_date, c.end_date, c.is_active,
      (SELECT count(*) FROM days d WHERE d.cycle_id = c.id) AS day_count,
      (SELECT count(*) FROM tasks t JOIN days d ON t.day_id = d.id WHERE d.cycle_id = c.id) AS task_count
    FROM ninety_day_cycles c WHERE c.user_id = ${uid} AND c.is_active = true
  `
  console.log('\n--- Verification (active cycle) ---')
  console.log(check)

  await sql.end()
}
run().catch(async (e) => { console.error('Failed:', e.message); await sql.end(); process.exit(1) })
