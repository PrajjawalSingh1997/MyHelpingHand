'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Loader2, BookOpen, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { LearningResource } from '@/types/database'

const STATUSES = ['not_started', 'in_progress', 'completed', 'on_hold'] as const
type LStatus = typeof STATUSES[number]
const STATUS_COLOR: Record<LStatus, string> = {
  not_started: 'var(--text-muted)',
  in_progress: 'var(--accent)',
  completed: 'var(--success)',
  on_hold: 'var(--warning)',
}

const TYPES = ['course', 'book', 'tutorial', 'documentation', 'video', 'podcast', 'other'] as const

function ResourceForm({ initial, onSave, onCancel }: {
  initial?: Partial<LearningResource>
  onSave: (r: Partial<LearningResource>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    resource_type: initial?.resource_type ?? 'course',
    topic: initial?.topic ?? '',
    status: (initial?.status ?? 'not_started') as LStatus,
    url: initial?.url ?? '',
    notes: initial?.notes ?? '',
    total_lessons: initial?.total_lessons ?? '',
    completed_lessons: initial?.completed_lessons ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!f.title.trim()) { setError('Title is required.'); return }
    setSaving(true); setError('')
    await onSave(f)
    setSaving(false)
  }

  return (
    <div className="space-y-3 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Title</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="input mt-1 w-full" placeholder="React Masterclass..." />
        </div>
        <div className="w-32">
          <label className="label">Type</label>
          <select value={f.resource_type ?? ''} onChange={e => setF({ ...f, resource_type: e.target.value })} className="input mt-1 w-full">
            {TYPES.map(t => <option key={t} value={t}>{t.charAt(0).toUpperCase() + t.slice(1)}</option>)}
          </select>
        </div>
        <div className="w-40">
          <label className="label">Status</label>
          <select value={f.status} onChange={e => setF({ ...f, status: e.target.value as LStatus })} className="input mt-1 w-full">
            {STATUSES.map(s => <option key={s} value={s}>{s.replace('_', ' ').charAt(0).toUpperCase() + s.replace('_', ' ').slice(1)}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Topic / Skill</label>
          <input value={f.topic ?? ''} onChange={e => setF({ ...f, topic: e.target.value })} className="input mt-1 w-full" placeholder="React, TypeScript..." />
        </div>
        <div className="flex-1">
          <label className="label">URL</label>
          <input value={f.url ?? ''} onChange={e => setF({ ...f, url: e.target.value })} className="input mt-1 w-full" placeholder="https://..." />
        </div>
        <div className="w-24">
          <label className="label">Total</label>
          <input type="number" value={String(f.total_lessons ?? '')} onChange={e => setF({ ...f, total_lessons: e.target.value })} className="input mt-1 w-full" placeholder="40" />
        </div>
        <div className="w-24">
          <label className="label">Done</label>
          <input type="number" value={String(f.completed_lessons ?? '')} onChange={e => setF({ ...f, completed_lessons: e.target.value })} className="input mt-1 w-full" placeholder="12" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea value={f.notes ?? ''} onChange={e => setF({ ...f, notes: e.target.value })} rows={2} className="input mt-1 w-full resize-none" />
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Resource'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function LearningPage() {
  const { show } = useToast()
  const [resources, setResources] = useState<LearningResource[]>([])
  const [loading, setLoading]     = useState(true)
  const [userId, setUserId]       = useState<string | null>(null)
  const [adding, setAdding]       = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter]       = useState<LStatus | 'all'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('learning_resources').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as { data: LearningResource[] | null }
      setResources(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addResource = async (partial: Partial<LearningResource>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('learning_resources').insert({ ...partial, user_id: userId }).select().single() as { data: LearningResource | null; error: any }
    if (data && !error) { setResources(prev => [data, ...prev]); show('Resource added!', 'success') }
    else show('Failed to add resource.', 'error')
    setAdding(false)
  }

  const updateResource = async (id: string, partial: Partial<LearningResource>) => {
    const supabase = createClient()
    const { error } = await supabase.from('learning_resources').update(partial).eq('id', id)
    if (!error) { setResources(prev => prev.map(r => r.id === id ? { ...r, ...partial } : r)); show('Resource updated!', 'success') }
    else show('Failed to update resource.', 'error')
    setEditingId(null)
  }

  const deleteResource = async (id: string) => {
    if (!confirm('Delete this resource?')) return
    const supabase = createClient()
    const { error } = await supabase.from('learning_resources').delete().eq('id', id)
    if (!error) { setResources(prev => prev.filter(r => r.id !== id)); show('Resource deleted.', 'success') }
    else show('Failed to delete.', 'error')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const filtered = filter === 'all' ? resources : resources.filter(r => r.status === filter)
  const counts = Object.fromEntries(STATUSES.map(s => [s, resources.filter(r => r.status === s).length]))
  const inProgress = resources.filter(r => r.status === 'in_progress')

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📚 Learning</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            {counts['in_progress'] ?? 0} in progress · {counts['completed'] ?? 0} completed
          </p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Resource
        </button>
      </div>

      {/* Currently in progress */}
      {inProgress.length > 0 && (
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold" style={{ color: 'var(--text)' }}>Currently Learning</h3>
          <div className="space-y-3">
            {inProgress.map(r => {
              const total     = parseFloat(String(r.total_lessons ?? '0'))
              const completed = parseFloat(String(r.completed_lessons ?? '0'))
              const pct       = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0
              return (
                <div key={r.id} className="flex items-center gap-4">
                  <BookOpen size={18} style={{ color: 'var(--accent)' }} />
                  <div className="flex-1">
                    <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>{r.title}</p>
                    {total > 0 && (
                      <>
                        <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                          <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                        </div>
                        <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>{completed}/{total} lessons ({pct}%)</p>
                      </>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{ background: filter === s ? 'var(--accent)' : 'var(--surface)', color: filter === s ? '#fff' : 'var(--text-muted)' }}>
            {s === 'all' ? `All (${resources.length})` : `${s.replace('_', ' ')} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {adding && <ResourceForm onSave={addResource} onCancel={() => setAdding(false)} />}

      {filtered.length === 0 && !adding && (
        <div className="card text-center py-12">
          <BookOpen size={40} className="mx-auto mb-3" style={{ color: 'var(--text-muted)' }} />
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No resources here yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(r => {
          if (editingId === r.id) {
            return (
              <ResourceForm key={r.id} initial={r}
                onSave={p => updateResource(r.id, p)}
                onCancel={() => setEditingId(null)} />
            )
          }
          const status = (r.status ?? 'not_started') as LStatus
          const total     = parseFloat(String(r.total_lessons ?? '0'))
          const completed = parseFloat(String(r.completed_lessons ?? '0'))
          const pct       = total > 0 ? Math.min(Math.round((completed / total) * 100), 100) : 0

          return (
            <div key={r.id} className="card group flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs rounded-full px-2 py-0.5"
                    style={{ background: `${STATUS_COLOR[status]}20`, color: STATUS_COLOR[status] }}>
                    {status.replace('_', ' ')}
                  </span>
                  <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{r.resource_type}</span>
                  {r.topic && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {r.topic}</span>}
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{r.title}</p>
                {r.notes && <p className="mt-0.5 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{r.notes}</p>}
                {total > 0 && (
                  <div className="mt-2">
                    <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                      <div className="h-full rounded-full" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
                    </div>
                    <p className="mt-0.5 text-[10px]" style={{ color: 'var(--text-muted)' }}>{completed}/{total} lessons</p>
                  </div>
                )}
                {r.url && (
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                    <ExternalLink size={11} /> Open resource
                  </a>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingId(r.id); setAdding(false) }} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={14} /></button>
                <button onClick={() => deleteResource(r.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
