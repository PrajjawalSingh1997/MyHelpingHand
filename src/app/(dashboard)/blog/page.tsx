'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Plus, Pencil, Trash2, Loader2, ExternalLink } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { ContentPost } from '@/types/database'

const STATUSES = ['idea', 'draft', 'scheduled', 'published'] as const
type PostStatus = typeof STATUSES[number]
const STATUS_COLOR: Record<PostStatus, string> = {
  idea: 'var(--text-muted)',
  draft: 'var(--warning)',
  scheduled: 'var(--accent)',
  published: 'var(--success)',
}

function PostForm({ initial, onSave, onCancel }: {
  initial?: Partial<ContentPost>
  onSave: (p: Partial<ContentPost>) => Promise<void>
  onCancel: () => void
}) {
  const [f, setF] = useState({
    title: initial?.title ?? '',
    platform: initial?.platform ?? 'blog',
    status: (initial?.status ?? 'idea') as PostStatus,
    content: initial?.content ?? '',
    url: initial?.url ?? '',
    scheduled_date: initial?.scheduled_date ?? '',
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
          <label className="label">Title / Topic</label>
          <input value={f.title} onChange={e => setF({ ...f, title: e.target.value })} className="input mt-1 w-full" placeholder="Blog post title..." />
        </div>
        <div className="w-32">
          <label className="label">Platform</label>
          <select value={f.platform ?? ''} onChange={e => setF({ ...f, platform: e.target.value })} className="input mt-1 w-full">
            {['blog', 'hashnode', 'dev.to', 'medium', 'personal'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
          </select>
        </div>
        <div className="w-32">
          <label className="label">Status</label>
          <select value={f.status} onChange={e => setF({ ...f, status: e.target.value as PostStatus })} className="input mt-1 w-full">
            {STATUSES.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
          </select>
        </div>
        <div className="w-36">
          <label className="label">Schedule</label>
          <input type="date" value={f.scheduled_date ?? ''} onChange={e => setF({ ...f, scheduled_date: e.target.value })} className="input mt-1 w-full" />
        </div>
      </div>
      <div>
        <label className="label">Notes / Outline</label>
        <textarea value={f.content ?? ''} onChange={e => setF({ ...f, content: e.target.value })} rows={3} className="input mt-1 w-full resize-none" />
      </div>
      <div>
        <label className="label">URL (once published)</label>
        <input value={f.url ?? ''} onChange={e => setF({ ...f, url: e.target.value })} className="input mt-1 w-full" placeholder="https://..." />
      </div>
      {error && <p className="text-xs" style={{ color: 'var(--danger)' }}>{error}</p>}
      <div className="flex gap-2">
        <button onClick={handleSave} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          {saving && <Loader2 size={14} className="animate-spin" />}
          {saving ? 'Saving…' : 'Save Post'}
        </button>
        <button onClick={onCancel} className="btn-ghost text-sm">Cancel</button>
      </div>
    </div>
  )
}

export default function BlogPage() {
  const { show } = useToast()
  const [posts, setPosts]   = useState<ContentPost[]>([])
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [adding, setAdding] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [filter, setFilter] = useState<PostStatus | 'all'>('all')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      const { data } = await supabase
        .from('content_posts').select('*')
        .eq('user_id', user.id)
        .in('platform', ['blog', 'hashnode', 'dev.to', 'medium', 'personal'])
        .order('created_at', { ascending: false }) as { data: ContentPost[] | null }
      setPosts(data ?? [])
      setLoading(false)
    }
    load()
  }, [])

  const addPost = async (partial: Partial<ContentPost>) => {
    if (!userId) return
    const supabase = createClient()
    const { data, error } = await supabase.from('content_posts').insert({ ...partial, user_id: userId }).select().single() as { data: ContentPost | null; error: any }
    if (data && !error) { setPosts(prev => [data, ...prev]); show('Post created!', 'success') }
    else show('Failed to create post.', 'error')
    setAdding(false)
  }

  const updatePost = async (id: string, partial: Partial<ContentPost>) => {
    const supabase = createClient()
    const { error } = await supabase.from('content_posts').update(partial).eq('id', id)
    if (!error) { setPosts(prev => prev.map(p => p.id === id ? { ...p, ...partial } : p)); show('Post updated!', 'success') }
    else show('Failed to update post.', 'error')
    setEditingId(null)
  }

  const deletePost = async (id: string) => {
    if (!confirm('Delete this post?')) return
    const supabase = createClient()
    const { error } = await supabase.from('content_posts').delete().eq('id', id)
    if (!error) { setPosts(prev => prev.filter(p => p.id !== id)); show('Post deleted.', 'success') }
    else show('Failed to delete post.', 'error')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const filtered = filter === 'all' ? posts : posts.filter(p => p.status === filter)
  const counts = Object.fromEntries(STATUSES.map(s => [s, posts.filter(p => p.status === s).length]))

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>✍️ Blog & Content</h1>
          <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{posts.filter(p => p.status === 'published').length} published · {posts.length} total</p>
        </div>
        <button onClick={() => { setAdding(true); setEditingId(null) }} className="btn-primary flex items-center gap-2 text-sm">
          <Plus size={16} /> New Post
        </button>
      </div>

      {/* Filter tabs */}
      <div className="flex gap-2 flex-wrap">
        {(['all', ...STATUSES] as const).map(s => (
          <button key={s} onClick={() => setFilter(s)}
            className="rounded-full px-3 py-1 text-xs font-medium transition-all"
            style={{
              background: filter === s ? 'var(--accent)' : 'var(--surface)',
              color: filter === s ? '#fff' : 'var(--text-muted)',
            }}>
            {s === 'all' ? `All (${posts.length})` : `${s.charAt(0).toUpperCase() + s.slice(1)} (${counts[s] ?? 0})`}
          </button>
        ))}
      </div>

      {adding && <PostForm onSave={addPost} onCancel={() => setAdding(false)} />}

      {filtered.length === 0 && !adding && (
        <div className="card text-center py-12">
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>No posts here yet.</p>
        </div>
      )}

      <div className="space-y-3">
        {filtered.map(post => {
          if (editingId === post.id) {
            return (
              <PostForm key={post.id} initial={post}
                onSave={p => updatePost(post.id, p)}
                onCancel={() => setEditingId(null)} />
            )
          }
          const status = (post.status ?? 'idea') as PostStatus
          return (
            <div key={post.id} className="card group flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="text-xs rounded-full px-2 py-0.5 capitalize"
                    style={{ background: `${STATUS_COLOR[status]}20`, color: STATUS_COLOR[status] }}>
                    {status}
                  </span>
                  <span className="text-xs capitalize" style={{ color: 'var(--text-muted)' }}>{post.platform}</span>
                  {post.scheduled_date && (
                    <span className="text-xs" style={{ color: 'var(--text-muted)' }}>
                      · {new Date(post.scheduled_date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                    </span>
                  )}
                </div>
                <p className="text-sm font-semibold" style={{ color: 'var(--text)' }}>{post.title}</p>
                {post.content && <p className="mt-1 text-xs line-clamp-2" style={{ color: 'var(--text-muted)' }}>{post.content}</p>}
                {post.url && (
                  <a href={post.url} target="_blank" rel="noopener noreferrer" className="mt-1 flex items-center gap-1 text-xs" style={{ color: 'var(--accent)' }}>
                    <ExternalLink size={11} /> View post
                  </a>
                )}
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => { setEditingId(post.id); setAdding(false) }} className="rounded p-1" style={{ color: 'var(--text-muted)' }}><Pencil size={14} /></button>
                <button onClick={() => deletePost(post.id)} className="rounded p-1" style={{ color: 'var(--danger)' }}><Trash2 size={14} /></button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
