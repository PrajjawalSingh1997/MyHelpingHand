'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, differenceInCalendarDays, getYear, getISOWeek } from 'date-fns'
import { Loader2, Flame, CheckCircle, SkipForward, Clock, TrendingUp, ChevronDown, ChevronUp } from 'lucide-react'
import { EmptyCycle } from '@/components/ui/empty-cycle'
import { useRouter } from 'next/navigation'
import type { NinetyDayCycle } from '@/types/database'

const WEEKLY_REVIEW_ITEMS = [
  { id: 'completion_rate', label: 'Reviewed completion rate' },
  { id: 'goal_progress', label: 'Updated goal progress (/goals)' },
  { id: 'crm_pipeline', label: 'Reviewed CRM pipeline (/crm)' },
  { id: 'freelance_projects', label: 'Updated freelance projects (/freelance)' },
  { id: 'next_week_content', label: 'Planned next week\'s content (/content)' },
  { id: 'learning_progress', label: 'Updated learning progress (/learning)' },
]

interface DayData {
  id: string
  day_number: number
  date: string
  tasks: { status: string; category: string }[]
}

export default function ProgressPage() {
  const router = useRouter()
  const [cycle, setCycle]   = useState<NinetyDayCycle | null>(null)
  const [days, setDays]     = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)

  const [activeTab, setActiveTab] = useState<'overview' | 'growth'>('overview')
  const [weeklyChecks, setWeeklyChecks] = useState<Record<string, boolean>>({})
  const [reviewOpen, setReviewOpen] = useState(false)
  const currentISOWeek = `${getYear(new Date())}-W${getISOWeek(new Date())}`

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const [cRes, sRes] = await Promise.all([
        supabase.from('ninety_day_cycles').select('*').eq('user_id', user.id).eq('is_active', true).single(),
        supabase.from('user_settings').select('weekly_review_checks').eq('user_id', user.id).single()
      ])
      const c = cRes.data as NinetyDayCycle | null
      const s = sRes.data as any

      if (!c) { setLoading(false); return }
      setCycle(c)

      let loadedChecks = {}
      if (s?.weekly_review_checks?.week === currentISOWeek) {
        loadedChecks = s.weekly_review_checks.checks || {}
      }
      setWeeklyChecks(loadedChecks)

      const today = new Date()
      const dayNum = differenceInCalendarDays(today, new Date(c.start_date)) + 1
      setCurrentDay(Math.min(Math.max(dayNum, 1), 90))

      const { data: d } = await supabase
        .from('days').select('id, day_number, date, tasks(status, category)')
        .eq('cycle_id', c.id).order('day_number') as { data: DayData[] | null }
      setDays(d ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const toggleCheck = async (id: string, value: boolean) => {
    if (!userId) return
    const newChecks = { ...weeklyChecks, [id]: value }
    setWeeklyChecks(newChecks)
    
    const supabase = createClient()
    await supabase.from('user_settings').update({
      weekly_review_checks: { week: currentISOWeek, checks: newChecks }
    }).eq('user_id', userId)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )
  if (!cycle) return <EmptyCycle />

  const pastDays = days.filter(d => new Date(d.date) <= new Date())

  const totalTasks     = pastDays.reduce((s, d) => s + d.tasks.length, 0)
  const completedTasks = pastDays.reduce((s, d) => s + d.tasks.filter(t => t.status === 'completed').length, 0)
  const skippedTasks   = pastDays.reduce((s, d) => s + d.tasks.filter(t => t.status === 'skipped').length, 0)
  const pendingTasks   = pastDays.reduce((s, d) => s + d.tasks.filter(t => t.status === 'pending' || t.status === 'postponed').length, 0)
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0

  // Streak
  let streak = 0
  const sorted = [...pastDays].sort((a, b) => b.day_number - a.day_number)
  for (const day of sorted) {
    const t = day.tasks
    if (!t.length) break
    const done = t.filter(x => x.status === 'completed').length
    if (done / t.length >= 0.5) streak++
    else break
  }

  // Weekly breakdown (last 4 weeks)
  const weeks: { label: string; pct: number; done: number; total: number }[] = []
  for (let w = 3; w >= 0; w--) {
    const wStart = currentDay - (w + 1) * 7
    const wEnd   = currentDay - w * 7
    const wDays  = pastDays.filter(d => d.day_number > wStart && d.day_number <= wEnd)
    const wTotal = wDays.reduce((s, d) => s + d.tasks.length, 0)
    const wDone  = wDays.reduce((s, d) => s + d.tasks.filter(t => t.status === 'completed').length, 0)
    weeks.push({
      label: `Week ${Math.floor((currentDay - 1) / 7) - w}`,
      pct: wTotal > 0 ? Math.round((wDone / wTotal) * 100) : 0,
      done: wDone,
      total: wTotal,
    })
  }

  // Category breakdown
  const catMap = new Map<string, { done: number; total: number }>()
  pastDays.forEach(d => d.tasks.forEach(t => {
    const c = t.category || 'other'
    const e = catMap.get(c) ?? { done: 0, total: 0 }
    catMap.set(c, { done: e.done + (t.status === 'completed' ? 1 : 0), total: e.total + 1 })
  }))
  const categories = Array.from(catMap.entries())
    .map(([name, { done, total }]) => ({ name, done, total, pct: Math.round((done / total) * 100) }))
    .sort((a, b) => b.total - a.total).slice(0, 8)

  // Last 14 days heatmap
  const recent14 = pastDays.slice(-14)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📊 Progress</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day {currentDay} of 90 — {cycle.title}</p>
        </div>
        <div className="flex rounded-lg p-1" style={{ background: 'var(--surface)' }}>
          <button onClick={() => setActiveTab('overview')} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-[#6C5CE7] text-white shadow' : 'text-[#64748B] hover:text-[#E2E8F0]'}`}>Overview</button>
          <button onClick={() => setActiveTab('growth')} className={`rounded-md px-4 py-1.5 text-sm font-medium transition-all ${activeTab === 'growth' ? 'bg-[#6C5CE7] text-white shadow' : 'text-[#64748B] hover:text-[#E2E8F0]'}`}>Growth Tracker</button>
        </div>
      </div>

      {activeTab === 'growth' ? (
        <div className="card">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b border-[#2D2D3F]">
                <th className="pb-2 text-[#64748B] font-medium">Day</th>
                <th className="pb-2 text-[#64748B] font-medium">Date</th>
                <th className="pb-2 text-[#64748B] font-medium text-center">LinkedIn</th>
                <th className="pb-2 text-[#64748B] font-medium text-center">GitHub</th>
                <th className="pb-2 text-[#64748B] font-medium text-center">Twitter</th>
                <th className="pb-2 text-[#64748B] font-medium text-center">Freelance</th>
                <th className="pb-2 text-[#64748B] font-medium text-right">Done %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#2D2D3F]">
              {pastDays.slice().reverse().map(day => {
                const getCatStats = (cat: string) => {
                  const catTasks = day.tasks.filter(t => t.category === cat)
                  const total = catTasks.length
                  const done = catTasks.filter(t => t.status === 'completed').length
                  return { total, done }
                }
                const cats = ['linkedin', 'github', 'twitter', 'freelance']
                
                return (
                  <tr key={day.id} className="group transition-colors hover:bg-[#1A1A26] cursor-pointer" onClick={() => router.push(`/day/${day.day_number}`)}>
                    <td className="py-2 font-medium text-[#E2E8F0]">Day {day.day_number}</td>
                    <td className="py-2 text-[#94A3B8]">{format(parseISO(day.date), 'MMM d')}</td>
                    {cats.map(cat => {
                      const { total, done } = getCatStats(cat)
                      const pct = total > 0 ? done / total : -1
                      const color = pct === 1 ? 'var(--success)' : pct >= 0 ? 'var(--warning)' : 'var(--border)'
                      return (
                        <td key={cat} className="py-2 text-center">
                          {total > 0 ? <span style={{ color }}>{done}/{total}</span> : <span className="text-[#64748B]">-</span>}
                        </td>
                      )
                    })}
                    <td className="py-2 text-right">
                       {(() => {
                         const total = day.tasks.length
                         const done = day.tasks.filter(t => t.status === 'completed').length
                         const pct = total > 0 ? Math.round((done / total) * 100) : 0
                         return <span className="font-bold" style={{ color: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)' }}>{pct}%</span>
                       })()}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <>
          {/* Summary cards */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: <Flame size={18} style={{ color: 'var(--danger)' }} />, label: 'Streak', value: `${streak}d` },
          { icon: <CheckCircle size={18} style={{ color: 'var(--success)' }} />, label: 'Completed', value: completedTasks },
          { icon: <SkipForward size={18} style={{ color: 'var(--warning)' }} />, label: 'Skipped', value: skippedTasks },
          { icon: <Clock size={18} style={{ color: 'var(--text-muted)' }} />, label: 'Pending', value: pendingTasks },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Completion rate */}
      <div className="card">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Overall Completion Rate</h3>
          <span className="text-2xl font-bold" style={{ color: 'var(--accent)' }}>{completionRate}%</span>
        </div>
        <div className="h-3 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
          <div className="h-full rounded-full transition-all duration-700" style={{ width: `${completionRate}%`, background: 'linear-gradient(to right, #6C5CE7, #a78bfa)' }} />
        </div>
        <p className="mt-2 text-xs" style={{ color: 'var(--text-muted)' }}>
          {completedTasks} completed out of {totalTasks} total tasks in {pastDays.length} days
        </p>
      </div>

      {/* 90-day heatmap */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>90-Day Heatmap</h3>
        <div className="flex gap-[2px] flex-wrap">
          {days.map(day => {
            const done  = day.tasks.filter(t => t.status === 'completed').length
            const total = day.tasks.length
            const pct   = total > 0 ? done / total : 0
            const future = new Date(day.date) > new Date()
            const isToday = day.day_number === currentDay
            return (
              <div key={day.day_number} title={`Day ${day.day_number} — ${Math.round(pct * 100)}%`}
                className="h-5 w-5 rounded-sm transition-all"
                style={{
                  background: future ? 'var(--surface-hover)' : pct >= 0.8 ? 'var(--success)' : pct >= 0.5 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--border)',
                  outline: isToday ? '2px solid var(--accent)' : 'none',
                  outlineOffset: '1px',
                }} />
            )
          })}
          {Array.from({ length: Math.max(0, 90 - days.length) }, (_, i) => (
            <div key={`e${i}`} className="h-5 w-5 rounded-sm" style={{ background: 'var(--surface-hover)' }} />
          ))}
        </div>
        <div className="mt-2 flex gap-4">
          {[['var(--success)', '≥80%'], ['var(--warning)', '50–79%'], ['var(--danger)', '<50%']].map(([c, l]) => (
            <div key={l} className="flex items-center gap-1">
              <div className="h-3 w-3 rounded-sm" style={{ background: c }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{l}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Weekly breakdown */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>Weekly Breakdown</h3>
        <div className="space-y-3">
          {weeks.map(week => (
            <div key={week.label}>
              <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
                <span>{week.label}</span>
                <span>{week.done}/{week.total} ({week.pct}%)</span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                <div className="h-full rounded-full transition-all" style={{ width: `${week.pct}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Category breakdown */}
      {categories.length > 0 && (
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>By Category</h3>
          <div className="space-y-3">
            {categories.map(cat => (
              <div key={cat.name} className="flex items-center gap-3">
                <span className="w-24 text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{cat.name}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${cat.pct}%`, background: 'var(--accent)' }} />
                </div>
                <span className="w-20 text-right text-xs" style={{ color: 'var(--text-muted)' }}>{cat.done}/{cat.total}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Last 14 days detail */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Last 14 Days</h3>
        <div className="space-y-2">
          {recent14.map(day => {
            const done  = day.tasks.filter(t => t.status === 'completed').length
            const total = day.tasks.length
            const pct   = total > 0 ? Math.round((done / total) * 100) : 0
            return (
              <div key={day.day_number} className="flex items-center gap-3">
                <span className="w-12 text-xs" style={{ color: 'var(--text-muted)' }}>D{day.day_number}</span>
                <span className="w-20 text-xs" style={{ color: 'var(--text-muted)' }}>{format(parseISO(day.date), 'EEE, MMM d')}</span>
                <div className="flex-1 h-2 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                  <div className="h-full rounded-full" style={{ width: `${pct}%`, background: pct >= 80 ? 'var(--success)' : pct >= 50 ? 'var(--warning)' : 'var(--danger)' }} />
                </div>
                <span className="w-16 text-right text-xs" style={{ color: 'var(--text-muted)' }}>{done}/{total}</span>
              </div>
            )
          })}
        </div>
      </div>
      
      {/* Weekly Review Card */}
      <div className="card">
        <div className="flex cursor-pointer items-center justify-between" onClick={() => setReviewOpen(!reviewOpen)}>
          <div className="flex items-center gap-3">
            <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Weekly Review</h3>
            <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: Object.values(weeklyChecks).filter(Boolean).length === 6 ? 'var(--success-soft)' : 'var(--surface2)', color: Object.values(weeklyChecks).filter(Boolean).length === 6 ? 'var(--success)' : 'var(--text-muted)' }}>
              {Object.values(weeklyChecks).filter(Boolean).length}/6 done
            </span>
          </div>
          {reviewOpen ? <ChevronUp size={16} className="text-[#64748B]" /> : <ChevronDown size={16} className="text-[#64748B]" />}
        </div>
        {reviewOpen && (
          <div className="mt-4 space-y-2 border-t border-[#2D2D3F] pt-4">
            {WEEKLY_REVIEW_ITEMS.map(item => (
              <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#1A1A26]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-[#2D2D3F] bg-[#0A0A0F] text-[#6C5CE7] focus:ring-[#6C5CE7]"
                  checked={!!weeklyChecks[item.id]}
                  onChange={(e) => toggleCheck(item.id, e.target.checked)}
                />
                <span className="text-sm font-medium" style={{ color: weeklyChecks[item.id] ? 'var(--text-muted)' : 'var(--text)', textDecoration: weeklyChecks[item.id] ? 'line-through' : 'none' }}>
                  {item.label}
                </span>
              </label>
            ))}
          </div>
        )}
      </div>
      </>
      )}
    </div>
  )
}
