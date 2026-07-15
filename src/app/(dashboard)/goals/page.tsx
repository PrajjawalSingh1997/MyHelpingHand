'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Loader2, CheckCircle2, Circle, Target } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { Goal } from '@/types/database'

const GOAL_TYPES = ['life', 'annual', 'quarterly', 'monthly'] as const
type GoalType = typeof GOAL_TYPES[number]

const TYPE_LABEL: Record<GoalType, string> = {
  life: '🌟 Life Goals',
  annual: '📅 Annual Goals',
  quarterly: '📊 Quarterly Goals',
  monthly: '🗓️ Monthly Goals',
}

const STATUS_OPTIONS = ['not_started', 'in_progress', 'completed', 'on_hold'] as const
type GoalStatus = typeof STATUS_OPTIONS[number]
const STATUS_LABEL: Record<GoalStatus, string> = {
  not_started: 'Not Started',
  in_progress: 'In Progress',
  completed: 'Completed',
  on_hold: 'On Hold',
}
const STATUS_COLOR: Record<GoalStatus, string> = {
  not_started: 'var(--text-muted)',
  in_progress: 'var(--accent)',
  completed: 'var(--success)',
  on_hold: 'var(--warning)',
}

function GoalForm({ initial, onSave, onCancel }: {
  initial?: Partial<Goal>
  onSave: (g: Partial<Goal>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    description: initial?.description ?? '',
    goal_type: (initial?.goal_type ?? 'monthly') as GoalType,
    status: (initial?.status ?? 'not_started') as GoalStatus,
    target_value: initial?.target_value ?? '',
    current_value: initial?.current_value ?? '',
    unit: initial?.unit ?? '',
    deadline: initial?.deadline ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!f.title.trim()) { setError('Goal title is required.'); return }
    setSaving(true)
    setError('')
    await onSave(f)
    setSaving(false)
  }

  return (
    <div className="space-y-3 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div>
        <label className="label">Goal Title</label>
        <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })}
          placeholder="e.g. Get 10 freelance clients" className="input mt-1 w-full" />
      </div>
      <div>
        <label className="label">Description (optional)</label>
        <textarea value={f.description ?? ''} onChange={e => setF({ ...f, description: e.target.value })}
          rows={2} className="input mt-1 w-full resize-none" />
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Type</label>
          <select value={f.goal_type} onChange={e => setF({ ...f, goal_type: e.target.value as GoalType })} className="input mt-1 w-full">
            {GOAL_TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Status</label>
          <select value={f.status} onChange={e => setF({ ...f, status: e.target.value as GoalStatus })} className="input mt-1 w-full">
            {STATUS_OPTIONS.map(s => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Target</label>
          <input value={String(f.target_value ?? '')} onChange={e => setF({ ...f, target_value: e.target.value })} className="input mt-1 w-full" placeholder="10" />
        </div>
        <div className="flex-1">
          <label className="label">Current</label>
          <input value={String(f.current_value ?? '')} onChange={e => setF({ ...f, current_value: e.target.value })} className="input mt-1 w-full" placeholder="3" />
        </div>
        <div className="flex-1">
          <label className="label">Unit</label>
          <input value={f.unit ?? ''} onChange={e => setF({ ...f, unit: e.target.value })} className="input mt-1 w-full" placeholder="clients" />
        </div>
        <div className="flex-1">
          <label className="label">Deadline</label>
          <input type="date" value={f.deadline ?? ''} onChange={e => setF({ ...f, deadline: e.target.value })} className="input mt-1 w-full" />
        </div>
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2 pt-1">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Goal'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

function GoalCard({ goal, onEdit, onDelete, onToggle }: {
  goal: Goal
  onEdit: () => void
  onDelete: () => void
  onToggle: () => void
}) {
  const tgt = parseFloat(String(goal.target_value ?? '0'))
  const cur = parseFloat(String(goal.current_value ?? '0'))
  const pct = tgt > 0 ? Math.min(Math.round((cur / tgt) * 100), 100) : 0
  const status = (goal.status ?? 'not_started') as GoalStatus

  return (
    <div className="card group relative">
      <div className="flex items-start justify-between">
        <div className="flex items-start gap-3">
          <button onClick={onToggle} className="mt-0.5 flex-shrink-0 transition-colors"
            style={{ color: status === 'completed' ? 'var(--success)' : 'var(--border)' }}>
            {status === 'completed' ? <CheckCircle2 size={20} /> : <Circle size={20} />}
          </button>
          <div className="flex-1">
            <p className="text-sm font-semibold" style={{ color: 'var(--text)', textDecoration: status === 'completed' ? 'line-through' : 'none' }}>
              {goal.title}
            </p>
            {goal.description && (
              <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>{goal.description}</p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-xs rounded-full px-2 py-0.5" style={{ background: `${STATUS_COLOR[status]}20`, color: STATUS_COLOR[status] }}>
            {STATUS_LABEL[status]}
          </span>
          <button onClick={onEdit} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
          <button onClick={onDelete} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
        </div>
      </div>

      {tgt > 0 && (
        <div className="mt-3">
          <div className="flex justify-between text-xs mb-1" style={{ color: 'var(--text-muted)' }}>
            <span>{cur} / {tgt} {goal.unit}</span>
            <span>{pct}%</span>
          </div>
          <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
          </div>
        </div>
      )}

      {goal.deadline && (
        <p className="mt-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>
          Deadline: {new Date(goal.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
        </p>
      )}
    </div>
  )
}

export default function GoalsPage() {
  const { show } = useToast()
  const [goals, setGoals]   = useState<Goal[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState<GoalType>('monthly')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('goals').select('*').eq('user_id', user.id).order('created_at') as { data: Goal[] | null }
      setGoals(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addGoal = async (partial: Partial<Goal>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('goals').insert({ ...partial, user_id: userId }).select().single() as { data: Goal | null; error: any }
    if (data && !error) {
      setGoals(prev => [...prev, data])
      show('Goal created!', 'success')
    } else {
      show('Failed to create goal.', 'error')
    }
    setAdding(false)
  }

  const updateGoal = async (id: string, partial: Partial<Goal>) => {
    const supabase = createClient()
    const { error } = await supabase.from('goals').update(partial).eq('id', id)
    if (!error) {
      setGoals(prev => prev.map(g => g.id === id ? { ...g, ...partial } : g))
      if (editingId === id) show('Goal updated!', 'success')
    } else {
      show('Failed to update goal.', 'error')
    }
    setEditingId(null)
  }

  const deleteGoal = async (id: string) => {
    if (!confirm('Delete this goal?')) return
    const supabase = createClient()
    await supabase.from('goals').delete().eq('id', id)
    setGoals(prev => prev.filter(g => g.id !== id))
  }

  const toggleGoal = async (id: string) => {
    const goal = goals.find(g => g.id === id)
    if (!goal) return
    if (goal.status === 'completed') {
      // Restore whatever status the goal had before it was marked complete
      const restored = (goal.previous_status ?? 'not_started') as GoalStatus
      await updateGoal(id, { status: restored, previous_status: null })
    } else {
      await updateGoal(id, { status: 'completed', previous_status: goal.status })
    }
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const tabGoals = goals.filter(g => g.goal_type === activeTab)
  const completedCount = goals.filter(g => g.status === 'completed').length

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>🎯 Goals</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{completedCount}/{goals.length} goals completed</p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }}
          className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Goal
        </button>
      </div>

      <div className="flex gap-1 rounded-lg p-1" style={{ background: 'var(--surface)' }}>
        {GOAL_TYPES.map(t => {
          const c = goals.filter(g => g.goal_type === t).length
          return (
            <button key={t} onClick={() => setActiveTab(t)}
              className="flex-1 rounded-md px-3 py-2 text-xs font-medium transition-all"
              style={{ background: activeTab === t ? 'var(--accent)' : 'transparent', color: activeTab === t ? '#fff' : 'var(--text-muted)' }}>
              {t.charAt(0).toUpperCase() + t.slice(1)} ({c})
            </button>
          )
        })}
      </div>

      <h2 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{TYPE_LABEL[activeTab]}</h2>

      {adding && (
        <GoalForm initial={{ goal_type: activeTab }} onSave={addGoal} onCancel={() => setAdding(false)} />
      )}

      {tabGoals.length === 0 && !adding && (
        <div className="card text-center py-12">
          <Target size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No {activeTab} goals yet. Add one above.</p>
        </div>
      )}

      <div className="space-y-3">
        {tabGoals.map(goal => {
          if (editingId === goal.id) {
            return (
              <GoalForm key={goal.id} initial={goal}
                onSave={p => updateGoal(goal.id, p)}
                onCancel={() => setEditingId(null)} />
            )
          }
          return (
            <GoalCard key={goal.id} goal={goal}
              onEdit={() => { setEditingId(goal.id); setAdding(false) }}
              onDelete={() => deleteGoal(goal.id)}
              onToggle={() => toggleGoal(goal.id)} />
          )
        })}
      </div>
    </div>
  )
}
