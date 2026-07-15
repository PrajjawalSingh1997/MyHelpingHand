import postgres from 'postgres'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

// Exact same default blocks the on_auth_user_created trigger uses — kept identical
// so this repair produces the same result a normal signup would have.
const planA = [
  {"id":"a1","time":"5:00–5:30 AM","emoji":"🌅","name":"Wake & Refresh","activity":"No phone, brush, water, light stretch","duration":"30min","fixed":true},
  {"id":"a2","time":"5:30–6:30 AM","emoji":"🧘","name":"Morning Ritual","activity":"Meditation, journaling, cold shower","duration":"60min","fixed":true},
  {"id":"a3","time":"6:30–7:00 AM","emoji":"🍳","name":"Breakfast","activity":"Healthy breakfast, plan the day","duration":"30min","fixed":true},
  {"id":"a4","time":"7:00–9:00 AM","emoji":"🏋️","name":"Exercise","activity":"Workout / gym / run / yoga","duration":"2h","fixed":false},
  {"id":"a5","time":"9:00–1:00 PM","emoji":"💻","name":"Deep Work Block","activity":"Techwara / main project / client work","duration":"4h","fixed":false},
  {"id":"a6","time":"1:00–2:00 PM","emoji":"🍽️","name":"Lunch & Rest","activity":"Lunch, 20min nap or walk","duration":"1h","fixed":true},
  {"id":"a7","time":"2:00–5:00 PM","emoji":"⚡","name":"Afternoon Work","activity":"Tasks, freelance, learning, calls","duration":"3h","fixed":false},
  {"id":"a8","time":"5:00–6:00 PM","emoji":"🚶","name":"Walk & Reset","activity":"Evening walk, debrief the day","duration":"1h","fixed":true},
  {"id":"a9","time":"6:00–8:00 PM","emoji":"📱","name":"Content & Social","activity":"LinkedIn post, GitHub commit, Twitter thread","duration":"2h","fixed":false},
  {"id":"a10","time":"8:00–10:00 PM","emoji":"📚","name":"Learning","activity":"Course / reading / skill building","duration":"2h","fixed":false},
  {"id":"a11","time":"10:00–11:00 PM","emoji":"🌙","name":"Wind Down","activity":"Journal, review tomorrow plan, skincare","duration":"1h","fixed":true},
  {"id":"a12","time":"11:00 PM–12:00 AM","emoji":"😴","name":"Sleep","activity":"Sleep by midnight","duration":"until 5AM","fixed":true}
]
const planB = [
  {"id":"b1","time":"5:00–5:30 AM","emoji":"🌅","name":"Wake & Refresh","activity":"No phone, brush, water","duration":"30min","fixed":true},
  {"id":"b2","time":"5:30–6:00 AM","emoji":"🧘","name":"Quick Ritual","activity":"10min meditation, cold shower","duration":"30min","fixed":true},
  {"id":"b3","time":"6:00–6:30 AM","emoji":"🍳","name":"Breakfast","activity":"Quick healthy breakfast","duration":"30min","fixed":true},
  {"id":"b4","time":"6:30–7:00 AM","emoji":"🏃","name":"Exercise","activity":"30min HIIT / run","duration":"30min","fixed":false},
  {"id":"b5","time":"7:00–1:00 PM","emoji":"💻","name":"Deep Work A","activity":"Techwara heavy coding / main deliverable","duration":"6h","fixed":false},
  {"id":"b6","time":"1:00–1:30 PM","emoji":"🍽️","name":"Lunch","activity":"Quick lunch","duration":"30min","fixed":true},
  {"id":"b7","time":"1:30–6:00 PM","emoji":"⚡","name":"Deep Work B","activity":"Continue main work / freelance / Techwara","duration":"4.5h","fixed":false},
  {"id":"b8","time":"6:00–7:00 PM","emoji":"🚶","name":"Walk & Decompress","activity":"Walk, light stretch","duration":"1h","fixed":true},
  {"id":"b9","time":"7:00–9:00 PM","emoji":"📱","name":"Content Batch","activity":"Batch write posts / schedule","duration":"2h","fixed":false},
  {"id":"b10","time":"9:00–10:30 PM","emoji":"📚","name":"Learning","activity":"Course / reading","duration":"1.5h","fixed":false},
  {"id":"b11","time":"10:30–12:00 AM","emoji":"🌙","name":"Wind Down & Sleep","activity":"Journal, skincare, sleep","duration":"1.5h","fixed":true}
]
const planC = [
  {"id":"c1","time":"5:00–5:30 AM","emoji":"🌅","name":"Wake & Refresh","activity":"No phone, brush, water","duration":"30min","fixed":true},
  {"id":"c2","time":"5:30–6:30 AM","emoji":"🧘","name":"Morning Ritual","activity":"Meditation, journaling, cold shower","duration":"60min","fixed":true},
  {"id":"c3","time":"6:30–7:00 AM","emoji":"🍳","name":"Breakfast","activity":"Healthy breakfast","duration":"30min","fixed":true},
  {"id":"c4","time":"7:00–8:00 AM","emoji":"🏃","name":"Exercise","activity":"Workout","duration":"1h","fixed":false},
  {"id":"c5","time":"8:00–9:00 AM","emoji":"🎯","name":"Business Planning","activity":"Review CRM, plan calls, prepare proposals","duration":"1h","fixed":false},
  {"id":"c6","time":"9:00–12:00 PM","emoji":"📞","name":"Cold Calling Block","activity":"Cold calls, follow-ups, outreach","duration":"3h","fixed":false},
  {"id":"c7","time":"12:00–1:00 PM","emoji":"🍽️","name":"Lunch","activity":"Lunch, walk","duration":"1h","fixed":true},
  {"id":"c8","time":"1:00–3:00 PM","emoji":"📋","name":"Proposals & Emails","activity":"Write proposals, respond to leads, networking","duration":"2h","fixed":false},
  {"id":"c9","time":"3:00–5:00 PM","emoji":"💻","name":"Client Work","activity":"Active client projects","duration":"2h","fixed":false},
  {"id":"c10","time":"5:00–6:00 PM","emoji":"🚶","name":"Walk & Reset","activity":"Evening walk","duration":"1h","fixed":true},
  {"id":"c11","time":"6:00–8:00 PM","emoji":"📱","name":"Content & LinkedIn","activity":"Post, engage, network on LinkedIn","duration":"2h","fixed":false},
  {"id":"c12","time":"8:00–10:00 PM","emoji":"📚","name":"Learning","activity":"Course / reading","duration":"2h","fixed":false},
  {"id":"c13","time":"10:00–12:00 AM","emoji":"🌙","name":"Wind Down & Sleep","activity":"Journal, review, skincare, sleep","duration":"2h","fixed":true}
]

async function run() {
  const [user] = await sql`SELECT id, email, raw_user_meta_data FROM auth.users WHERE email = 'prajjawalsingh1997@gmail.com'`
  const uid = user.id
  const displayName = user.raw_user_meta_data?.display_name || 'Prajjawal Singh'

  await sql`
    INSERT INTO user_profiles (id, display_name, role)
    VALUES (${uid}, ${displayName}, 'super_admin')
    ON CONFLICT (id) DO NOTHING
  `
  console.log('user_profiles: inserted (role=super_admin)')

  await sql`
    INSERT INTO timetable_plans (user_id, plan_type, name, blocks) VALUES
      (${uid}, 'A', 'Plan A — Standard Day',     ${sql.json(planA)}),
      (${uid}, 'B', 'Plan B — Heavy Work Day',   ${sql.json(planB)}),
      (${uid}, 'C', 'Plan C — Business Dev Day', ${sql.json(planC)})
    ON CONFLICT (user_id, plan_type) DO NOTHING
  `
  console.log('timetable_plans: inserted (A/B/C)')

  const [profile] = await sql`SELECT id, display_name, role FROM user_profiles WHERE id = ${uid}`
  const plans = await sql`SELECT plan_type, name, jsonb_array_length(blocks) AS block_count FROM timetable_plans WHERE user_id = ${uid} ORDER BY plan_type`
  console.log('\n--- Verification ---')
  console.log('Profile:', profile)
  console.log('Plans:', plans)

  await sql.end()
}
run().catch(async (e) => { console.error('Failed:', e.message); await sql.end(); process.exit(1) })
