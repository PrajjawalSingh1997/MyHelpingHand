'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, subDays, parseISO, differenceInCalendarDays } from 'date-fns'
import { Plus, Pencil, Trash2, Loader2, Check } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { Habit, HabitLog } from '@/types/database'

function HabitForm({ initial, onSave, onCancel }: {
  initial?: Partial<Habit>
  onSave: (e: Partial<Habit>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    name: initial?.name ?? '',
    emoji: initial?.emoji ?? '✅',
    color: initial?.color ?? '#6C5CE7',
    frequency: (initial?.frequency ?? 'daily') as 'daily' | 'weekly',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  const handleSave = async () => {
    if (!f.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    await onSave(f)
    setSaving(false)
  }

  return (
    <div className="space-y-3 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex flex-wrap gap-3">
        <div className="w-16">
          <label className="label">Emoji</label>
          <input type="text" value={f.emoji} onChange={e => setF({ ...f, emoji: e.target.value })} className="input mt-1 w-full text-center" maxLength={2} />
        </div>
        <div className="flex-1">
          <label className="label">Habit Name</label>
          <input type="text" value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="input mt-1 w-full" placeholder="Drink water, Read 10 pages..." />
        </div>
        <div>
          <label className="label">Color</label>
          <input type="color" value={f.color} onChange={e => setF({ ...f, color: e.target.value })} className="mt-1 block h-9 w-12 cursor-pointer rounded border-0 p-1" style={{ background: 'var(--surface2)' }} />
        </div>
        <div>
          <label className="label">Frequency</label>
          <select value={f.frequency} onChange={e => setF({ ...f, frequency: e.target.value as 'daily' | 'weekly' })} className="input mt-1">
            <option value="daily">Daily</option>
            <option value="weekly">Weekly</option>
          </select>
        </div>
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving} className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function HabitsPage() {
  const { show } = useToast()
  const [habits, setHabits] = useState<Habit[]>([])
  const [logs, setLogs] = useState<HabitLog[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)

  const todayStr = format(new Date(), 'yyyy-MM-dd')
  // Last 7 days including today
  const last7Days = Array.from({ length: 7 }, (_, i) => format(subDays(new Date(), 6 - i), 'yyyy-MM-dd'))

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const sevenDaysAgo = format(subDays(new Date(), 6), 'yyyy-MM-dd')

      // Fetch habits and logs concurrently
      const [habitsRes, logsRes] = await Promise.all([
        supabase.from('habits').select('*').eq('user_id', user.id).order('sort_order', { ascending: true }).order('created_at', { ascending: true }),
        supabase.from('habit_logs').select('*').eq('user_id', user.id).gte('date', sevenDaysAgo),
      ])

      setHabits((habitsRes.data as Habit[]) ?? [])
      setLogs((logsRes.data as HabitLog[]) ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addHabit = async (partial: Partial<Habit>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('habits').insert({ ...partial, user_id: userId }).select().single()
    if (data && !error) { setHabits([...habits, data as Habit]); show('Habit created!', 'success') }
    else show('Failed to create habit.', 'error')
    setAdding(false)
  }

  const updateHabit = async (id: string, partial: Partial<Habit>) => {
    const supabase = createClient()
    const { error } = await supabase.from('habits').update(partial).eq('id', id)
    if (!error) { setHabits(habits.map(h => h.id === id ? { ...h, ...partial } : h)); show('Habit updated!', 'success') }
    else show('Failed to update habit.', 'error')
    setEditingId(null)
  }

  const deleteHabit = async (id: string) => {
    if (!confirm('Delete this habit? Logs will be lost.')) return
    const supabase = createClient()
    const { error } = await supabase.from('habits').delete().eq('id', id)
    if (!error) { setHabits(habits.filter(h => h.id !== id)); show('Habit deleted.', 'success') }
    else show('Failed to delete habit.', 'error')
  }

  const toggleHabit = async (habitId: string, date: string, currentDone: boolean) => {
    if (!userId) return
    const supabase = createClient()
    const newDone = !currentDone

    // Optimistic update
    const existingLog = logs.find(l => l.habit_id === habitId && l.date === date)
    if (existingLog) {
      setLogs(logs.map(l => l.id === existingLog.id ? { ...l, done: newDone } : l))
    } else {
      setLogs([...logs, { id: 'temp', user_id: userId, habit_id: habitId, date, done: newDone } as HabitLog])
    }

    const { data, error } = await supabase.from('habit_logs').upsert({
      user_id: userId,
      habit_id: habitId,
      date,
      done: newDone,
    }, { onConflict: 'habit_id,date' }).select().single()

    if (error) {
      // Revert optimistic update
      show('Failed to log habit.', 'error')
      setLogs(logs.filter(l => l.id !== 'temp').map(l => l.id === existingLog?.id ? { ...l, done: currentDone } : l))
    } else if (data) {
      // Update with real ID if it was new
      setLogs(prev => prev.map(l => (l.habit_id === habitId && l.date === date) ? data as HabitLog : l))
      show(newDone ? 'Habit completed!' : 'Habit un-completed', 'success')
    }
  }

  // Calculate streak for a habit (this requires fetching all past logs for accurate streaks, 
  // but for now we'll do a simple streak based on the last 7 days + a fetch for the specific habit's full history if needed.
  // To keep it simple per LAUNCH_PLAN: "query habit_logs ordered by date DESC, break on first gap".
  // Actually, we should fetch all logs to compute streak properly. We only fetched last 7 days.
  // Let's fetch all logs for streaks in a separate effect.
  const [allLogs, setAllLogs] = useState<HabitLog[]>([])
  useEffect(() => {
    if (!userId) return
    async function loadAllLogs() {
      const supabase = createClient()
      const { data } = await supabase.from('habit_logs').select('*').eq('user_id', userId).eq('done', true).order('date', { ascending: false })
      if (data) setAllLogs(data as HabitLog[])
    }
    loadAllLogs()
  }, [userId, logs])

  const calculateStreak = (habitId: string) => {
    const habitLogs = allLogs.filter(l => l.habit_id === habitId)
    if (habitLogs.length === 0) return 0

    let streak = 0
    let currentDate = new Date()

    // If not done today, start checking from yesterday
    const doneToday = habitLogs.some(l => l.date === todayStr)
    if (!doneToday) {
      currentDate = subDays(currentDate, 1)
    }

    for (const log of habitLogs) {
      const logDate = parseISO(log.date)
      const diff = differenceInCalendarDays(currentDate, logDate)
      
      if (diff === 0) {
        streak++
        currentDate = subDays(currentDate, 1)
      } else if (diff < 0) {
        // Future date? Ignore.
        continue
      } else {
        // Gap found
        break
      }
    }
    return streak
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>✅ Habits Tracker</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Build routines and maintain your streaks.</p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Habit
        </button>
      </div>

      {adding && <HabitForm onSave={addHabit} onCancel={() => setAdding(false)} />}

      <div className="card overflow-x-auto">
        <div className="min-w-[700px]">
          {habits.length === 0 && !adding && (
            <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No habits yet. Add your first habit to start your streak.</p>
          )}
          {habits.length > 0 && (
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-[#2D2D3F]">
                  <th className="pb-3 text-sm font-medium text-[#94A3B8] w-1/4">Habit</th>
                  <th className="pb-3 text-sm font-medium text-[#94A3B8] text-center">Streak</th>
                  {last7Days.map(d => (
                    <th key={d} className="pb-3 text-xs font-medium text-[#64748B] text-center w-12">
                      <div className="flex flex-col items-center">
                        <span>{format(parseISO(d), 'E')}</span>
                        <span className={d === todayStr ? 'text-[#E2E8F0] font-bold' : ''}>{format(parseISO(d), 'd')}</span>
                      </div>
                    </th>
                  ))}
                  <th className="pb-3 w-16"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-[#2D2D3F]">
                {habits.map(habit => {
                  if (editingId === habit.id) {
                    return (
                      <tr key={habit.id}>
                        <td colSpan={10} className="py-2">
                          <HabitForm initial={habit} onSave={p => updateHabit(habit.id, p)} onCancel={() => setEditingId(null)} />
                        </td>
                      </tr>
                    )
                  }

                  const streak = calculateStreak(habit.id)

                  return (
                    <tr key={habit.id} className="group transition-colors hover:bg-[#1A1A26]">
                      <td className="py-3 pr-4">
                        <div className="flex items-center gap-3">
                          <span className="text-xl">{habit.emoji}</span>
                          <span className="font-medium text-[#E2E8F0]">{habit.name}</span>
                        </div>
                      </td>
                      <td className="py-3 text-center">
                        <span className="inline-flex items-center justify-center rounded-full bg-[#1A1A26] px-3 py-1 text-xs font-bold" style={{ color: habit.color, border: `1px solid ${habit.color}40` }}>
                          🔥 {streak}
                        </span>
                      </td>
                      {last7Days.map(date => {
                        const isDone = logs.some(l => l.habit_id === habit.id && l.date === date && l.done)
                        return (
                          <td key={date} className="py-3 text-center">
                            <button
                              onClick={() => toggleHabit(habit.id, date, isDone)}
                              className="flex h-8 w-8 items-center justify-center rounded-md mx-auto transition-all duration-200"
                              style={{ 
                                backgroundColor: isDone ? habit.color : '#1A1A26',
                                border: isDone ? 'none' : '1px solid #2D2D3F'
                              }}
                            >
                              {isDone && <Check size={14} className="text-white" />}
                            </button>
                          </td>
                        )
                      })}
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => { setEditingId(habit.id); setAdding(false) }} className="rounded p-1.5 text-[#64748B] hover:text-[#E2E8F0] hover:bg-[#2D2D3F]"><Pencil size={14} /></button>
                          <button onClick={() => deleteHabit(habit.id)} className="rounded p-1.5 text-[#FF6B6B] hover:bg-[#FF6B6B] hover:text-white"><Trash2 size={14} /></button>
                        </div>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  )
}
