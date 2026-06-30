'use client'
import { useState, useEffect } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import { Flame, ChevronRight, Loader2, TrendingUp, DollarSign, Heart, Users } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { EmptyCycle } from '@/components/ui/empty-cycle'
import type { NinetyDayCycle } from '@/types/database'

interface DaySummary {
  id: string
  day_number: number
  date: string
  plan_type: string
  tasks: { status: string }[]
}

export default function DashboardPage() {
  const [cycle, setCycle]       = useState<NinetyDayCycle | null>(null)
  const [days, setDays]         = useState<DaySummary[]>([])
  const [currentDay, setCurrentDay] = useState(1)
  const [streak, setStreak]     = useState(0)
  const [loading, setLoading]   = useState(true)
  const [userId, setUserId]     = useState<string | null>(null)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data: c } = await supabase
        .from('ninety_day_cycles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as { data: NinetyDayCycle | null }

      if (!c) { setLoading(false); return }
      setCycle(c)

      const today = new Date()
      const start = new Date(c.start_date)
      const dayNum = Math.min(Math.max(Math.floor((today.getTime() - start.getTime()) / 86400000) + 1, 1), 90)
      setCurrentDay(dayNum)

      const { data: daysData } = await supabase
        .from('days')
        .select('id, day_number, date, plan_type, tasks(status)')
        .eq('cycle_id', c.id)
        .order('day_number') as { data: DaySummary[] | null }

      const d = daysData ?? []
      setDays(d)

      // Streak calculation
      let s = 0
      const sorted = [...d].sort((a, b) => b.day_number - a.day_number)
      for (const day of sorted) {
        if (new Date(day.date) > today) continue
        const t = day.tasks
        if (!t.length) break
        const done = t.filter((x: any) => x.status === 'completed').length
        if (done / t.length >= 0.5) s++
        else break
      }
      setStreak(s)
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

  const todayDay  = days.find(d => d.day_number === currentDay)
  const todayDone = todayDay?.tasks.filter((t: any) => t.status === 'completed').length ?? 0
  const todayTotal = todayDay?.tasks.length ?? 0
  const todayPct  = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0

  const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1
  const weekDays  = days.filter(d => d.day_number >= weekStart && d.day_number < weekStart + 7)

  return (
    <div className="space-y-6">
      {/* Today summary */}
      <div className="card relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3" style={{ background: 'linear-gradient(to left, rgba(108,92,231,0.05), transparent)' }} />
        <div className="relative flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>
              Day {currentDay}
              <span className="ml-2 text-base font-normal" style={{ color: 'var(--text-muted)' }}>
                — {todayDay ? format(parseISO(todayDay.date), 'EEEE, MMMM d') : ''}
              </span>
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <span className={`badge ${todayDay?.plan_type === 'A' ? 'bg-blue-500/15 text-blue-400' : todayDay?.plan_type === 'B' ? 'bg-orange-500/15 text-orange-400' : 'bg-green-500/15 text-green-400'}`}>
                Plan {todayDay?.plan_type ?? 'A'}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>
                {todayDone}/{todayTotal} tasks done
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2D2D3F" strokeWidth="3" />
                <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6C5CE7" strokeWidth="3" strokeDasharray={`${todayPct}, 100`} strokeLinecap="round" />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold" style={{ color: 'var(--text)' }}>{todayPct}%</span>
            </div>
            <Link href="/today" className="mt-2 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
              View Full Day <ChevronRight size={12} />
            </Link>
          </div>
        </div>
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--surface-hover)' }}>
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${todayPct}%`, background: 'linear-gradient(to right, #6C5CE7, #a78bfa)' }} />
        </div>
      </div>

      {/* Quick stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: <Flame size={20} style={{ color: 'var(--danger)' }} />, label: 'Streak',      value: `${streak}d`,       sub: 'days consistent' },
          { icon: <TrendingUp size={20} style={{ color: 'var(--accent)' }} />, label: 'Cycle Progress', value: `${currentDay}/90`,  sub: 'days elapsed' },
          { icon: <DollarSign size={20} style={{ color: 'var(--success)' }} />, label: 'Finance', value: '₹0',    sub: 'track in Finance' },
          { icon: <Heart size={20} style={{ color: '#f43f5e' }} />,    label: 'Health',      value: '—',            sub: 'log in Health' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2">{s.icon}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
            <p className="mt-2 text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Week + shortcuts */}
      <div className="grid grid-cols-2 gap-4">
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>This Week</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const done  = day.tasks.filter((t: any) => t.status === 'completed' || t.status === 'skipped').length
              const total = day.tasks.length
              const pct   = total > 0 ? done / total : 0
              const isCur = day.day_number === currentDay
              return (
                <Link key={day.day_number} href={`/day/${day.day_number}`}>
                  <div className={`flex flex-col items-center rounded-lg p-2 transition-all ${isCur ? 'ring-1' : 'hover:bg-[#1E1E2E]'}`}
                       style={isCur ? { background: 'rgba(108,92,231,0.2)' } : {}}>
                    <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>
                      {format(parseISO(day.date), 'EEE')}
                    </span>
                    <span className="mt-1 text-sm font-medium" style={{ color: 'var(--text)' }}>{day.day_number}</span>
                    <div className="mt-1 h-2 w-2 rounded-full" style={{
                      background: new Date(day.date) > new Date() ? 'var(--border)'
                        : pct >= 0.8 ? 'var(--success)'
                        : pct >= 0.5 ? 'var(--warning)'
                        : 'var(--danger)'
                    }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </div>

        <div className="card">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Quick Access</h3>
          <div className="grid grid-cols-2 gap-2">
            {[
              { href: '/health',  emoji: '💪', label: 'Health Log' },
              { href: '/finance', emoji: '💰', label: 'Finance' },
              { href: '/crm',     emoji: '📞', label: 'CRM' },
              { href: '/prompt',  emoji: '✨', label: 'Import Plan' },
            ].map(item => (
              <Link key={item.href} href={item.href}
                className="flex items-center gap-2 rounded-lg p-3 text-sm font-medium transition-all"
                style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text)' }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'var(--text-muted)' }}>
                <span>{item.emoji}</span>
                <span>{item.label}</span>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 90-day heatmap */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>90-Day Progress</h3>
        <div className="flex gap-[2px]">
          {days.map(day => {
            const done  = day.tasks.filter((t: any) => t.status === 'completed' || t.status === 'skipped').length
            const total = day.tasks.length
            const pct   = total > 0 ? done / total : 0
            const future = new Date(day.date) > new Date()
            return (
              <Link key={day.day_number} href={`/day/${day.day_number}`}>
                <div title={`Day ${day.day_number}: ${Math.round(pct * 100)}%`}
                     className="h-6 w-[7px] rounded-sm transition-all hover:scale-y-125"
                     style={{ background: future ? 'var(--border)' : pct >= 0.8 ? 'var(--success)' : pct >= 0.5 ? 'var(--warning)' : pct > 0 ? 'var(--danger)' : 'var(--border)' }} />
              </Link>
            )
          })}
          {/* Fill remaining if cycle has fewer than 90 days yet */}
          {Array.from({ length: Math.max(0, 90 - days.length) }, (_, i) => (
            <div key={`empty-${i}`} className="h-6 w-[7px] rounded-sm" style={{ background: 'var(--border)' }} />
          ))}
        </div>
        <div className="mt-2 flex justify-between text-[10px]" style={{ color: 'var(--text-muted)' }}>
          <span>Day 1</span><span>Day 30</span><span>Day 60</span><span>Day 90</span>
        </div>
      </div>
    </div>
  )
}
