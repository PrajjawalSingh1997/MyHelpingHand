'use client'
import { useState } from 'react'
import Link from 'next/link'
import { format, parseISO } from 'date-fns'
import {
  ChevronLeft, ChevronRight, Copy, Check, SkipForward,
  Pencil, ArrowRight, X, Trash2, Loader2,
} from 'lucide-react'
import { useActiveCycle } from '@/hooks/use-cycle'
import { useDay } from '@/hooks/use-day'
import { EmptyCycle } from '@/components/ui/empty-cycle'

const categoryMeta: Record<string, { label: string; emoji: string; color: string }> = {
  linkedin:   { label: 'LinkedIn',    emoji: '📝', color: 'bg-blue-500/15 text-blue-400' },
  github:     { label: 'GitHub',      emoji: '🐙', color: 'bg-gray-500/15 text-gray-300' },
  twitter:    { label: 'Twitter',     emoji: '🐦', color: 'bg-cyan-500/15 text-cyan-400' },
  freelance:  { label: 'Freelancing', emoji: '💼', color: 'bg-amber-500/15 text-amber-400' },
  portfolio:  { label: 'Portfolio',   emoji: '🎨', color: 'bg-pink-500/15 text-pink-400' },
  blog:       { label: 'Blog',        emoji: '✍️', color: 'bg-purple-500/15 text-purple-400' },
  rentlyf:    { label: 'Rentlyf',     emoji: '🏠', color: 'bg-green-500/15 text-green-400' },
  learning:   { label: 'Learning',    emoji: '📚', color: 'bg-indigo-500/15 text-indigo-400' },
  networking: { label: 'Networking',  emoji: '📱', color: 'bg-teal-500/15 text-teal-400' },
  health:     { label: 'Health',      emoji: '💪', color: 'bg-rose-500/15 text-rose-400' },
  personal:   { label: 'Personal',    emoji: '🌱', color: 'bg-lime-500/15 text-lime-400' },
}

export function TodayContent({ dayNumber }: { dayNumber: number }) {
  const { day, loading, toggleTask, skipTask, editTask, deleteTask,
          updateNotes, updateRentlyfHours, postponeTask, resolvedCycleId } = useDay(dayNumber)

  const [copiedId,    setCopiedId]    = useState<string | null>(null)
  const [editingId,   setEditingId]   = useState<string | null>(null)
  const [editTitle,   setEditTitle]   = useState('')
  const [editContent, setEditContent] = useState('')
  const [postponeId,  setPostponeId]  = useState<string | null>(null)
  const [postponeDay, setPostponeDay] = useState('')

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  if (!day) return (
    <div className="space-y-4">
      <EmptyCycle />
      <div className="text-center">
        <p className="text-sm" style={{ color: 'var(--text-muted)' }}>
          Or this day doesn&apos;t exist in your cycle yet.
        </p>
      </div>
    </div>
  )

  const done  = day.tasks.filter(t => t.status === 'completed').length
  const total = day.tasks.length
  const pct   = total > 0 ? Math.round((done / total) * 100) : 0

  const grouped: Record<string, typeof day.tasks> = {}
  day.tasks.forEach(t => {
    if (!grouped[t.category]) grouped[t.category] = []
    grouped[t.category].push(t)
  })

  const copyContent = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text)
    setCopiedId(id)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const startEdit = (taskId: string) => {
    const task = day.tasks.find(t => t.id === taskId)
    if (!task) return
    setEditingId(taskId)
    setEditTitle(task.title)
    setEditContent(task.content ?? '')
  }

  const saveEdit = async () => {
    if (!editingId) return
    await editTask(editingId, { title: editTitle, content: editContent || undefined })
    setEditingId(null)
  }

  const handlePostpone = async () => {
    if (!postponeId || !postponeDay) return
    const target = parseInt(postponeDay)
    if (target >= 1 && target <= 90 && target !== dayNumber) {
      await postponeTask(postponeId, target)
      setPostponeId(null)
      setPostponeDay('')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs" style={{ color: 'var(--text-muted)' }}>
              Plan {day.plan_type}
            </p>
            <h1 className="mt-1 text-3xl font-bold" style={{ color: 'var(--text)' }}>
              DAY {day.day_number}
            </h1>
            <p className="mt-1 text-sm" style={{ color: 'var(--text-muted)' }}>
              {format(parseISO(day.date), 'EEEE, MMMM d, yyyy')}
            </p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`badge ${day.plan_type === 'A' ? 'bg-blue-500/15 text-blue-400' : day.plan_type === 'B' ? 'bg-orange-500/15 text-orange-400' : 'bg-green-500/15 text-green-400'}`}>
                Plan {day.plan_type}
              </span>
              <span className="text-sm" style={{ color: 'var(--text-muted)' }}>{done}/{total} completed</span>
            </div>
          </div>
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2D2D3F" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6C5CE7" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold" style={{ color: 'var(--text)' }}>{pct}%</span>
          </div>
        </div>
      </div>

      {/* Postpone modal */}
      {postponeId && (
        <div className="card" style={{ borderColor: 'rgba(253,203,110,0.3)', background: 'rgba(253,203,110,0.05)' }}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowRight size={18} style={{ color: 'var(--warning)' }} />
              <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>Postpone to day:</span>
              <input
                type="number" min={1} max={90} value={postponeDay}
                onChange={e => setPostponeDay(e.target.value)}
                placeholder="Day #"
                className="w-20 rounded-lg px-3 py-1.5 text-sm outline-none"
                style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handlePostpone} className="rounded-lg px-3 py-1.5 text-xs font-medium" style={{ background: 'var(--warning)', color: '#000' }}>Move</button>
              <button onClick={() => { setPostponeId(null); setPostponeDay('') }} style={{ color: 'var(--text-muted)' }}>
                <X size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Task groups */}
      {Object.entries(grouped).map(([cat, tasks]) => {
        const meta = categoryMeta[cat] ?? { label: cat, emoji: '📌', color: 'bg-gray-500/15 text-gray-300' }
        return (
          <div key={cat} className="card">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">{meta.emoji}</span>
              <h3 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{meta.label}</h3>
              <span className={`badge text-[10px] ${meta.color}`}>
                {tasks.filter(t => t.status === 'completed').length}/{tasks.length}
              </span>
            </div>
            <ul className="space-y-2">
              {tasks.map(task => (
                <li key={task.id} className="group">
                  {editingId === task.id ? (
                    <div className="space-y-3 rounded-lg p-4" style={{ background: 'var(--bg)' }}>
                      <div>
                        <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Task Title</label>
                        <input value={editTitle} onChange={e => setEditTitle(e.target.value)}
                          className="mt-1 w-full rounded-lg px-3 py-2 text-sm outline-none"
                          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
                      </div>
                      <div>
                        <label className="text-[10px]" style={{ color: 'var(--text-muted)' }}>Content / Notes</label>
                        <textarea value={editContent} onChange={e => setEditContent(e.target.value)} rows={6}
                          className="mt-1 w-full rounded-lg p-3 text-sm outline-none"
                          style={{ border: '1px solid var(--border)', background: 'var(--surface)', color: 'var(--text)' }} />
                        <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>{editContent.length} chars</p>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="rounded-lg px-4 py-2 text-xs text-white" style={{ background: 'var(--success)' }}>Save</button>
                        <button onClick={() => setEditingId(null)} className="rounded-lg px-4 py-2 text-xs" style={{ background: 'var(--surface-hover)', color: 'var(--text-muted)' }}>Cancel</button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-start gap-3 rounded-lg p-2 transition-all"
                         onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-hover)')}
                         onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}>
                      <button onClick={() => toggleTask(task.id)}
                        className="mt-0.5 flex-shrink-0 transition-all"
                        style={{ color: task.status === 'completed' ? 'var(--success)' : task.status === 'skipped' ? 'var(--warning)' : 'var(--text-muted)' }}>
                        {task.status === 'completed'
                          ? <Check size={20} />
                          : <div className="h-5 w-5 rounded border-2 border-current" />}
                      </button>
                      <div className="flex-1">
                        <p className="text-sm" style={{
                          color: task.status === 'completed' ? 'var(--text-muted)' : 'var(--text)',
                          textDecoration: task.status === 'completed' ? 'line-through' : 'none',
                        }}>
                          {task.status === 'skipped' && <span className="mr-1 text-[10px]" style={{ color: 'var(--warning)' }}>[Skipped]</span>}
                          {task.title}
                        </p>
                        {task.notes && <p className="mt-0.5 text-[10px]" style={{ color: 'var(--warning)' }}>{task.notes}</p>}
                        {task.content && (
                          <div className="mt-2 rounded-lg p-3" style={{ background: 'var(--bg)' }}>
                            <pre className="max-h-24 overflow-hidden whitespace-pre-wrap text-xs" style={{ color: 'var(--text-muted)' }}>
                              {task.content.slice(0, 200)}{task.content.length > 200 ? '…' : ''}
                            </pre>
                            <button onClick={() => copyContent(task.id, task.content!)}
                              className="mt-2 flex items-center gap-1 rounded-md px-2 py-1 text-[10px] font-medium"
                              style={{ background: 'rgba(108,92,231,0.15)', color: 'var(--accent)' }}>
                              {copiedId === task.id
                                ? <><Check size={10} /> Copied!</>
                                : <><Copy size={10} /> Copy {['linkedin', 'twitter'].includes(task.category) ? 'Post' : 'Content'}</>}
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                        <button onClick={() => startEdit(task.id)} title="Edit" className="rounded p-1" style={{ color: 'var(--text-muted)' }}>
                          <Pencil size={13} />
                        </button>
                        <button onClick={() => { if (confirm('Delete this task?')) deleteTask(task.id) }} title="Delete" className="rounded p-1" style={{ color: 'var(--text-muted)' }}>
                          <Trash2 size={13} />
                        </button>
                        <button onClick={() => { setPostponeId(task.id); setPostponeDay('') }} title="Postpone" className="rounded p-1" style={{ color: 'var(--text-muted)' }}>
                          <ArrowRight size={13} />
                        </button>
                        <button onClick={() => skipTask(task.id)} title="Skip" className="rounded p-1" style={{ color: 'var(--text-muted)' }}>
                          <SkipForward size={13} />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        )
      })}

      {/* Rentlyf hours */}
      <div className="card">
        <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>🏠 Rentlyf Hours Today</h3>
        <div className="flex items-center gap-2">
          <input type="number" min={0} max={12} step={0.5}
            value={day.rentlyf_hours ?? 0}
            onChange={e => updateRentlyfHours(Number(e.target.value))}
            className="w-20 rounded-lg px-3 py-1.5 text-sm outline-none"
            style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }} />
          <span className="text-xs" style={{ color: 'var(--text-muted)' }}>hours logged</span>
        </div>
      </div>

      {/* Notes */}
      <div className="card">
        <h3 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>📝 Daily Notes</h3>
        <textarea value={day.notes ?? ''} onChange={e => updateNotes(e.target.value)}
          placeholder="Jot down anything for today…"
          className="w-full rounded-lg p-3 text-sm outline-none"
          style={{ border: '1px solid var(--border)', background: 'var(--bg)', color: 'var(--text)' }}
          rows={3} />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {dayNumber > 1
          ? <Link href={`/day/${dayNumber - 1}`} className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
              <ChevronLeft size={16} /> Day {dayNumber - 1}
            </Link>
          : <div />}
        {dayNumber < 90
          ? <Link href={`/day/${dayNumber + 1}`} className="flex items-center gap-1 text-sm" style={{ color: 'var(--accent)' }}>
              Day {dayNumber + 1} <ChevronRight size={16} />
            </Link>
          : <div />}
      </div>
    </div>
  )
}

export default function TodayPage() {
  const { currentDay, cycle, loading } = useActiveCycle()

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )
  if (!cycle) return <EmptyCycle />
  return <TodayContent dayNumber={currentDay} />
}
