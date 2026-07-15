import { createClient } from '@/lib/supabase/client'

/** Every user-owned table beyond user_profiles / brand_profile_checklist (handled separately below). */
const USER_TABLES = [
  'user_settings', 'ninety_day_cycles', 'days', 'tasks', 'goals',
  'timetable_plans', 'timetable_checks', 'health_logs', 'finance_entries',
  'crm_leads', 'cold_calls', 'content_posts', 'learning_resources',
  'freelance_projects', 'rentlyf_logs', 'habits', 'habit_logs',
  'brand_metrics', 'brand_daily_actions',
] as const

/** Pulls every table this user owns into one plain object. RLS scopes every query to the caller. */
export async function exportUserData(userId: string): Promise<Record<string, unknown>> {
  const supabase = createClient()
  const data: Record<string, unknown> = { exported_at: new Date().toISOString() }

  const [profile, checklist] = await Promise.all([
    supabase.from('user_profiles').select('*').eq('id', userId).single(),
    supabase.from('brand_profile_checklist').select('*').eq('user_id', userId).single(),
  ])
  data.user_profiles = profile.data ?? null
  data.brand_profile_checklist = checklist.data ?? null

  await Promise.all(USER_TABLES.map(async (table) => {
    const res = await supabase.from(table).select('*').eq('user_id', userId)
    data[table] = res.data ?? []
  }))

  return data
}

/** Triggers a client-side JSON file download — no server round-trip. */
export function downloadJson(filename: string, data: unknown) {
  const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
  const url = URL.createObjectURL(blob)
  const a = document.createElement('a')
  a.href = url
  a.download = filename
  document.body.appendChild(a)
  a.click()
  document.body.removeChild(a)
  URL.revokeObjectURL(url)
}
