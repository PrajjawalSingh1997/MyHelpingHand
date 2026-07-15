'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Loader2, Save, LogOut, Download } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { exportUserData, downloadJson } from '@/lib/export'

interface ProfileData {
  display_name: string | null
  bio: string | null
  role: string | null
  linkedin_url: string | null
  github_url: string | null
  twitter_url: string | null
  portfolio_url: string | null
}
interface SettingsData {
  theme: string
  notifications_enabled: boolean
  daily_reminder_time: string | null
  timezone: string
  week_start: string
  debt_total: number
}

export default function SettingsPage() {
  const router = useRouter()
  const [loading, setLoading]       = useState(true)
  const [savingProfile, setSavingProfile] = useState(false)
  const [savingSettings, setSavingSettings] = useState(false)
  const [userId, setUserId]       = useState<string | null>(null)
  const [email, setEmail]       = useState('')
  const [profile, setProfile]   = useState<ProfileData>({ display_name: '', bio: '', role: '', linkedin_url: '', github_url: '', twitter_url: '', portfolio_url: '' })
  const [settings, setSettings] = useState<SettingsData>({
    theme: 'dark',
    notifications_enabled: false,
    daily_reminder_time: '06:00',
    timezone: 'Asia/Kolkata',
    week_start: 'monday',
    debt_total: 80000,
  })
  const [msg, setMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [exporting, setExporting] = useState(false)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)
      setEmail(user.email ?? '')

      const [pRes, sRes] = await Promise.all([
        supabase.from('user_profiles').select('display_name, bio, role, linkedin_url, github_url, twitter_url, portfolio_url').eq('id', user.id).single(),
        supabase.from('user_settings').select('theme, notifications_enabled, daily_reminder_time, timezone, week_start, debt_total').eq('user_id', user.id).single(),
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
    setSavingProfile(true)
    const supabase = createClient()
    const { error } = await supabase.from('user_profiles').update({ 
      display_name: profile.display_name, 
      bio: profile.bio,
      linkedin_url: profile.linkedin_url,
      github_url: profile.github_url,
      twitter_url: profile.twitter_url,
      portfolio_url: profile.portfolio_url
    }).eq('id', userId)
    setMsg(error ? { type: 'error', text: 'Failed to save profile.' } : { type: 'success', text: 'Profile saved!' })
    setSavingProfile(false)
    setTimeout(() => setMsg(null), 3000)
  }

  const saveSettings = async () => {
    if (!userId) return
    setSavingSettings(true)
    const supabase = createClient()
    const { error } = await supabase.from('user_settings').update(settings).eq('user_id', userId)
    setMsg(error ? { type: 'error', text: 'Failed to save settings.' } : { type: 'success', text: 'Settings saved!' })
    setSavingSettings(false)
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

  const exportData = async () => {
    if (!userId) return
    setExporting(true)
    try {
      const data = await exportUserData(userId)
      downloadJson(`life-os-export-${new Date().toISOString().slice(0, 10)}.json`, data)
      setMsg({ type: 'success', text: 'Export downloaded!' })
    } catch {
      setMsg({ type: 'error', text: 'Export failed. Please try again.' })
    }
    setExporting(false)
    setTimeout(() => setMsg(null), 3000)
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
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="label">LinkedIn URL</label>
            <input value={profile.linkedin_url ?? ''} onChange={e => setProfile({ ...profile, linkedin_url: e.target.value })} className="input mt-1 w-full" placeholder="https://linkedin.com/in/..." />
          </div>
          <div>
            <label className="label">GitHub URL</label>
            <input value={profile.github_url ?? ''} onChange={e => setProfile({ ...profile, github_url: e.target.value })} className="input mt-1 w-full" placeholder="https://github.com/..." />
          </div>
          <div>
            <label className="label">Twitter / X URL</label>
            <input value={profile.twitter_url ?? ''} onChange={e => setProfile({ ...profile, twitter_url: e.target.value })} className="input mt-1 w-full" placeholder="https://x.com/..." />
          </div>
          <div>
            <label className="label">Portfolio URL</label>
            <input value={profile.portfolio_url ?? ''} onChange={e => setProfile({ ...profile, portfolio_url: e.target.value })} className="input mt-1 w-full" placeholder="https://..." />
          </div>
        </div>
        <button onClick={saveProfile} disabled={savingProfile}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: savingProfile ? 0.6 : 1 }}>
          {savingProfile ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {savingProfile ? 'Saving…' : 'Save Profile'}
        </button>
      </div>

      {/* Preferences */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Preferences</h2>
        <div>
          <label className="label mb-2 block">Theme</label>
          <div className="flex gap-4">
            {['dark', 'light', 'system'].map(t => (
              <label key={t} className="flex cursor-pointer items-center gap-2 text-sm" style={{ color: 'var(--text)' }}>
                <input type="radio" name="theme" value={t} checked={settings.theme === t}
                  onChange={(e) => {
                    setSettings({ ...settings, theme: e.target.value })
                    document.documentElement.setAttribute('data-theme', e.target.value === 'system' ? '' : e.target.value)
                  }}
                  className="text-[#6C5CE7] focus:ring-[#6C5CE7] border-[#2D2D3F] bg-[#0A0A0F]" />
                {t.charAt(0).toUpperCase() + t.slice(1)}
              </label>
            ))}
          </div>
        </div>
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

        </div>
        <button onClick={saveSettings} disabled={savingSettings}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: savingSettings ? 0.6 : 1 }}>
          {savingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {savingSettings ? 'Saving…' : 'Save Preferences'}
        </button>
      </div>

      {/* Finance Configuration */}
      <div className="card space-y-4">
        <h2 className="text-sm font-semibold" style={{ color: 'var(--text)' }}>Finance Configuration</h2>
        <div className="flex gap-4">
          <div className="flex-1">
            <label className="label">Total Debt (₹)</label>
            <input type="number" value={settings.debt_total} onChange={e => setSettings({ ...settings, debt_total: parseFloat(e.target.value) || 0 })} className="input mt-1 w-full" placeholder="80000" />
            <p className="mt-1 text-[10px]" style={{ color: 'var(--text-muted)' }}>
              This defines the 100% mark for your debt payoff progress bar.
            </p>
          </div>
        </div>
        <button onClick={saveSettings} disabled={savingSettings}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: savingSettings ? 0.6 : 1 }}>
          {savingSettings ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
          {savingSettings ? 'Saving…' : 'Save Finance Settings'}
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

      {/* Data export */}
      <div className="card">
        <h2 className="mb-2 text-sm font-semibold" style={{ color: 'var(--text)' }}>Your Data</h2>
        <p className="mb-4 text-xs" style={{ color: 'var(--text-muted)' }}>
          Download every table you own — tasks, goals, health, finance, CRM, habits, and everything else — as one JSON file.
        </p>
        <button onClick={exportData} disabled={exporting}
          className="btn-primary flex items-center gap-2 text-sm" style={{ opacity: exporting ? 0.6 : 1 }}>
          {exporting ? <Loader2 size={14} className="animate-spin" /> : <Download size={14} />}
          {exporting ? 'Exporting…' : 'Export My Data'}
        </button>
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
