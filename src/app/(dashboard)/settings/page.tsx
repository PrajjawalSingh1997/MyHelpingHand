'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, LogOut } from 'lucide-react'
import { useRouter } from 'next/navigation'

interface ProfileData {
  display_name: string | null
  bio: string | null
  role: string | null
}
interface SettingsData {
  theme: string
  notifications_enabled: boolean
  daily_reminder_time: string | null
  timezone: string
  week_start: string
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading]   = useState(true)
  const [saving, setSaving]     = useState(false)
  const [userId, setUserId]     = useState<string | null>(null)
  const [email, setEmail]       = useState('')
  const [profile, setProfile]   = useState<ProfileData>({ display_name: '', bio: '', role: '' })
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'dark',
    notifications_enabled: false,
    daily_reminder_time: '06:00',
    timezone: 'Asia/Kolkata',
    week_start: 'monday',
  })
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      setEmail(user.email ?? '')

      const [pRes, sRes] = await Promise.all([
        supabase.from('user_profiles').select('display_name, bio, role').eq('id', user.id).single(),
        supabase.from('user_settings').select('theme, notifications_enabled, daily_reminder_time, timezone, week_start').eq('user_id', user.id).single(),
      ])
      const p = pRes.data as ProfileData | null
      const s = sRes.data as SettingsData | null

      if (p) setProfile(p)
      if (s) setSettings(s)
      setLoading(false)
    }
    load()
  }, [])

  const saveProfile = async () => {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('user_profiles').update({ display_name: profile.display_name, bio: profile.bio }).eq('id', userId)
    setMsg({ type: 'success', text: 'Profile saved!' })
    setSaving(false)
    setTimeout(() => setMsg(null), 3000)
  }

  const saveSettings = async () => {
    if (!userId) return
    setSaving(true)
    const supabase = createClient()
    await supabase.from('user_settings').update(settings).eq('user_id', userId)
    setMsg({ type: 'success', text: 'Settings saved!' })
    setSaving(false)
    setTimeout(() => setMsg(null), 3000)
  }

  const changePassword = async () => {
    if (!newPassword || newPassword !== confirmPassword) {
      setMsg({ type: 'error', text: 'Passwords do not match.' })
      return
    }
    if (newPassword.length < 8) {
      setMsg({ type: 'error', text: 'Password must be at least 8 characters.' })
      return
    }
    const supabase = createClient()
    const { error } = await supabase.auth.updateUser({ password: newPassword })
    if (error) setMsg({ type: 'error', text: error.message })
    else {
      setMsg({ type: 'success', text: 'Password updated successfully!' })
      setNewPassword('')
      setConfirmPassword('')
    }
    setTimeout(() => setMsg(null), 4000)
  }

  const signOut = async () => {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  return (
    <div className="max-w-2xl space-y-6">
      <div>
        <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>⚙️ Settings</h1>
        <p className="text-xs" style={{ color: 'var(--text-muted)' }}>{email}</p>
      </div>

      {msg && (
        <div className="rounded-lg px-4 py-3 text-sm" style={{ background: msg.type === 'success' ? 'rgba(0,184,148,0.15)' : 'rgba(255,107,107,0.15)', color: msg.type === 'success' ? 'var(--success)' : 'var(--danger)' }}>
          {msg.text}
        </div>
      )}

      {/* Profile */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Profile</h2>
        <div>
          <label className="label">Display Name</label>
          <input value={profile.display_name ?? ''} onChange={e => setProfile({ ...profile, display_name: e.target.value })} className="input mt-1 w-full" />
        </div>
        <div>
          <label className="label">Bio</label>
          <textarea value={profile.bio ?? ''} onChange={e => setProfile({ ...profile, bio: e.target.value })} rows={2} className="input mt-1 w-full resize-none" placeholder="Tell us about yourself..." />
        </div>
        <button onClick={saveProfile} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> Save Profile
        </button>
      </div>

      {/* Preferences */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Preferences</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Timezone</label>
            <select value={settings.timezone} onChange={e => setSettings({ ...settings, timezone: e.target.value })} className="input mt-1 w-full">
              {['Asia/Kolkata', 'UTC', 'America/New_York', 'America/Los_Angeles', 'Europe/London', 'Europe/Paris'].map(tz => (
                <option key={tz} value={tz}>{tz}</option>
              ))}
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Week Starts</label>
            <select value={settings.week_start} onChange={e => setSettings({ ...settings, week_start: e.target.value })} className="input mt-1 w-full">
              <option value="monday">Monday</option>
              <option value="sunday">Sunday</option>
            </select>
          </div>
          <div className="flex-1">
            <label className="label">Daily Reminder</label>
            <input type="time" value={settings.daily_reminder_time ?? '06:00'} onChange={e => setSettings({ ...settings, daily_reminder_time: e.target.value })} className="input mt-1 w-full" />
          </div>
        </div>
        <button onClick={saveSettings} disabled={saving}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: saving ? 0.6 : 1 }}>
          <Save size={14} /> Save Preferences
        </button>
      </div>

      {/* Password */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Change Password</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">New Password</label>
            <input type="password" value={newPassword} onChange={e => setNewPassword(e.target.value)} className="input mt-1 w-full" placeholder="Min. 8 characters" />
          </div>
          <div className="flex-1">
            <label className="label">Confirm Password</label>
            <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} className="input mt-1 w-full" placeholder="Repeat password" />
          </div>
        </div>
        <button onClick={changePassword} className="btn-primary text-sm">Update Password</button>
      </div>

      {/* Sign out */}
      <div className="card">
        <h2 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Account</h2>
        <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>Sign out of your Life OS account on this device.</p>
        <button onClick={signOut} className="flex items-center gap-2 rounded-lg px-4 py-2 text-sm transition-all"
          style={{ background: 'rgba(255,107,107,0.15)', color: 'var(--danger)' }}>
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  )
}
