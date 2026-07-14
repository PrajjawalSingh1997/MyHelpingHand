'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Check, RotateCcw, Pencil, Trash2, Plus, Loader2, History } from 'lucide-react'
import type { TimetablePlan, TimetableBlock } from '@/types/database'

function getTimetableDay(): string {
  const now = new Date()
  if (now.getHours() < 5) {
    const yesterday = new Date(now)
    yesterday.setDate(yesterday.getDate() - 1)
    return yesterday.toISOString().split('T')[0]
  }
  return now.toISOString().split('T')[0]
}

function parseTimeToHours(timeStr: string): number {
  if (!timeStr) return 0
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i)
  if (!match) return 0
  let h = parseInt(match[1])
  const m = parseInt(match[2])
  const p = match[3].toUpperCase()
  if (p === 'PM' && h !== 12) h += 12
  if (p === 'AM' && h === 12) h = 0
  return h + m / 60
}

const WEEKLY_RHYTHM = [
  { day: 'Monday',    focus: 'Techwara + LinkedIn post',     plan: 'A' as const, platform: 'LinkedIn' },
  { day: 'Tuesday',   focus: 'Techwara + GitHub push',       plan: 'A' as const, platform: 'GitHub + Twitter' },
  { day: 'Wednesday', focus: 'Cold calling + content batch', plan: 'C' as const, platform: 'LinkedIn' },
  { day: 'Thursday',  focus: 'Techwara + freelance',         plan: 'B' as const, platform: 'LinkedIn' },
  { day: 'Friday',    focus: 'Freelance delivery + content', plan: 'A' as const, platform: 'LinkedIn + Twitter' },
  { day: 'Saturday',  focus: 'Freelance + CRM + proposals',  plan: 'C' as const, platform: 'Freelance platforms' },
  { day: 'Sunday',    focus: 'Weekly review + planning',     plan: 'C' as const, platform: 'LinkedIn' },
]

function BlockForm({
  initial, onSave, onCancel,
}: {
  initial: Partial<TimetableBlock>
  onSave: (b: TimetableBlock) => void
  onCancel: () => void
}) {
  const [f, setF] = useState<TimetableBlock>({
    id: initial.id ?? crypto.randomUUID(),
    time: initial.time ?? '',
    emoji: initial.emoji ?? '📌',
    name: initial.name ?? '',
    activity: initial.activity ?? '',
    duration: initial.duration ?? '',
    fixed: initial.fixed ?? false,
  })
  return (
    <div className="space-y-3 rounded-lg p-4" style={{ background: 'var(--bg)', border: '1px solid var(--border)' }}>
      <div className="flex gap-2">
        <div className="w-16">
          <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Emoji</label>
          <input value={f.emoji} onChange={e => setF({ ...f, emoji: e.target.value })} className="mt-1 w-full rounded-lg px-2 py-1.5 text-sm text-center outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="flex-1">
          <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Block Name</label>
          <input value={f.name} onChange={e => setF({ ...f, name: e.target.value })} className="mt-1 w-full rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
      </div>
      <div>
        <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Activity</label>
        <input value={f.activity} onChange={e => setF({ ...f, activity: e.target.value })} className="mt-1 w-full rounded-lg px-3 py-1.5 text-xs outline-none"
          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
      </div>
      <div className="flex gap-2">
        <div className="flex-1">
          <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Time</label>
          <input value={f.time} onChange={e => setF({ ...f, time: e.target.value })} placeholder="5:00–9:00 AM"
            className="mt-1 w-full rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
        <div className="w-24">
          <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Duration</label>
          <input value={f.duration} onChange={e => setF({ ...f, duration: e.target.value })}
            className="mt-1 w-full rounded-lg px-3 py-1.5 text-xs outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
        </div>
      </div>
      <div className="flex gap-2 pt-1">
        <button onClick={() => onSave(f)} className="rounded-lg px-4 py-1.5 text-xs font-medium text-white" style={{ background: 'var(--success)' }}>Save</button>
        <button onClick={onCancel} className="rounded-lg px-4 py-1.5 text-xs font-medium" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>Cancel</button>
      </div>
    </div>
  )
}

function TimelineView({ plan, checks, onToggle, onUpdatePlan }: {
  plan: TimetablePlan
  checks: Set<string>
  onToggle: (blockId: string) => void
  onUpdatePlan: (blocks: TimetableBlock[]) => void
}) {
  const blocks: TimetableBlock[] = Array.isArray(plan.blocks) ? plan.blocks : []
  const [editingId, setEditingId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)

  const checkedCount = blocks.filter(b => checks.has(b.id)).length
  const pct = blocks.length > 0 ? Math.round((checkedCount / blocks.length) * 100) : 0

  const saveEdit = (updated: TimetableBlock) => {
    onUpdatePlan(blocks.map(b => b.id === updated.id ? updated : b))
    setEditingId(null)
  }
  const deleteBlock = (id: string) => {
    if (confirm('Delete this block?')) onUpdatePlan(blocks.filter(b => b.id !== id))
  }
  const addBlock = (b: TimetableBlock) => {
    onUpdatePlan([...blocks, b])
    setAdding(false)
  }

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{plan.name}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{checkedCount}/{blocks.length}</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full" style={{ background: 'var(--border)' }}>
            <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, background: 'var(--accent)' }} />
          </div>
        </div>
      </div>

      <div className="space-y-2">
        {blocks.map(block => {
          if (editingId === block.id) {
            return <BlockForm key={block.id} initial={block} onSave={saveEdit} onCancel={() => setEditingId(null)} />
          }
          const isChecked = checks.has(block.id)
          const now = new Date()
          const curH = now.getHours() + now.getMinutes() / 60
          const parts = block.time.split('–')
          const bStart = parseTimeToHours(parts[0]?.trim() ?? '')
          const bEnd   = parseTimeToHours(parts[1]?.trim() ?? '')
          const isNow  = curH >= bStart && curH < bEnd

          return (
            <div key={block.id} className="group flex items-center gap-4 rounded-lg p-3 transition-all"
              style={{ background: isNow ? 'rgba(108,92,231,0.1)' : isChecked ? 'rgba(0,184,148,0.05)' : 'var(--bg)', outline: isNow ? '1px solid var(--accent)' : 'none' }}>
              <button onClick={() => onToggle(block.id)}
                className="flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all"
                style={{ borderColor: isChecked ? 'var(--success)' : 'var(--border)', background: isChecked ? 'var(--success)' : 'transparent', color: '#fff' }}>
                {isChecked && <Check size={14} />}
              </button>
              <span className="text-2xl">{block.emoji}</span>
              <div className="flex-1">
                <p className="text-sm font-medium" style={{ color: isChecked ? 'var(--text-muted)' : 'var(--text)', textDecoration: isChecked ? 'line-through' : 'none' }}>
                  {block.name}
                  {block.fixed && <span className="ml-2 text-[10px]" style={{ color: 'var(--text-muted)' }}>• fixed</span>}
                </p>
                <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{block.activity}</p>
              </div>
              <div className="text-right">
                <p className="text-xs font-medium" style={{ color: 'var(--accent)' }}>{block.time}{isNow && ' ◀ NOW'}</p>
                <p className="text-[10px]" style={{ color: 'var(--text-muted)' }}>{block.duration}</p>
              </div>
              {!block.fixed && (
                <div className="flex flex-col gap-1 opacity-0 transition-opacity group-hover:opacity-100 pl-2 border-l" style={{ borderColor: 'var(--border)' }}>
                  <button onClick={() => setEditingId(block.id)} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                  <button onClick={() => deleteBlock(block.id)} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Trash2 size={13} /></button>
                </div>
              )}
            </div>
          )
        })}

        {adding
          ? <BlockForm initial={{}} onSave={addBlock} onCancel={() => setAdding(false)} />
          : <button onClick={() => setAdding(true)}
              className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg p-3 text-sm transition-all"
              style={{ border: '1px dashed var(--border)', background: 'transparent', color: 'var(--text-muted)' }}>
              <Plus size={16} /> Add Block
            </button>
        }
      </div>
    </div>
  )
}

export default function TimetablePage() {
  const [plans, setPlans]     = useState<TimetablePlan[]>([])
  const [checks, setChecks]   = useState<Set<string>>(new Set())
  const [tab, setTab]         = useState<'A' | 'B' | 'C' | 'weekly'>('A')
  const [loading, setLoading] = useState(true)
  const [userId, setUserId]   = useState<string | null>(null)
  const [checkDate, setCheckDate] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const today = getTimetableDay()
      setCheckDate(today)

      const [pRes, cRes] = await Promise.all([
        supabase.from('timetable_plans').select('*').eq('user_id', user.id)
          .lte('effective_from', today).order('effective_from', { ascending: false }).order('plan_type'),
        supabase.from('timetable_checks').select('block_ids').eq('user_id', user.id).eq('date', today).single(),
      ])
      const allPlans = pRes.data as TimetablePlan[] | null
      const c = cRes.data as { block_ids: string[] } | null

      // Keep only the latest version of each plan type
      const latestMap = new Map<string, TimetablePlan>()
      for (const plan of (allPlans ?? [])) {
        if (!latestMap.has(plan.plan_type)) latestMap.set(plan.plan_type, plan)
      }
      setPlans(Array.from(latestMap.values()).sort((a, b) => a.plan_type.localeCompare(b.plan_type)))
      setChecks(new Set((c?.block_ids as string[]) ?? []))
      setLoading(false)
    }
    load()
  }, [])

  const toggleCheck = useCallback(async (blockId: string) => {
    if (!userId) return
    const supabase = createClient()
    setChecks(prev => {
      const next = new Set(prev)
      if (next.has(blockId)) next.delete(blockId)
      else next.add(blockId)
      const ids = Array.from(next)
      supabase.from('timetable_checks').upsert(
        { user_id: userId, date: checkDate, block_ids: ids },
        { onConflict: 'user_id,date' }
      ).then(() => {})
      return next
    })
  }, [userId, checkDate])

  const resetAll = async () => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('timetable_checks').upsert(
      { user_id: userId, date: checkDate, block_ids: [] },
      { onConflict: 'user_id,date' }
    )
    setChecks(new Set())
  }

  const updatePlan = useCallback(async (planId: string, blocks: TimetableBlock[]) => {
    if (!userId) return
    const supabase = createClient()
    await supabase.from('timetable_plans').update({ blocks: blocks as any }).eq('id', planId)
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, blocks } : p))
  }, [userId])

  const startNewCycle = async () => {
    if (!userId || plans.length === 0) return
    if (!confirm('Archive current plans and start a new cycle with today\'s date?')) return
    const supabase = createClient()
    const today = getTimetableDay()
    const { data } = await supabase.from('timetable_plans')
      .upsert(
        plans.map(p => ({ user_id: userId, plan_type: p.plan_type, name: p.name, blocks: p.blocks, effective_from: today })),
        { onConflict: 'user_id,plan_type,effective_from' }
      ).select()
    if (data) setPlans(data as TimetablePlan[])
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const totalChecked = checks.size
  const activePlan = plans.find(p => p.plan_type === tab)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>⏰ Timetable</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
            Resets at 5:00 AM daily • {totalChecked > 0 ? `${totalChecked} blocks done today` : 'Check off blocks as you complete them'}
          </p>
        </div>
        <div className="flex gap-2">
          <button onClick={startNewCycle} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-all"
            style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--accent)' }}>
            <History size={12} /> New Cycle
          </button>
          <button onClick={resetAll} className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs transition-all"
            style={{ background: 'rgba(255,107,107,0.15)', color: 'var(--danger)' }}>
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)', background: 'var(--surface)' }}>
        {([
          { key: 'A' as const, label: 'Plan A — Standard' },
          { key: 'B' as const, label: 'Plan B — Heavy Work' },
          { key: 'C' as const, label: 'Plan C — Business Dev' },
          { key: 'weekly' as const, label: 'Weekly Rhythm' },
        ]).map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className="flex-1 px-4 py-2 text-sm transition-all"
            style={{ background: tab === t.key ? 'var(--accent)' : 'transparent', color: tab === t.key ? '#fff' : 'var(--text-muted)' }}>
            {t.label}
          </button>
        ))}
      </div>

      {activePlan && tab !== 'weekly' && (
        <TimelineView
          plan={activePlan}
          checks={checks}
          onToggle={toggleCheck}
          onUpdatePlan={blocks => updatePlan(activePlan.id, blocks)}
        />
      )}

      {tab === 'weekly' && (
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold" style={{ color: 'var(--text)' }}>Weekly Rhythm</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left" style={{ borderColor: 'var(--border)', color: 'var(--text-muted)' }}>
                <th className="py-2 font-medium">Day</th>
                <th className="py-2 font-medium">Focus</th>
                <th className="py-2 text-center font-medium">Plan</th>
                <th className="py-2 text-right font-medium">Platform</th>
              </tr>
            </thead>
            <tbody>
              {WEEKLY_RHYTHM.map(row => {
                const today = new Date().toLocaleDateString('en-US', { weekday: 'long' })
                const isToday = row.day === today
                return (
                  <tr key={row.day} className="border-b" style={{ borderColor: 'rgba(45,45,63,0.5)', background: isToday ? 'rgba(108,92,231,0.1)' : 'transparent' }}>
                    <td className="py-3 font-medium" style={{ color: 'var(--text)' }}>
                      {row.day} {isToday && <span className="text-[10px]" style={{ color: 'var(--accent)' }}>◀ TODAY</span>}
                    </td>
                    <td className="py-3" style={{ color: 'var(--text-muted)' }}>{row.focus}</td>
                    <td className="py-3 text-center">
                      <span className={`badge ${row.plan === 'A' ? 'bg-blue-500/15 text-blue-400' : row.plan === 'B' ? 'bg-orange-500/15 text-orange-400' : 'bg-green-500/15 text-green-400'}`}>
                        Plan {row.plan}
                      </span>
                    </td>
                    <td className="py-3 text-right text-sm" style={{ color: 'var(--text-muted)' }}>{row.platform}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
