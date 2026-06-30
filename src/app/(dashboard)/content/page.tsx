'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, addDays, startOfWeek, parseISO } from 'date-fns'
import { Plus, Pencil, Trash2, Loader2, ChevronLeft, ChevronRight, Copy, Check } from 'lucide-react'
import type { ContentPost } from '@/types/database'

const PLATFORMS = ['linkedin', 'twitter', 'instagram', 'youtube', 'newsletter'] as const
type Platform = typeof PLATFORMS[number]
const PLATFORM_EMOJI: Record<Platform, string> = {
  linkedin: '💼', twitter: '𝕏', instagram: '📸', youtube: '▶️', newsletter: '📧'
}
const STATUSES = ['idea', 'draft', 'scheduled', 'published'] as const
type ContentStatus = typeof STATUSES[number]
const STATUS_COLOR: Record<ContentStatus, string> = {
  idea: 'var(--text-muted)',
  draft: 'var(--warning)',
  scheduled: 'var(--accent)',
  published: 'var(--success)',
}

function PostModal({ initial, onSave, onClose }: {
  initial?: Partial<ContentPost>
  onSave: (p: Partial<ContentPost>) => void
  onClose: () => void
}) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    platform: initial?.platform ?? 'linkedin',
    status: (initial?.status ?? 'idea') as ContentStatus,
    content: initial?.content ?? '',
    scheduled_date: initial?.scheduled_date ?? format(new Date(), 'yyyy-MM-dd'),
    url: initial?.url ?? '',
    hook: initial?.hook ?? '',
    tags: initial?.tags ?? '',
  })
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center" style={{ background: 'rgba(0,0,0,0.6)' }}>
      <div className="w-full max-w-xl rounded-2xl p-6 space-y-4" style={{ background: 'var(--surface)', border: '1px solid var(--border)' }}>
        <h3 className="text-base font-semibold" style={{ color: 'var(--text)' }}>{initial?.id ? 'Edit Post' : 'New Content'}</h3>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Title / Idea</label>
            <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="input mt-1 w-full" />
          </div>
          <div className="w-36">
            <label className="label">Platform</label>
            <select value={f.platform ?? ''} onChange={e => setF({ ...f, platform: e.target.value })} className="input mt-1 w-full">
              {PLATFORMS.map(p => <option key={p} value={p}>{PLATFORM_EMOJI[p]} {p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
            </select>
          </div>
          <div className="w-32">
            <label className="label">Status</label>
            <select value={f.status} onChange={e => setF({ ...f, status: e.target.value as ContentStatus })} className="input mt-1 w-full">
              {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="label">Hook / Opening Line</label>
          <input value={f.hook ?? ''} onChange={e => setF({ ...f, hook: e.target.value })} className="input mt-1 w-full" placeholder="Attention-grabbing first line..." />
        </div>
        <div>
          <label className="label">Content / Body</label>
          <textarea value={f.content ?? ''} onChange={e => setF({ ...f, content: e.target.value })} rows={5} className="input mt-1 w-full resize-none text-xs" placeholder="Write your post here..." />
        </div>
        <div className="flex gap-3">
          <div className="flex-1">
            <label className="label">Tags</label>
            <input value={f.tags ?? ''} onChange={e => setF({ ...f, tags: e.target.value })} className="input mt-1 w-full" placeholder="#tech #webdev" />
          </div>
          <div>
            <label className="label">Scheduled Date</label>
            <input type="date" value={f.scheduled_date ?? ''} onChange={e => setF({ ...f, scheduled_date: e.target.value })} className="input mt-1" />
          </div>
          <div className="flex-1">
            <label className="label">URL (once live)</label>
            <input value={f.url ?? ''} onChange={e => setF({ ...f, url: e.target.value })} className="input mt-1 w-full" />
          </div>
        </div>
        <div className="flex gap-2 pt-2">
          <button onClick={() => onSave(f)} className="btn-primary text-sm">Save</button>
          <button onClick={onClose} className="btn-ghost text-sm">Cancel</button>
        </div>
      </div>
    </div>
  )
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button onClick={async () => {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    }} className="rounded p-1 transition-colors" style={{ color: copied ? 'var(--success)' : 'var(--text-muted)' }}>
      {copied ? <Check size={13} /> : <Copy size={13} />}
    </button>
  )
}

export default function ContentPage() {
  const [posts, setPosts]   = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [modal, setModal]   = useState<{ open: boolean; initial?: Partial<ContentPost> }>({ open: false })
  const [weekOffset, setWeekOffset] = useState(0)
  const [view, setView]     = useState<'week' | 'list'>('week')
  const [filterPlatform, setFilterPlatform] = useState<Platform | 'all'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('content_posts').select('*')
        .eq('user_id', user.id)
        .not('platform', 'eq', 'blog')
        .order('scheduled_date', { ascending: false }) as { data: ContentPost[] | null }
      setPosts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const savePost = async (partial: Partial<ContentPost>) => {
    if (!userId) return
    const supabase = createClient()
    if (modal.initial?.id) {
      await supabase.from('content_posts').update(partial).eq('id', modal.initial.id)
      setPosts(prev => prev.map(p => p.id === modal.initial!.id ? { ...p, ...partial } : p))
    } else {
      const { data } = await supabase.from('content_posts').insert({ ...partial, user_id: userId }).select().single() as { data: ContentPost | null }
      if (data) setPosts(prev => [data, ...prev])
    }
    setModal({ open: false })
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete?')) return
    const supabase = createClient()
    await supabase.from('content_posts').delete().eq('id', id)
    setPosts(prev => prev.filter(p => p.id !== id))
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  // Week view
  const weekStart = addDays(startOfWeek(new Date()), weekOffset * 7)
  const weekDays  = Array.from({ length: 7 }, (_, i) => addDays(weekStart, i))
  const byDate    = new Map<string, ContentPost[]>()
  posts.forEach(p => {
    if (!p.scheduled_date) return
    const d = p.scheduled_date
    if (!byDate.has(d)) byDate.set(d, [])
    byDate.get(d)!.push(p)
  })

  const filtered = filterPlatform === 'all' ? posts : posts.filter(p => p.platform === filterPlatform)

  return (
    <div className="space-y-6">
      {modal.open && <PostModal initial={modal.initial} onSave={savePost} onClose={() => setModal({ open: false })} />}

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>📣 Content Calendar</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{posts.filter(p => p.status === 'published').length} published · {posts.length} total</p>
        </div>
        <div className="flex gap-2">
          <div className="flex rounded-lg overflow-hidden" style={{ border: '1px solid var(--border)' }}>
            {(['week', 'list'] as const).map(v => (
              <button key={v} onClick={() => setView(v)} className="px-3 py-1.5 text-xs transition-all"
                style={{ background: view === v ? 'var(--accent)' : 'transparent', color: view === v ? '#fff' : 'var(--text-muted)' }}>
                {v.charAt(0).toUpperCase() + v.slice(1)}
              </button>
            ))}
          </div>
          <button onClick={() => setModal({ open: true })} className="btn-primary flex items-center gap-2 text-sm">
            <Plus size={16} /> New Post
          </button>
        </div>
      </div>

      {view === 'week' && (
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setWeekOffset(o => o - 1)} className="btn-ghost p-2"><ChevronLeft size={16} /></button>
            <span className="text-sm font-medium" style={{ color: 'var(--text)' }}>
              {format(weekStart, 'MMM d')} – {format(addDays(weekStart, 6), 'MMM d, yyyy')}
            </span>
            <button onClick={() => setWeekOffset(o => o + 1)} className="btn-ghost p-2"><ChevronRight size={16} /></button>
          </div>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map(day => {
              const dateStr = format(day, 'yyyy-MM-dd')
              const dayPosts = byDate.get(dateStr) ?? []
              const isToday  = dateStr === format(new Date(), 'yyyy-MM-dd')
              return (
                <div key={dateStr} className="min-h-[140px] rounded-lg p-2" style={{ background: isToday ? 'rgba(108,92,231,0.1)' : 'var(--bg)', outline: isToday ? '1px solid var(--accent)' : 'none' }}>
                  <p className="text-xs font-medium mb-2" style={{ color: isToday ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {format(day, 'EEE')}<br />{format(day, 'd')}
                  </p>
                  <div className="space-y-1">
                    {dayPosts.map(p => (
                      <div key={p.id} className="rounded p-1 cursor-pointer text-[10px] leading-tight"
                        style={{ background: `${STATUS_COLOR[(p.status ?? 'idea') as ContentStatus]}20`, color: STATUS_COLOR[(p.status ?? 'idea') as ContentStatus] }}
                        onClick={() => setModal({ open: true, initial: p })}>
                        {PLATFORM_EMOJI[(p.platform ?? 'linkedin') as Platform]} {p.title}
                      </div>
                    ))}
                    <button onClick={() => setModal({ open: true, initial: { scheduled_date: dateStr } })}
                      className="mt-1 w-full text-center text-[10px] rounded p-0.5 opacity-30 hover:opacity-70 transition-opacity"
                      style={{ border: '1px dashed var(--border)', color: 'var(--text-muted)' }}>+</button>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {view === 'list' && (
        <>
          <div className="flex gap-2 flex-wrap">
            {(['all', ...PLATFORMS] as const).map(p => (
              <button key={p} onClick={() => setFilterPlatform(p as any)}
                className="rounded-full px-3 py-1 text-xs font-medium transition-all"
                style={{ background: filterPlatform === p ? 'var(--accent)' : 'var(--surface)', color: filterPlatform === p ? '#fff' : 'var(--text-muted)' }}>
                {p === 'all' ? 'All' : `${PLATFORM_EMOJI[p as Platform]} ${p}`}
              </button>
            ))}
          </div>
          <div className="space-y-3">
            {filtered.map(post => {
              const status = (post.status ?? 'idea') as ContentStatus
              return (
                <div key={post.id} className="card group flex items-start justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-xs">{PLATFORM_EMOJI[(post.platform ?? 'linkedin') as Platform]}</span>
                      <span className="text-xs rounded-full px-2 py-0.5" style={{ background: `${STATUS_COLOR[status]}20`, color: STATUS_COLOR[status] }}>{status}</span>
                      {post.scheduled_date && <span className="text-xs" style={{ color: 'var(--text-muted)' }}>{format(parseISO(post.scheduled_date), 'MMM d')}</span>}
                    </div>
                    <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{post.title}</p>
                    {post.hook && <p className="mt-0.5 text-xs italic" style={{ color: 'var(--text-muted)' }}>"{post.hook}"</p>}
                    {post.content && <p className="mt-1 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.content}</p>}
                  </div>
                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                    {post.content && <CopyButton text={post.content} />}
                    <button onClick={() => setModal({ open: true, initial: post })} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={13} /></button>
                    <button onClick={() => deletePost(post.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={13} /></button>
                  </div>
                </div>
              )
            })}
            {filtered.length === 0 && (
              <div className="card text-center py-12">
                <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No content yet. Create your first post above.</p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  )
}
