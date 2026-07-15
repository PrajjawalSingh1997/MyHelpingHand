'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Loader2, DollarSign } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { FreelanceProject } from '@/types/database'

const STATUSES = ['lead', 'proposal', 'active', 'completed', 'cancelled'] as const
type ProjStatus = typeof STATUSES[number]
const STATUS_COLOR: Record<ProjStatus, string> = {
  lead: 'var(--text-muted)',
  proposal: 'var(--warning)',
  active: 'var(--accent)',
  completed: 'var(--success)',
  cancelled: 'var(--danger)',
}
const PLATFORMS = ['Upwork', 'Fiverr', 'LinkedIn', 'Direct', 'Referral', 'Other']

function ProjectForm({ initial, onSave, onCancel }: {
  initial?: Partial<FreelanceProject>
  onSave: (p: Partial<FreelanceProject>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    client_name: initial?.client_name ?? '',
    platform: initial?.platform ?? 'Upwork',
    status: (initial?.status ?? 'lead') as ProjStatus,
    budget: initial?.budget ?? '',
    paid_amount: initial?.paid_amount ?? '',
    currency: initial?.currency ?? 'INR',
    deadline: initial?.deadline ?? '',
    notes: initial?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!f.title.trim()) { setError('Project title is required.'); return }
    setSaving(true); setError('')
    await onSave({
      ...f,
      budget: f.budget !== '' ? parseFloat(String(f.budget)) : null,
      paid_amount: f.paid_amount !== '' ? parseFloat(String(f.paid_amount)) : null,
    })
    setSaving(false)
  }

  return (
    <div className="space-y-3 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Project Title</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="input mt-1 w-full" placeholder="Website redesign..." />
        </div>
        <div className="flex-1">
          <label className="label">Client Name</label>
          <input value={f.client_name ?? ''} onChange={e => setF({ ...f, client_name: e.target.value })} className="input mt-1 w-full" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="w-36">
          <label className="label">Platform</label>
          <select value={f.platform ?? ''} onChange={e => setF({ ...f, platform: e.target.value })} className="input mt-1 w-full">
            {PLATFORMS.map(p => <option key={p} value={p}>{p}</option>)}
          </select>
        </div>
        <div className="w-36">
          <label className="label">Status</label>
          <select value={f.status} onChange={e => setF({ ...f, status: e.target.value as ProjStatus })} className="input mt-1 w-full">
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="flex-1">
          <label className="label">Budget ({f.currency})</label>
          <input type="number" value={String(f.budget ?? '')} onChange={e => setF({ ...f, budget: e.target.value })} className="input mt-1 w-full" placeholder="0" />
        </div>
        <div className="flex-1">
          <label className="label">Paid Amount</label>
          <input type="number" value={String(f.paid_amount ?? '')} onChange={e => setF({ ...f, paid_amount: e.target.value })} className="input mt-1 w-full" placeholder="0" />
        </div>
        <div className="w-36">
          <label className="label">Deadline</label>
          <input type="date" value={f.deadline ?? ''} onChange={e => setF({ ...f, deadline: e.target.value })} className="input mt-1 w-full" />
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
          {saving ? 'Saving…' : 'Save Project'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function FreelancePage() {
  const { show } = useToast()
  const [projects, setProjects] = useState<FreelanceProject[]>([])
  const [loading, setLoading]   = useState(true)
  const [userId, setUserId]     = useState<string | null>(null)
  const [adding, setAdding]     = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter]     = useState<ProjStatus | 'all'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('freelance_projects').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as { data: FreelanceProject[] | null }
      setProjects(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addProject = async (partial: Partial<FreelanceProject>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('freelance_projects').insert({ ...partial, user_id: userId }).select().single() as { data: FreelanceProject | null; error: any }
    if (data && !error) { setProjects(prev => [data, ...prev]); show('Project created!', 'success') }
    else show('Failed to create project.', 'error')
    setAdding(false)
  }

  const updateProject = async (id: string, partial: Partial<FreelanceProject>) => {
    const supabase = createClient()
    const { error } = await supabase.from('freelance_projects').update(partial).eq('id', id)
    if (!error) { setProjects(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p)); show('Project updated!', 'success') }
    else show('Failed to update project.', 'error')
    setEditingId(null)
  }

  const deleteProject = async (id: string) => {
    if (!confirm('Delete this project?')) return
    const supabase = createClient()
    const { error } = await supabase.from('freelance_projects').delete().eq('id', id)
    if (!error) { setProjects(prev => prev.filter(p => p.id !== id)); show('Project deleted.', 'success') }
    else show('Failed to delete project.', 'error')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const filtered = filter === 'all' ? projects : projects.filter(p => p.status === filter)
  const totalEarned = projects.filter(p => p.status === 'completed').reduce((s, p) => s + parseFloat(String(p.paid_amount ?? '0')), 0)
  const activeRevenue = projects.filter(p => p.status === 'active').reduce((s, p) => s + parseFloat(String(p.budget ?? '0')), 0)
  const counts = Object.fromEntries(STATUSES.map(s => [s, projects.filter(p => p.status === s).length]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>💼 Freelance</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{projects.length} projects</p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Project
        </button>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        {[
          { label: 'Total Earned', value: `₹${totalEarned.toLocaleString('en-IN')}`, sub: 'from completed projects' },
          { label: 'Active Pipeline', value: `₹${activeRevenue.toLocaleString('en-IN')}`, sub: 'from active projects' },
          { label: 'Active Projects', value: counts['active'] ?? 0, sub: 'in progress now' },
        ].map(s => (
          <div key={s.label} className="card">
            <div className="flex items-center gap-2 mb-1"><DollarSign size={16} style={{ color: 'var(--success)' }} /><span className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.label}</span></div>
            <p className="text-2xl font-bold" style={{ color: 'var(--text)' }}>{s.value}</p>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{s.sub}</p>
          </div>
        ))}
      </div>

      {/* Status filter */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{ background: filter === s ? 'var(--accent)' : 'var(--surface)', color: filter === s ? '#fff' : 'var(--text-muted)' }}>
            {s === 'all' ? `All (${projects.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {adding && <ProjectForm onSave={addProject} onCancel={() => setAdding(false)} />}

      {filtered.length === 0 && !adding && (
        <div className="card text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No projects here yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(project => {
          if (editingId === project.id) {
            return (
              <ProjectForm key={project.id} initial={project}
                onSave={p => updateProject(project.id, p)}
                onCancel={() => setEditingId(null)} />
            )
          }
          const status = (project.status ?? 'lead') as ProjStatus
          const budget = parseFloat(String(project.budget ?? '0'))
          const paid   = parseFloat(String(project.paid_amount ?? '0'))
          const paidPct = budget > 0 ? Math.min(Math.round((paid / budget) * 100), 100) : 0

          return (
            <div key={project.id} className="card group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs rounded-full px-2 py-0.5 capitalize"
                      style={{ background: `${STATUS_COLOR[status]}20`, color: STATUS_COLOR[status] }}>{status}</span>
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{project.platform}</span>
                    {project.client_name && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>· {project.client_name}</span>}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{project.title}</p>
                  {project.notes && <p className="mt-1 text-xs" style={{ color: 'var(--text-muted)' }}>{project.notes}</p>}
                </div>
                <div className="flex items-center gap-3">
                  {budget > 0 && (
                    <div className="text-right">
                      <p className="text-sm font-bold" style={{ color: 'var(--text)' }}>₹{budget.toLocaleString('en-IN')}</p>
                      <p className="text-xs" style={{ color: 'var(--success)' }}>Paid: ₹{paid.toLocaleString('en-IN')}</p>
                    </div>
                  )}
                  <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={() => { setEditingId(project.id); setAdding(false) }} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={14} /></button>
                    <button onClick={() => deleteProject(project.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
                  </div>
                </div>
              </div>
              {budget > 0 && (
                <div className="mt-3">
                  <div className="h-1.5 w-full overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
                    <div className="h-full rounded-full" style={{ width: `${paidPct}%`, background: 'var(--success)' }} />
                  </div>
                  <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>{paidPct}% paid{project.deadline ? ` · Due ${new Date(project.deadline).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}` : ''}</p>
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}
