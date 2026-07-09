'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay, isSameMonth, differenceInCalendarDays } from 'date-fns'
import Link from 'next/link'
import { ChevronLeft, ChevronRight, Loader2 } from 'lucide-react'
import { EmptyCycle } from '@/components/ui/empty-cycle'
import type { NinetyDayCycle } from '@/types/database'

interface DayData {
  id: string
  day_number: number
  date: string
  plan_type: string
  tasks: { status: string }[]
}

export default function CalendarPage() {
  const [cycle, setCycle]   = useState<NinetyDayCycle | null>(null)
  const [days, setDays]     = useState<DayData[]>([])
  const [loading, setLoading] = useState(true)
  const [month, setMonth]   = useState(new Date())
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
      const dayNum = differenceInCalendarDays(today, new Date(c.start_date)) + 1
      setCurrentDay(Math.min(Math.max(dayNum, 1), 90))

      const { data: d } = await supabase
        .from('days').select('id, day_number, date, plan_type, tasks(status)')
        .eq('cycle_id', c.id).order('day_number') as { data: DayData[] | null }
      setDays(d ?? [])
      setLoading(false)

      if (c.start_date) setMonth(new Date(c.start_date))
    }
    load()
  }, [])

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )
  if (!cycle) return <EmptyCycle />

  const monthStart  = startOfMonth(month)
  const monthEnd    = endOfMonth(month)
  const calDays     = eachDayOfInterval({ start: monthStart, end: monthEnd })
  const startOffset = getDay(monthStart)

  const dayByDate = new Map(days.map(d => [d.date, d]))
  const today     = new Date()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📅 Calendar</h1>
        <div className="flex items-center gap-3">
          <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() - 1, 1))} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
          <span className="text-sm font-semibold w-32 text-center" style={{ color: 'var(--text)' }}>{format(month, 'MMMM yyyy')}</span>
          <button onClick={() => setMonth(m => new Date(m.getFullYear(), m.getMonth() + 1, 1))} className="btn-ghost p-2"><ChevronRight size={16} /></button>
        </div>
      </div>

      <div className="card">
        {/* Weekday headers */}
        <div className="grid grid-cols-7 mb-2">
          {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(d => (
            <div key={d} className="py-2 text-center text-xs font-medium" style={{ color: 'var(--text-muted)' }}>{d}</div>
          ))}
        </div>

        {/* Day cells */}
        <div className="grid grid-cols-7 gap-1">
          {Array.from({ length: startOffset }, (_, i) => <div key={`pad-${i}`} />)}

          {calDays.map(date => {
            const dateStr = format(date, 'yyyy-MM-dd')
            const dayData = dayByDate.get(dateStr)
            const isToday = isSameDay(date, today)
            const isCur   = isSameMonth(date, month)
            const future  = date > today

            const done  = dayData?.tasks.filter(t => t.status === 'completed' || t.status === 'skipped').length ?? 0
            const total = dayData?.tasks.length ?? 0
            const pct   = total > 0 ? done / total : 0

            const dotColor = future ? 'var(--border)' : !dayData ? 'transparent' : pct >= 0.8 ? 'var(--success)' : pct >= 0.5 ? 'var(--warning)' : 'var(--danger)'

            const cell = (
              <div className={`relative flex flex-col items-center rounded-lg p-2 transition-all ${dayData ? 'cursor-pointer hover:ring-1' : ''}`}
                style={{
                  background: isToday ? 'rgba(108,92,231,0.2)' : 'transparent',
                  opacity: isCur ? 1 : 0.4,
                  outline: isToday ? '1.5px solid var(--accent)' : 'none',
                }}>
                <span className="text-xs font-medium" style={{ color: isToday ? 'var(--accent)' : 'var(--text)' }}>
                  {format(date, 'd')}
                </span>
                {dayData && (
                  <span className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>D{dayData.day_number}</span>
                )}
                <div className="mt-1 h-1.5 w-1.5 rounded-full" style={{ background: dotColor }} />
                {total > 0 && (
                  <span className="text-[9px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{done}/{total}</span>
                )}
              </div>
            )

            return dayData
              ? <Link key={dateStr} href={`/day/${dayData.day_number}`}>{cell}</Link>
              : <div key={dateStr}>{cell}</div>
          })}
        </div>

        {/* Legend */}
        <div className="mt-4 flex items-center gap-4 border-t pt-3" style={{ borderColor: 'var(--border)' }}>
          {[
            { color: 'var(--success)', label: '≥80%' },
            { color: 'var(--warning)', label: '50–79%' },
            { color: 'var(--danger)',  label: '<50%' },
            { color: 'var(--border)', label: 'Future' },
          ].map(({ color, label }) => (
            <div key={label} className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: color }} />
              <span className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Upcoming days */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Upcoming Days</h3>
        <div className="space-y-2">
          {days
            .filter(d => d.day_number >= currentDay && d.day_number <= currentDay + 6)
            .map(day => {
              const done  = day.tasks.filter(t => t.status === 'completed').length
              const total = day.tasks.length
              return (
                <Link key={day.day_number} href={`/day/${day.day_number}`}
                  className="flex items-center justify-between rounded-lg px-4 py-2.5 transition-all"
                  style={{ background: day.day_number === currentDay ? 'rgba(108,92,231,0.1)' : 'var(--surface-hover)', border: day.day_number === currentDay ? '1px solid var(--accent)' : '1px solid transparent' }}>
                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold w-16" style={{ color: 'var(--accent)' }}>Day {day.day_number}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      {format(parseISO(day.date), 'EEE, MMM d')}
                    </span>
                    <span className={`badge text-[10px] ${day.plan_type === 'A' ? 'bg-blue-500/15 text-blue-400' : day.plan_type === 'B' ? 'bg-orange-500/15 text-orange-400' : 'bg-green-500/15 text-green-400'}`}>
                      Plan {day.plan_type}
                    </span>
                  </div>
                  <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{done}/{total} done</span>
                </Link>
              )
            })}
        </div>
      </div>
    </div>
  )
}
