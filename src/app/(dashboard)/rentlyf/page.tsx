'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Plus, Loader2, Clock } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { RentlyfLog } from '@/types/database'

export default function RentlyfPage() {
  const { show } = useToast()
  const [logs, setLogs]     = useState<RentlyfLog[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [date, setDate]     = useState(format(new Date(), 'yyyy-MM-dd'))
  const [hours, setHours]   = useState('')
  const [category, setCategory] = useState('dashboard')
  const [notes, setNotes]   = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('rentlyf_logs').select('*').eq('user_id', user.id).order('date', { ascending: false }).limit(60) as { data: RentlyfLog[] | null }
      setLogs(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addLog = async () => {
    if (!userId || !hours) return
    setSaving(true)
    const supabase = createClient()
    const { data } = await supabase.from('rentlyf_logs').upsert(
      { user_id: userId, date, hours: parseFloat(hours), category, notes },
      { onConflict: 'user_id,date' }
    ).select().single() as { data: RentlyfLog | null }
    if (data) {
      setLogs(prev => {
        const without = prev.filter(l => l.date !== date)
        return [data, ...without].sort((a, b) => b.date.localeCompare(a.date))
      })
      show('Hours logged!', 'success')
    } else {
      show('Failed to log hours.', 'error')
    }
    setHours('')
    setNotes('')
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const totalHours   = logs.reduce((s, l) => s + (l.hours ?? 0), 0)
  const thisWeekHours = logs
    .filter(l => {
      const diff = (new Date().getTime() - new Date(l.date).getTime()) / 86400000
      return diff >= 0 && diff < 7
    })
    .reduce((s, l) => s + (l.hours ?? 0), 0)
  const avgPerDay    = logs.length > 0 ? (totalHours / logs.length).toFixed(1) : '0'

  // Group by week
  const byWeek: Record<string, RentlyfLog[]> = {}
  logs.forEach(l => {
    const d = new Date(l.date)
    const weekStart = new Date(d)
    weekStart.setDate(d.getDate() - d.getDay())
    const key = format(weekStart, 'MMM d')
    if (!byWeek[key]) byWeek[key] = []
    byWeek[key].push(l)
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🏠 Rentlyf</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Track hours worked on Rentlyf platform</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total Hours', value: totalHours.toFixed(1), sub: 'all time' },
          { label: 'This Week',   value: thisWeekHours.toFixed(1), sub: 'last 7 days' },
          { label: 'Daily Avg',   value: avgPerDay, sub: 'hours per day' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2 mb-1"><Clock size={16} style={{ color: 'var(--accent)' }} /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}h</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Log entry */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Log Hours</h3>
        <div className="flex gap-3 items-end">
          <div>
            <label className="label">Date</label>
            <input type="date" value={date} onChange={e => setDate(e.target.value)} className="input mt-1" />
          </div>
          <div className="w-24">
            <label className="label">Hours</label>
            <input type="number" value={hours} onChange={e => setHours(e.target.value)} min="0" max="24" step="0.5" className="input mt-1 w-full" placeholder="2.5" />
          </div>
          <div>
            <label className="label">Category</label>
            <select value={category} onChange={e => setCategory(e.target.value)} className="input mt-1">
              {['dashboard', 'development', 'design', 'meeting', 'support', 'other'].map(c => (
                <option key={c} value={c}>{c.charAt(0).toUpperCase() + c.slice(1)}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Notes</label>
            <input value={notes} onChange={e => setNotes(e.target.value)} className="input mt-1 w-full" placeholder="What did you work on?" />
          </div>
          <button onClick={addLog} disabled={saving || !hours}
            className="flex items-center gap-2 btn-primary text-sm"
            style={{ opacity: saving || !hours ? 0.5 : 1 }}>
            <Plus size={16} /> {saving ? 'Saving...' : 'Log'}
          </button>
        </div>
      </div>

      {/* Logs by week */}
      {Object.entries(byWeek).map(([weekLabel, weekLogs]) => {
        const weekTotal = weekLogs.reduce((s, l) => s + (l.hours ?? 0), 0)
        return (
          <div key={weekLabel} className="card">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Week of {weekLabel}</h3>
              <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{weekTotal.toFixed(1)}h</span>
            </div>
            <div className="space-y-2">
              {weekLogs.map(log => (
                <div key={log.id} className="flex items-center justify-between py-1 border-b" style={{ borderColor: 'var(--border)' }}>
                  <div>
                    <span className="text-xs font-medium" style={{ color: 'var(--text)' }}>
                      {format(parseISO(log.date), 'EEE, MMM d')}
                    </span>
                    {log.notes && <span className="ml-2 text-xs" style={{ color: 'var(--text-muted)' }}>{log.notes}</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{log.category}</span>
                    <span className="text-sm font-bold" style={{ color: 'var(--accent)' }}>{(log.hours ?? 0).toFixed(1)}h</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )
      })}

      {logs.length === 0 && (
        <div className="card text-center py-12">
          <Clock size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No hours logged yet. Start logging above.</p>
        </div>
      )}
    </div>
  )
}
