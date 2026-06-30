'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'
import { Loader2, Users, Shield, Check, X } from 'lucide-react'

interface UserRow {
  id: string
  email: string
  display_name: string | null
  role: string
  created_at: string
}
interface Module {
  id: string
  name: string
  slug: string
  is_default: boolean
}
interface UserModuleSetting {
  user_id: string
  module_id: string
  is_enabled: boolean
}

export default function AdminPage() {
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [users, setUsers]       = useState<UserRow[]>([])
  const [modules, setModules]   = useState<Module[]>([])
  const [settings, setSettings] = useState<UserModuleSetting[]>([])
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [saving, setSaving]     = useState<string | null>(null)
  const [bulkMod, setBulkMod]   = useState<string>('')
  const [isAdmin, setIsAdmin]   = useState(false)
  const [search, setSearch]     = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { router.push('/login'); return }

      const { data: profile } = await supabase
        .from('user_profiles').select('role').eq('id', user.id).single() as { data: { role: string } | null }
      if (profile?.role !== 'super_admin') { router.push('/'); return }
      setIsAdmin(true)

      const [uRes, mRes, sRes] = await Promise.all([
        supabase.from('user_profiles').select('id, display_name, role, created_at').order('created_at'),
        supabase.from('modules').select('id, name, slug, is_default').order('sort_order'),
        supabase.from('user_module_settings').select('user_id, module_id, is_enabled'),
      ])
      const u = uRes.data as any[] | null
      const m = mRes.data as Module[] | null
      const s = sRes.data as UserModuleSetting[] | null

      // Get emails from auth (admin only)
      const { data: authUsers } = await supabase.auth.admin.listUsers() as { data: { users: { id: string; email: string }[] } | null }
      const emailMap = new Map((authUsers?.users ?? []).map(u => [u.id, u.email]))

      setUsers((u ?? []).map(row => ({ ...row, email: emailMap.get(row.id) ?? 'unknown@email.com' })))
      setModules(m ?? [])
      setSettings(s ?? [])
      setLoading(false)
    }
    load()
  }, [router])

  const isEnabled = (userId: string, moduleId: string) => {
    const s = settings.find(s => s.user_id === userId && s.module_id === moduleId)
    const mod = modules.find(m => m.id === moduleId)
    return s ? s.is_enabled : (mod?.is_default ?? false)
  }

  const toggleModule = async (userId: string, moduleId: string) => {
    const key = `${userId}-${moduleId}`
    setSaving(key)
    const supabase = createClient()
    const current = isEnabled(userId, moduleId)
    const { data } = await supabase
      .from('user_module_settings')
      .upsert({ user_id: userId, module_id: moduleId, is_enabled: !current }, { onConflict: 'user_id,module_id' })
      .select().single() as { data: UserModuleSetting | null }
    if (data) {
      setSettings(prev => {
        const without = prev.filter(s => !(s.user_id === userId && s.module_id === moduleId))
        return [...without, data]
      })
    }
    setSaving(null)
  }

  const enableAllForUser = async (userId: string) => {
    const supabase = createClient()
    await supabase.from('user_module_settings').upsert(
      modules.map(m => ({ user_id: userId, module_id: m.id, is_enabled: true })),
      { onConflict: 'user_id,module_id' }
    )
    setSettings(prev => {
      const without = prev.filter(s => s.user_id !== userId)
      return [...without, ...modules.map(m => ({ user_id: userId, module_id: m.id, is_enabled: true }))]
    })
  }

  const bulkEnable = async () => {
    if (!bulkMod || selected.size === 0) return
    setSaving('bulk')
    const supabase = createClient()
    const rows = Array.from(selected).map(uid => ({ user_id: uid, module_id: bulkMod, is_enabled: true }))
    await supabase.from('user_module_settings').upsert(rows, { onConflict: 'user_id,module_id' })
    setSettings(prev => {
      const without = prev.filter(s => !selected.has(s.user_id) || s.module_id !== bulkMod)
      return [...without, ...rows]
    })
    setSaving(null)
    setSelected(new Set())
  }

  const bulkDisable = async () => {
    if (!bulkMod || selected.size === 0) return
    setSaving('bulk')
    const supabase = createClient()
    const rows = Array.from(selected).map(uid => ({ user_id: uid, module_id: bulkMod, is_enabled: false }))
    await supabase.from('user_module_settings').upsert(rows, { onConflict: 'user_id,module_id' })
    setSettings(prev => {
      const without = prev.filter(s => !selected.has(s.user_id) || s.module_id !== bulkMod)
      return [...without, ...rows]
    })
    setSaving(null)
    setSelected(new Set())
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )
  if (!isAdmin) return null

  const filteredUsers = search ? users.filter(u => u.email.includes(search) || (u.display_name ?? '').toLowerCase().includes(search.toLowerCase())) : users

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
          <Shield size={24} style={{ color: 'var(--accent)' }} /> Admin Panel
        </h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{users.length} users · {modules.length} modules</p>
      </div>

      {/* Bulk actions */}
      {selected.size > 0 && (
        <div className="rounded-xl p-4 flex items-center gap-4" style={{ background: 'rgba(108,92,231,0.15)', border: '1px solid var(--accent)' }}>
          <span className="text-sm font-medium" style={{ color: 'var(--accent)' }}>{selected.size} users selected</span>
          <select value={bulkMod} onChange={e => setBulkMod(e.target.value)} className="input text-sm">
            <option value="">Select module...</option>
            {modules.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
          </select>
          <button onClick={bulkEnable} disabled={!bulkMod || saving === 'bulk'} className="btn-primary text-sm flex items-center gap-1">
            <Check size={14} /> Enable for all
          </button>
          <button onClick={bulkDisable} disabled={!bulkMod || saving === 'bulk'} className="btn-ghost text-sm flex items-center gap-1"
            style={{ color: 'var(--danger)' }}>
            <X size={14} /> Disable for all
          </button>
          <button onClick={() => setSelected(new Set())} className="ml-auto btn-ghost text-xs" style={{ color: 'var(--text-muted)' }}>Clear selection</button>
        </div>
      )}

      {/* Search */}
      <div className="flex gap-3">
        <input value={search} onChange={e => setSearch(e.target.value)} className="input flex-1" placeholder="Search users by email or name..." />
        <button onClick={() => {
          if (selected.size === filteredUsers.length) setSelected(new Set())
          else setSelected(new Set(filteredUsers.map(u => u.id)))
        }} className="btn-ghost text-sm flex items-center gap-2">
          <Users size={14} /> {selected.size === filteredUsers.length ? 'Deselect All' : 'Select All'}
        </button>
      </div>

      {/* Users table */}
      <div className="card overflow-x-auto">
        <table className="w-full text-sm min-w-[800px]">
          <thead>
            <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
              <th className="py-3 pr-4 text-left w-8">
                <input type="checkbox"
                  checked={selected.size === filteredUsers.length && filteredUsers.length > 0}
                  onChange={e => setSelected(e.target.checked ? new Set(filteredUsers.map(u => u.id)) : new Set())}
                  className="rounded" />
              </th>
              <th className="py-3 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>User</th>
              <th className="py-3 pr-4 text-left font-medium" style={{ color: 'var(--text-muted)' }}>Role</th>
              {modules.map(m => (
                <th key={m.id} className="py-3 px-2 text-center font-medium text-[10px]" style={{ color: 'var(--text-muted)' }}>
                  {m.slug.charAt(0).toUpperCase() + m.slug.slice(1)}
                </th>
              ))}
              <th className="py-3 pl-4 text-right font-medium" style={{ color: 'var(--text-muted)' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredUsers.map(user => (
              <tr key={user.id} className="border-b transition-colors" style={{ borderColor: 'rgba(45,45,63,0.5)', background: selected.has(user.id) ? 'rgba(108,92,231,0.05)' : 'transparent' }}>
                <td className="py-3 pr-4">
                  <input type="checkbox" checked={selected.has(user.id)}
                    onChange={e => setSelected(prev => {
                      const next = new Set(prev)
                      if (e.target.checked) next.add(user.id)
                      else next.delete(user.id)
                      return next
                    })} className="rounded" />
                </td>
                <td className="py-3 pr-4">
                  <p className="font-medium" style={{ color: 'var(--text)' }}>{user.display_name ?? 'No name'}</p>
                  <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{user.email}</p>
                </td>
                <td className="py-3 pr-4">
                  <span className={`text-xs rounded-full px-2 py-0.5 ${user.role === 'super_admin' ? 'bg-purple-500/20 text-purple-400' : 'bg-gray-500/20 text-gray-400'}`}>
                    {user.role ?? 'user'}
                  </span>
                </td>
                {modules.map(mod => {
                  const key = `${user.id}-${mod.id}`
                  const enabled = isEnabled(user.id, mod.id)
                  const isSaving = saving === key
                  return (
                    <td key={mod.id} className="py-3 px-2 text-center">
                      <button onClick={() => toggleModule(user.id, mod.id)} disabled={isSaving}
                        className="h-6 w-6 rounded-md mx-auto flex items-center justify-center transition-all"
                        style={{ background: enabled ? 'var(--success)' : 'var(--border)', opacity: isSaving ? 0.5 : 1 }}>
                        {isSaving ? <Loader2 size={10} className="animate-spin text-white" /> : enabled ? <Check size={12} color="#fff" /> : null}
                      </button>
                    </td>
                  )
                })}
                <td className="py-3 pl-4 text-right">
                  <button onClick={() => enableAllForUser(user.id)} className="text-xs" style={{ color: 'var(--accent)' }}>
                    Enable All
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filteredUsers.length === 0 && (
          <p className="py-8 text-center text-sm" style={{ color: 'var(--text-muted)' }}>No users found.</p>
        )}
      </div>
    </div>
  )
}
