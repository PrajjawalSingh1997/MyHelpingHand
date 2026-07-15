import postgres from 'postgres'
import fs from 'fs'
import path from 'path'
import dotenv from 'dotenv'

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
const sql = postgres(process.env.DATABASE_URL, { ssl: 'require' })

const EMAIL = 'prajjawalsingh1997@gmail.com'

// Expected content from supabase/seed-my-data.sql
const expectedContentPosts = [
  'Why I Switched from Electrical Engineering to Software Development','Why We Chose PostgreSQL over MongoDB',
  'Testing a Startup Product — Edge Cases That Broke Our App','Building Admin Dashboards with Next.js + TanStack Query',
  'My Full Tech Stack in 2026 — and Why I Chose Each Tool','How We Handle 200+ APIs in One Backend',
  'Redis Caching Patterns for SaaS Applications','JWT Authentication + Rate Limiting in Express',
  'From Backend to Full Stack — My Admin Dashboard Journey','Testing a Startup Product — The Edge Cases Nobody Warns You About',
  'BullMQ — Background Job Processing in Node.js','30 Days of Building in Public — Reflection',
  'Zod Validation Patterns for TypeScript APIs','Server State vs Client State — When to Use What',
  'Role-Based Access Control in Express','Error Monitoring with Sentry in Production',
  'Building Charts with Recharts','Express Middleware Architecture',
  'Remote Startup Collaboration — Tools and Lessons','Building a Rent Management System — Case Study',
  'B2B2C SaaS Lessons from Building Rentlyf','First Freelance Client — What I Learned',
  'Admin Dashboard Architecture Guide','Marketing as a Developer — Why It Matters',
  'My 1-Year Journey — From EE Graduate to Startup Co-Founder',
]
const expectedGoals = [
  'LinkedIn Posts','GitHub Repos','Twitter Posts','Blog Posts','LinkedIn Connections','Portfolio Status',
  'Freelance Profiles Created','Upwork Proposals Sent','Freelance Clients','Rentlyf Coding Hours',
  'LinkedIn Posts (M2)','GitHub Repos Total (M2)','Blog Posts Total (M2)','Freelance Proposals Total (M2)',
  'Freelance Clients (M2)','Doctor Websites Built (M2)','Freelance Income (M2)','Rentlyf Company Registered (M2)',
  'LinkedIn Connections Total (M2)','LinkedIn Posts (M3)','LinkedIn Connections Total (M3)','Blog Posts Total (M3)',
  'Freelance Clients Total (M3)','Freelance Income Total (M3)','Rentlyf Beta Users (M3)','Instagram Content Started (M3)',
  'Marketing Plan Created (M3)','GitHub Repos Total (M3)','GitHub Stars (M3)',
]
const expectedLearning = [
  'Three.js / React Three Fiber','Framer Motion','GSAP Animations','Instagram Content Strategy',
  'YouTube Shorts Creation','Sales & Marketing (Rentlyf)','Conference Talk Preparation','Open Source Contributing',
]

async function run() {
  const [user] = await sql`SELECT id, email, created_at FROM auth.users WHERE email = ${EMAIL}`
  if (!user) { console.log('NO USER FOUND for', EMAIL); await sql.end(); return }
  console.log('User:', user.email, '| id:', user.id, '| created:', user.created_at)
  const uid = user.id

  const [profile] = await sql`SELECT display_name, role FROM user_profiles WHERE id = ${uid}`
  console.log('Profile:', profile)

  // 90-day cycle / plan
  const cycles = await sql`SELECT id, title, start_date, end_date, is_active FROM ninety_day_cycles WHERE user_id = ${uid} ORDER BY created_at DESC`
  console.log('\n--- 90-Day Cycles ---')
  console.log('Total cycles:', cycles.length)
  for (const c of cycles) {
    const [{ count: dayCount }] = await sql`SELECT count(*)::int AS count FROM days WHERE cycle_id = ${c.id}`
    const [{ count: taskCount }] = await sql`SELECT count(*)::int AS count FROM tasks t JOIN days d ON t.day_id = d.id WHERE d.cycle_id = ${c.id}`
    console.log(`  cycle "${c.title}" | ${c.start_date} → ${c.end_date} | active=${c.is_active} | days=${dayCount} | tasks=${taskCount}`)
  }

  // Goals
  const goals = await sql`SELECT title, goal_type FROM goals WHERE user_id = ${uid} ORDER BY title`
  console.log('\n--- Goals ---')
  console.log('Total goals in DB:', goals.length, '| Expected from seed file:', expectedGoals.length)
  const goalTitles = goals.map(g => g.title)
  const missingGoals = expectedGoals.filter(t => !goalTitles.includes(t))
  const dupGoals = goalTitles.filter((t, i) => goalTitles.indexOf(t) !== i)
  console.log('Missing from DB:', missingGoals.length ? missingGoals : 'none')
  console.log('Duplicated in DB:', dupGoals.length ? [...new Set(dupGoals)] : 'none')

  // Content posts (blog ideas from seed file)
  const posts = await sql`SELECT title, platform FROM content_posts WHERE user_id = ${uid} AND platform = 'blog' ORDER BY title`
  console.log('\n--- Blog content_posts ---')
  console.log('Total blog posts in DB:', posts.length, '| Expected from seed file:', expectedContentPosts.length)
  const postTitles = posts.map(p => p.title)
  const missingPosts = expectedContentPosts.filter(t => !postTitles.includes(t))
  const dupPosts = postTitles.filter((t, i) => postTitles.indexOf(t) !== i)
  console.log('Missing from DB:', missingPosts.length ? missingPosts : 'none')
  console.log('Duplicated in DB:', dupPosts.length ? [...new Set(dupPosts)] : 'none')

  // Learning resources
  const learn = await sql`SELECT title FROM learning_resources WHERE user_id = ${uid} ORDER BY title`
  console.log('\n--- Learning resources ---')
  console.log('Total in DB:', learn.length, '| Expected from seed file:', expectedLearning.length)
  const learnTitles = learn.map(l => l.title)
  const missingLearn = expectedLearning.filter(t => !learnTitles.includes(t))
  const dupLearn = learnTitles.filter((t, i) => learnTitles.indexOf(t) !== i)
  console.log('Missing from DB:', missingLearn.length ? missingLearn : 'none')
  console.log('Duplicated in DB:', dupLearn.length ? [...new Set(dupLearn)] : 'none')

  // Timetable plans
  const plans = await sql`SELECT plan_type, name, jsonb_array_length(blocks) AS block_count FROM timetable_plans WHERE user_id = ${uid} ORDER BY plan_type`
  console.log('\n--- Timetable Plans ---')
  for (const p of plans) console.log(`  Plan ${p.plan_type}: "${p.name}" | ${p.block_count} blocks`)

  // Other module counts, for completeness
  const tables = ['health_logs','finance_entries','crm_leads','cold_calls','freelance_projects','rentlyf_logs','habits','habit_logs','brand_metrics']
  console.log('\n--- Other tables ---')
  for (const t of tables) {
    const [{ count }] = await sql`SELECT count(*)::int AS count FROM ${sql(t)} WHERE user_id = ${uid}`
    console.log(`  ${t}: ${count} rows`)
  }

  await sql.end()
}

run().catch(async (err) => {
  console.error('Check failed:', err.message)
  await sql.end()
  process.exit(1)
})
