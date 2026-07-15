'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, Loader2, Phone, Mail } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { CrmLead } from '@/types/database'

const STAGES = ['cold', 'warm', 'hot', 'proposal', 'client', 'lost'] as const
type LeadStage = typeof STAGES[number]
const STAGE_COLOR: Record<LeadStage, string> = {
  cold: '#64748b',
  warm: '#f59e0b',
  hot: '#ef4444',
  proposal: '#8b5cf6',
  client: '#10b981',
  lost: '#374151',
}
const STAGE_LABEL: Record<LeadStage, string> = {
  cold: '🥶 Cold',
  warm: '🔥 Warm',
  hot: '🚨 Hot',
  proposal: '📋 Proposal',
  client: '✅ Client',
  lost: '❌ Lost',
}

function LeadForm({ initial, onSave, onCancel }: {
  initial?: Partial<CrmLead>
  onSave: (l: Partial<CrmLead>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    name: initial?.name ?? '',
    company: initial?.company ?? '',
    email: initial?.email ?? '',
    phone: initial?.phone ?? '',
    stage: (initial?.stage ?? 'cold') as LeadStage,
    service: initial?.service ?? '',
    deal_value: String(initial?.deal_value ?? ''),
    source: initial?.source ?? '',
    next_followup: initial?.next_followup ?? '',
    notes: initial?.notes ?? '',
  })
  const [saving, setSaving] = useState(false)
  const [error, setError]   = useState('')

  const handleSave = async () => {
    if (!f.name.trim()) { setError('Name is required.'); return }
    setSaving(true); setError('')
    await onSave({ ...f, deal_value: f.deal_value ? parseFloat(f.deal_value) : null })
    setSaving(false)
  }

  return (
    <div className="space-y-3 rounded-xl p-5" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Name</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="input mt-1 w-full" placeholder="John Doe" />
        </div>
        <div className="flex-1">
          <label className="label">Company</label>
          <input value={f.company ?? ''} onChange={e => setF({ ...f, company: e.target.value })} className="input mt-1 w-full" />
        </div>
        <div className="w-32">
          <label className="label">Stage</label>
          <select value={f.stage} onChange={e => setF({ ...f, stage: e.target.value as LeadStage })} className="input mt-1 w-full">
            {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
          </select>
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Email</label>
          <input type="email" value={f.email ?? ''} onChange={e => setF({ ...f, email: e.target.value })} className="input mt-1 w-full" />
        </div>
        <div className="flex-1">
          <label className="label">Phone</label>
          <input value={f.phone ?? ''} onChange={e => setF({ ...f, phone: e.target.value })} className="input mt-1 w-full" />
        </div>
        <div className="flex-1">
          <label className="label">Service</label>
          <input value={f.service ?? ''} onChange={e => setF({ ...f, service: e.target.value })} className="input mt-1 w-full" placeholder="Web dev, design..." />
        </div>
        <div className="w-32">
          <label className="label">Deal Value (₹)</label>
          <input type="number" value={f.deal_value} onChange={e => setF({ ...f, deal_value: e.target.value })} className="input mt-1 w-full" />
        </div>
      </div>
      <div className="flex flex-wrap gap-3">
        <div className="flex-1">
          <label className="label">Source</label>
          <select value={f.source ?? ''} onChange={e => setF({ ...f, source: e.target.value })} className="input mt-1 w-full">
            {['LinkedIn', 'Cold Call', 'Referral', 'Upwork', 'Website', 'Instagram', 'Other'].map(s => <option key={s} value={s}>{s}</option>)}
          </select>
        </div>
        <div>
          <label className="label">Next Follow-up</label>
          <input type="date" value={f.next_followup ?? ''} onChange={e => setF({ ...f, next_followup: e.target.value })} className="input mt-1" />
        </div>
      </div>
      <div>
        <label className="label">Notes</label>
        <textarea value={f.notes ?? ''} onChange={e => setF({ ...f, notes: e.target.value })} rows={3} className="input mt-1 w-full resize-none" />
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Lead'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

function ColdCallLog({ userId, leads }: { userId: string; leads: CrmLead[] }) {
  const [calls, setCalls] = useState<{ id: string; date: string; name: string; phone: string; outcome: string; notes: string; lead_id: string | null }[]>([])
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [form, setForm] = useState({ date: format(new Date(), 'yyyy-MM-dd'), name: '', phone: '', outcome: 'no_answer', notes: '', lead_id: '' })

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data } = await supabase.from('cold_calls').select('*').eq('user_id', userId).order('date', { ascending: false }).limit(30) as { data: any[] | null }
      setCalls(data ?? [])
    }
    load()
  }, [userId])

  const save = async () => {
    const supabase = createClient()
    if (editingId) {
      const payload = { ...form, lead_id: form.lead_id || null }
      const { data } = await supabase.from('cold_calls').update(payload).eq('id', editingId).select().single() as { data: any }
      if (data) setCalls(prev => prev.map(c => c.id === editingId ? data : c))
      setEditingId(null)
    } else {
      const payload = { ...form, user_id: userId, lead_id: form.lead_id || null }
      const { data } = await supabase.from('cold_calls').insert(payload).select().single() as { data: any }
      if (data) setCalls(prev => [data, ...prev])
      setAdding(false)
    }
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), name: '', phone: '', outcome: 'no_answer', notes: '', lead_id: '' })
  }

  const deleteCall = async (id: string) => {
    if (!confirm('Delete this call log?')) return
    const supabase = createClient()
    const { error } = await supabase.from('cold_calls').delete().eq('id', id)
    if (!error) setCalls(prev => prev.filter(c => c.id !== id))
  }

  const openEdit = (call: any) => {
    setForm({ date: call.date, name: call.name, phone: call.phone, outcome: call.outcome, notes: call.notes || '', lead_id: call.lead_id || '' })
    setEditingId(call.id)
    setAdding(false)
  }

  const cancel = () => {
    setAdding(false)
    setEditingId(null)
    setForm({ date: format(new Date(), 'yyyy-MM-dd'), name: '', phone: '', outcome: 'no_answer', notes: '', lead_id: '' })
  }

  const updateOutcome = async (id: string, newOutcome: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('cold_calls').update({ outcome: newOutcome }).eq('id', id)
    if (!error) setCalls(prev => prev.map(c => c.id === id ? { ...c, outcome: newOutcome } : c))
  }

  const OUTCOME_LABEL: Record<string, string> = { no_answer: '📵 No Answer', interested: '✅ Interested', not_interested: '❌ Not Interested', callback: '🔔 Callback', converted: '🎯 Converted' }
  const OUTCOME_COLOR: Record<string, string> = { no_answer: 'var(--text-muted)', interested: 'var(--success)', not_interested: 'var(--danger)', callback: 'var(--warning)', converted: 'var(--accent)' }

  return (
    <div className="card">
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Cold Call Log</h3>
        <button onClick={() => { setAdding(true); setEditingId(null); setForm({ date: format(new Date(), 'yyyy-MM-dd'), name: '', phone: '', outcome: 'no_answer', notes: '', lead_id: '' }) }} className="btn-ghost flex items-center gap-1 text-xs"><Plus size={13} /> Log Call</button>
      </div>
      {(adding || editingId) && (
        <div className="mb-4 space-y-3 rounded-xl p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
          <h4 className="text-xs font-bold mb-2" style={{ color: 'var(--text)' }}>{editingId ? 'Edit Call Log' : 'New Call Log'}</h4>
          <div className="flex flex-wrap gap-3">
            <div><label className="label">Date</label><input type="date" value={form.date} onChange={e => setForm({ ...form, date: e.target.value })} className="input mt-1" /></div>
            <div className="flex-1"><label className="label">Name</label><input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input mt-1 w-full" /></div>
            <div className="flex-1"><label className="label">Phone</label><input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input mt-1 w-full" /></div>
            <div className="flex-1">
              <label className="label">Linked Lead</label>
              <select value={form.lead_id} onChange={e => {
                const lId = e.target.value
                const lead = leads.find(l => l.id === lId)
                if (lead) setForm({ ...form, lead_id: lId, name: lead.name, phone: lead.phone ?? '' })
                else setForm({ ...form, lead_id: '' })
              }} className="input mt-1 w-full">
                <option value="">None</option>
                {leads.map(l => <option key={l.id} value={l.id}>{l.name}</option>)}
              </select>
            </div>
            <div className="flex-1">
              <label className="label">Outcome</label>
              <select value={form.outcome} onChange={e => setForm({ ...form, outcome: e.target.value })} className="input mt-1 w-full">
                {Object.keys(OUTCOME_LABEL).map(k => <option key={k} value={k}>{OUTCOME_LABEL[k]}</option>)}
              </select>
            </div>
          </div>
          <div><label className="label">Notes</label><input value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} className="input mt-1 w-full" /></div>
          <div className="flex gap-2"><button onClick={save} className="btn-primary text-sm">Save</button><button onClick={cancel} className="btn-ghost text-sm">Cancel</button></div>
        </div>
      )}
      <div className="space-y-2">
        {calls.slice(0, 10).map(c => (
          <div key={c.id} className="group flex items-center justify-between border-b py-2" style={{ borderColor: 'rgba(45,45,63,0.5)' }}>
            <div className="flex items-center gap-3">
              <Phone size={14} style={{ color: 'var(--text-muted)' }} />
              <div>
                <p className="text-sm font-medium" style={{ color: 'var(--text)' }}>
                  {c.name}
                  {c.lead_id && leads.find(l => l.id === c.lead_id) && (
                    <span className="ml-2 text-[10px] font-normal px-1.5 py-0.5 rounded" style={{ background: 'var(--surface-hover)', color: 'var(--accent)' }}>
                      Lead: {leads.find(l => l.id === c.lead_id)?.name}
                    </span>
                  )}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{c.phone} · {format(parseISO(c.date), 'MMM d')}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="text-right">
                <select value={c.outcome} onChange={e => updateOutcome(c.id, e.target.value)} className="input text-[10px] px-1 py-0.5 h-auto leading-tight" style={{ color: OUTCOME_COLOR[c.outcome] ?? 'var(--text-muted)' }}>
                  {Object.keys(OUTCOME_LABEL).map(k => <option key={k} value={k} style={{ color: 'var(--text)' }}>{OUTCOME_LABEL[k]}</option>)}
                </select>
                {c.notes && <p className="text-[10px] mt-0.5" style={{ color: 'var(--text-muted)' }}>{c.notes}</p>}
              </div>
              <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => openEdit(c)} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                <button onClick={() => deleteCall(c.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
              </div>
            </div>
          </div>
        ))}
        {calls.length === 0 && <p className="py-4 text-center text-xs" style={{ color: 'var(--text-muted)' }}>No calls logged yet.</p>}
      </div>
    </div>
  )
}

export default function CrmPage() {
  const { show } = useToast()
  const [leads, setLeads]   = useState<CrmLead[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filterStage, setFilterStage] = useState<LeadStage | 'all'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase.from('crm_leads').select('*').eq('user_id', user.id).order('created_at', { ascending: false }) as { data: CrmLead[] | null }
      setLeads(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addLead = async (partial: Partial<CrmLead>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('crm_leads').insert({ ...partial, user_id: userId }).select().single() as { data: CrmLead | null; error: any }
    if (data && !error) { setLeads(prev => [data, ...prev]); show('Lead added!', 'success') }
    else show('Failed to add lead.', 'error')
    setAdding(false)
  }

  const updateLead = async (id: string, partial: Partial<CrmLead>) => {
    const supabase = createClient()
    const { error } = await supabase.from('crm_leads').update(partial).eq('id', id)
    if (!error) {
      setLeads(prev => prev.map(l => l.id === id ? { ...l, ...partial } : l))
      if (editingId === id) show('Lead updated!', 'success')
    } else {
      if (editingId === id) show('Failed to update lead.', 'error')
    }
    setEditingId(null)
  }

  const deleteLead = async (id: string) => {
    if (!confirm('Delete this lead?')) return
    const supabase = createClient()
    const { error } = await supabase.from('crm_leads').delete().eq('id', id)
    if (!error) { setLeads(prev => prev.filter(l => l.id !== id)); show('Lead deleted.', 'success') }
    else show('Failed to delete lead.', 'error')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const filtered = filterStage === 'all' ? leads : leads.filter(l => l.stage === filterStage)
  const pipeline = leads.filter(l => !['lost', 'client'].includes(l.stage ?? '')).reduce((s, l) => s + (l.deal_value ?? 0), 0)
  const counts = Object.fromEntries(STAGES.map(s => [s, leads.filter(l => l.stage === s).length]))
  const overdueLeads = leads.filter(l => l.next_followup && new Date(l.next_followup) < new Date())

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📞 CRM</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>Pipeline: ₹{pipeline.toLocaleString('en-IN')} · {counts['client'] ?? 0} clients</p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> Add Lead
        </button>
      </div>

      {overdueLeads.length > 0 && (
        <div className="rounded-lg border p-3 mb-4 flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.1)', borderColor: 'rgba(239,68,68,0.3)' }}>
          <span style={{ color: 'var(--warning)' }}>
            ⚠️ {overdueLeads.length} lead{overdueLeads.length > 1 ? 's' : ''} with overdue follow-ups:
          </span>
          <span style={{ color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            {overdueLeads.map(l => l.name).join(', ')}
          </span>
        </div>
      )}

      {/* Pipeline kanban summary */}
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
        {STAGES.map(stage => (
          <button key={stage} onClick={() => setFilterStage(filterStage === stage ? 'all' : stage)}
            className="rounded-xl p-3 text-center transition-all"
            style={{ background: filterStage === stage ? `${STAGE_COLOR[stage]}30` : 'var(--surface)', outline: filterStage === stage ? `1px solid ${STAGE_COLOR[stage]}` : 'none' }}>
            <p className="text-lg font-bold" style={{ color: STAGE_COLOR[stage] }}>{counts[stage] ?? 0}</p>
            <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{STAGE_LABEL[stage]}</p>
          </button>
        ))}
      </div>

      {adding && <LeadForm onSave={addLead} onCancel={() => setAdding(false)} />}

      <div className="space-y-3">
        {filtered.length === 0 && !adding && (
          <div className="card text-center py-12">
            <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No leads in this stage yet.</p>
          </div>
        )}
        {filtered.map(lead => {
          if (editingId === lead.id) {
            return (
              <LeadForm key={lead.id} initial={lead}
                onSave={p => updateLead(lead.id, p)}
                onCancel={() => setEditingId(null)} />
            )
          }
          const stage = (lead.stage ?? 'cold') as LeadStage
          const isOverdue = lead.next_followup && new Date(lead.next_followup) < new Date()
          return (
            <div key={lead.id} className="card group">
              <div className="flex items-start justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-xs rounded-full px-2 py-0.5"
                      style={{ background: `${STAGE_COLOR[stage]}20`, color: STAGE_COLOR[stage] }}>{STAGE_LABEL[stage]}</span>
                    {lead.source && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.source}</span>}
                    {isOverdue && <span className="text-xs text-orange-400">⚠️ Follow-up overdue</span>}
                  </div>
                  <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{lead.name}</p>
                  {lead.company && <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{lead.company}</p>}
                  {lead.service && <p className="mt-0.5 text-xs" style={{ color: 'var(--text-muted)' }}>Service: {lead.service}</p>}
                  {lead.notes && <p className="mt-1 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{lead.notes}</p>}
                  <div className="mt-2 flex items-center gap-4">
                    {lead.email && (
                      <a href={`mailto:${lead.email}`} className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                        <Mail size={11} /> {lead.email}
                      </a>
                    )}
                    {lead.phone && (
                      <a href={`tel:${lead.phone}`} className="flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                        <Phone size={11} /> {lead.phone}
                      </a>
                    )}
                    {lead.next_followup && (
                      <span className="text-xs" style={{ color: isOverdue ? 'var(--warning)' : 'var(--text-muted)' }}>
                        Follow-up: {format(parseISO(lead.next_followup), 'MMM d')}
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {lead.deal_value && (
                    <p className="text-sm font-bold" style={{ color: 'var(--success)' }}>₹{lead.deal_value.toLocaleString('en-IN')}</p>
                  )}
                  <div className="flex items-center gap-1">
                    <select value={stage} onChange={e => updateLead(lead.id, { stage: e.target.value as LeadStage })} className="input text-xs px-2 py-1">
                      {STAGES.map(s => <option key={s} value={s}>{STAGE_LABEL[s]}</option>)}
                    </select>
                    <button onClick={() => { setEditingId(lead.id); setAdding(false) }} className="rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                    <button onClick={() => deleteLead(lead.id)} className="rounded p-1 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {userId && <ColdCallLog userId={userId} leads={leads} />}
    </div>
  )
}
