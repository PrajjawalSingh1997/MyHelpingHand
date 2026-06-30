'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, subDays } from 'date-fns'
import { Plus, Loader2, Heart, Droplets, Moon, Dumbbell } from 'lucide-react'
import type { HealthLog } from '@/types/database'

function getBool(v: unknown): boolean { return v === true || v === 'true' }

export default function HealthPage() {
  const [logs, setLogs]     = useState<HealthLog[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  const [today] = useState(format(new Date(), 'yyyy-MM-dd'))
  const [form, setForm] = useState({
    date: format(new Date(), 'yyyy-MM-dd'),
    weight_kg: '',
    water_glasses: '',
    sleep_hours: '',
    exercise_done: false,
    yoga_done: false,
    meditation_done: false,
    skincare_done: false,
    exercise_notes: '',
    mood: '3',
    notes: '',
  })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const since = format(subDays(new Date(), 30), 'yyyy-MM-dd')
      const { data } = await supabase.from('health_logs').select('*')
        .eq('user_id', user.id).gte('date', since).order('date', { ascending: false }) as { data: HealthLog[] | null }
      const d = data ?? []
      setLogs(d)

      // Pre-fill form with today's log if it exists
      const todayLog = d.find(l => l.date === today)
      if (todayLog) {
        setForm({
          date: todayLog.date,
          weight_kg: String(todayLog.weight_kg ?? ''),
          water_glasses: String(todayLog.water_glasses ?? ''),
          sleep_hours: String(todayLog.sleep_hours ?? ''),
          exercise_done: getBool(todayLog.exercise_done),
          yoga_done: getBool(todayLog.yoga_done),
          meditation_done: getBool(todayLog.meditation_done),
          skincare_done: getBool(todayLog.skincare_done),
          exercise_notes: todayLog.exercise_notes ?? '',
          mood: String(todayLog.mood ?? '3'),
          notes: todayLog.notes ?? '',
        })
      }
      setLoading(false)
    }
    load()
  }, [today])

  const save = async () => {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    const payload = {
      user_id: userId,
      date: form.date,
      weight_kg: form.weight_kg ? parseFloat(form.weight_kg) : null,
      water_glasses: form.water_glasses ? parseInt(form.water_glasses) : null,
      sleep_hours: form.sleep_hours ? parseFloat(form.sleep_hours) : null,
      exercise_done: form.exercise_done,
      yoga_done: form.yoga_done,
      meditation_done: form.meditation_done,
      skincare_done: form.skincare_done,
      exercise_notes: form.exercise_notes || null,
      mood: parseInt(form.mood),
      notes: form.notes || null,
    }
    const { data } = await supabase.from('health_logs').upsert(payload, { onConflict: 'user_id,date' }).select().single() as { data: HealthLog | null }
    if (data) {
      setLogs(prev => {
        const without = prev.filter(l => l.date !== form.date)
        return [data, ...without].sort((a, b) => b.date.localeCompare(a.date))
      })
    }
    setSaving(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const recentLogs = logs.slice(0, 14)
  const avgSleep   = recentLogs.filter(l => l.sleep_hours).reduce((s, l) => s + (l.sleep_hours ?? 0), 0) / (recentLogs.filter(l => l.sleep_hours).length || 1)
  const avgWater   = recentLogs.filter(l => l.water_glasses).reduce((s, l) => s + (l.water_glasses ?? 0), 0) / (recentLogs.filter(l => l.water_glasses).length || 1)
  const exerciseDays = recentLogs.filter(l => l.exercise_done).length
  const meditationDays = recentLogs.filter(l => l.meditation_done).length

  const MOOD_EMOJI = ['', '😞', '😕', '😐', '🙂', '😄']

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>💪 Health Tracker</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Daily health log — track consistently for best results</p>
      </div>

      {/* Summary stats */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { icon: <Moon size={18} style={{ color: '#818cf8' }} />, label: 'Avg Sleep', value: `${avgSleep.toFixed(1)}h`, sub: 'last 14 days' },
          { icon: <Droplets size={18} style={{ color: '#38bdf8' }} />, label: 'Avg Water', value: `${avgWater.toFixed(1)} gl`, sub: 'last 14 days' },
          { icon: <Dumbbell size={18} style={{ color: 'var(--success)' }} />, label: 'Exercise', value: `${exerciseDays}d`, sub: 'last 14 days' },
          { icon: <Heart size={18} style={{ color: '#f43f5e' }} />, label: 'Meditation', value: `${meditationDays}d`, sub: 'last 14 days' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2 mb-2">{s.icon}<span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Log form */}
      <div className="card space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Daily Log</h2>
          <input type="date" value={form.date} onChange={e => {
            setForm({ ...form, date: e.target.value })
            const existing = logs.find(l => l.date === e.target.value)
            if (existing) {
              setForm(f => ({ ...f,
                date: e.target.value,
                weight_kg: String(existing.weight_kg ?? ''),
                water_glasses: String(existing.water_glasses ?? ''),
                sleep_hours: String(existing.sleep_hours ?? ''),
                exercise_done: getBool(existing.exercise_done),
                yoga_done: getBool(existing.yoga_done),
                meditation_done: getBool(existing.meditation_done),
                skincare_done: getBool(existing.skincare_done),
                exercise_notes: existing.exercise_notes ?? '',
                mood: String(existing.mood ?? '3'),
                notes: existing.notes ?? '',
              }))
            }
          }} className="input text-xs" />
        </div>

        {/* Checklist */}
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
          {([
            { key: 'exercise_done', label: '🏋️ Exercise', emoji: '🏋️' },
            { key: 'yoga_done', label: '🧘 Yoga', emoji: '🧘' },
            { key: 'meditation_done', label: '🧠 Meditation', emoji: '🧠' },
            { key: 'skincare_done', label: '✨ Skincare', emoji: '✨' },
          ] as const).map(item => {
            const checked = form[item.key]
            return (
              <button key={item.key} onClick={() => setForm(f => ({ ...f, [item.key]: !f[item.key] }))}
                className="flex items-center gap-3 rounded-xl px-4 py-3 text-sm transition-all"
                style={{ background: checked ? 'rgba(0,184,148,0.15)' : 'var(--surface-hover)', border: `1px solid ${checked ? 'var(--success)' : 'var(--border)'}`, color: checked ? 'var(--success)' : 'var(--text-muted)' }}>
                <span>{item.emoji}</span>
                <span className="font-medium">{item.label.replace(item.emoji + ' ', '')}</span>
                {checked && <span className="ml-auto text-xs">✓</span>}
              </button>
            )
          })}
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <label className="label">Weight (kg)</label>
            <input type="number" value={form.weight_kg} onChange={e => setForm({ ...form, weight_kg: e.target.value })} step="0.1" className="input mt-1 w-full" placeholder="70.0" />
          </div>
          <div>
            <label className="label">Water (glasses)</label>
            <input type="number" value={form.water_glasses} onChange={e => setForm({ ...form, water_glasses: e.target.value })} min="0" max="20" className="input mt-1 w-full" placeholder="8" />
          </div>
          <div>
            <label className="label">Sleep (hours)</label>
            <input type="number" value={form.sleep_hours} onChange={e => setForm({ ...form, sleep_hours: e.target.value })} step="0.5" min="0" max="24" className="input mt-1 w-full" placeholder="7.5" />
          </div>
          <div>
            <label className="label">Mood {MOOD_EMOJI[parseInt(form.mood)] ?? ''}</label>
            <input type="range" value={form.mood} onChange={e => setForm({ ...form, mood: e.target.value })} min="1" max="5" step="1" className="mt-2 w-full" />
            <div className="flex justify-between text-[10px] mt-1" style={{ color: 'var(--text-muted)' }}>
              <span>😞</span><span>😐</span><span>😄</span>
            </div>
          </div>
        </div>

        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Exercise Notes</label>
            <input value={form.exercise_notes} onChange={e => setForm({ ...form, exercise_notes: e.target.value })} className="input mt-1 w-full" placeholder="5km run, 20 push-ups..." />
          </div>
          <div className="flex-1">
            <label className="label">Notes</label>
            <input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input mt-1 w-full" placeholder="How you felt today..." />
          </div>
        </div>

        <button onClick={save} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          <Plus size={14} /> {saving ? 'Saving...' : 'Save Log'}
        </button>
      </div>

      {/* Last 14 days table */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Last 14 Days</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                {['Date', 'Weight', 'Water', 'Sleep', '🏋️', '🧘', '🧠', '✨', 'Mood', 'Notes'].map(h => (
                  <th key={h} className="py-2 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentLogs.map(log => (
                <tr key={log.id} className="border-b" style={{ borderColor: 'rgba(45,45,63,0.5)' }}>
                  <td className="py-2 pr-4 font-medium" style={{ color: log.date === today ? 'var(--accent)' : 'var(--text)' }}>
                    {format(parseISO(log.date), 'EEE, MMM d')}
                  </td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{log.weight_kg ? `${log.weight_kg}kg` : '—'}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{log.water_glasses ?? '—'}</td>
                  <td className="py-2 pr-4" style={{ color: 'var(--text-muted)' }}>{log.sleep_hours ? `${log.sleep_hours}h` : '—'}</td>
                  {(['exercise_done', 'yoga_done', 'meditation_done', 'skincare_done'] as const).map(k => (
                    <td key={k} className="py-2 pr-4">
                      <span style={{ color: getBool(log[k]) ? 'var(--success)' : 'var(--border)' }}>{getBool(log[k]) ? '✓' : '—'}</span>
                    </td>
                  ))}
                  <td className="py-2 pr-4">{MOOD_EMOJI[log.mood ?? 3]}</td>
                  <td className="py-2 max-w-[200px] truncate" style={{ color: 'var(--text-muted)' }}>{log.notes ?? '—'}</td>
                </tr>
              ))}
            </tbody>
          </table>
          {recentLogs.length === 0 && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No logs yet. Start logging above.</p>
          )}
        </div>
      </div>
    </div>
  )
}
