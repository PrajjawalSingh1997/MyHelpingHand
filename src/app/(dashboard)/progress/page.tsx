'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Loader2, Flame, CheckCircle, SkipForward, Clock, TrendingUp } from 'lucide-react'
import { EmptyCycle } from '@/components/ui/empty-cycle'
import type { NinetyDayCycle } from '@/types/database'

interface DayData {
  id: string
  day_number: number
  date: string
  tasks: { status: string; category: string }[]
}

export default function ProgressPage() {
  const [cycle, setCycle]   = useState<NinetyDayCycle | null>(null)
  const [days, setDays]     = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [currentDay, setCurrentDay] = useState(1)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }

      const { data: c } = await supabase
        .from('ninety_day_cycles').select('*')
        .eq('user_id', user.id).eq('is_active', true).single() as { data: NinetyDayCycle | null }
      if (!c) { setLoading(false); return }
      setCycle(c)

      const today = new Date()
      const start = new Date(c.start_date)
      setCurrentDay(Math.min(Math.max(Math.floor((today.getTime() - start.getTime()) / 86400000) + 1, 1), 90))

      const { data: d } = await supabase
        .from('days').select('id, day_number, date, tasks(status, category)')
        .eq('cycle_id', c.id).order('day_number') as { data: DayData[] | null }
      setDays(d ?? [])
      setLoading(false)
    }
    load()
  }, [])

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
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📊 Progress</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Day {currentDay} of 90 — {cycle.title}</p>
      </div>

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
    </div>
  )
}
