'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { format, parseISO, startOfWeek, subWeeks, isSameDay } from 'date-fns'
import { Rocket, CheckSquare, BarChart3, TrendingUp, TrendingDown, Layers, Loader2 } from 'lucide-react'
import { useToast } from '@/components/ui/toast'
import type { BrandMetric } from '@/types/database'
import Link from 'next/link'

const PROFILE_ITEMS = [
  { id: 'photo', label: 'Profile photo' },
  { id: 'banner', label: 'Custom banner' },
  { id: 'headline', label: 'Headline optimized' },
  { id: 'url', label: 'Custom URL set' },
  { id: 'about', label: 'About section written' },
  { id: 'experience', label: 'Experience: Techwara added' },
  { id: 'projects', label: 'Projects added' },
  { id: 'skills', label: '50+ skills listed' },
  { id: 'featured', label: 'Featured section set up' },
  { id: 'creator', label: 'Creator Mode enabled' },
  { id: 'recommendations', label: '3+ Recommendations' },
]

const DAILY_ACTIONS = [
  { id: 'founder_comments', label: 'Comment on 5 founder posts' },
  { id: 'dev_comments', label: 'Comment on 5 dev posts' },
  { id: 'connections', label: 'Send 3 connection requests' },
  { id: 'replies', label: 'Reply to all comments on own posts' },
  { id: 'analytics', label: 'Check LinkedIn analytics' },
]

const PILLARS = [
  { slug: 'backend', name: 'Backend Engineering', color: '#6C5CE7' },
  { slug: 'startup', name: 'Startup Life', color: '#FDCB6E' },
  { slug: 'rentlyf', name: 'Building Rentlyf', color: '#00C9A7' },
  { slug: 'learning', name: 'Learning', color: '#FF9F43' },
  { slug: 'product', name: 'Product Thinking', color: '#E84393' },
  { slug: 'career', name: 'Career Journey', color: '#0984E3' },
  { slug: 'docs', name: 'Tech Documentation', color: '#A55EEA' },
  { slug: 'business', name: 'Business', color: '#20BF6B' },
]

export default function BrandHubPage() {
  const { show } = useToast()
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Profile Checklist
  const [profileChecks, setProfileChecks] = useState<Record<string, boolean>>({})
  
  // Daily Actions
  const [dailyActions, setDailyActions] = useState<Record<string, boolean>>({})
  const [actionDate, setActionDate] = useState(format(new Date(), 'yyyy-MM-dd'))

  // Metrics
  const [metrics, setMetrics] = useState<BrandMetric[]>([])
  const [savingMetrics, setSavingMetrics] = useState(false)
  const currentWeekStart = format(startOfWeek(new Date(), { weekStartsOn: 1 }), 'yyyy-MM-dd')
  const [metricForm, setMetricForm] = useState({
    week_of: currentWeekStart,
    followers: '',
    profile_views: '',
    search_appearances: '',
    post_impressions: '',
    connections: ''
  })

  // Pillar Counts
  const [pillarCounts, setPillarCounts] = useState<Record<string, number>>({})

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const today = format(new Date(), 'yyyy-MM-dd')

      const [profRes, dailyRes, metricsRes, postsRes] = await Promise.all([
        supabase.from('brand_profile_checklist').select('checklist').eq('user_id', user.id).single(),
        supabase.from('brand_daily_actions').select('date, actions_done').eq('user_id', user.id).eq('date', today).single(),
        supabase.from('brand_metrics').select('*').eq('user_id', user.id).order('week_of', { ascending: false }).limit(20),
        supabase.from('content_posts').select('pillar'),
      ])

      if (profRes.data?.checklist) {
        setProfileChecks(profRes.data.checklist as Record<string, boolean>)
      }
      
      if (dailyRes.data) {
        setDailyActions(dailyRes.data.actions_done as Record<string, boolean>)
        setActionDate(dailyRes.data.date)
      } else {
        setActionDate(today)
        setDailyActions({})
      }

      const mData = (metricsRes.data as BrandMetric[]) ?? []
      setMetrics(mData)

      // Pre-fill form if current week exists
      const currentWeekMetric = mData.find(m => m.week_of === currentWeekStart)
      if (currentWeekMetric) {
        setMetricForm({
          week_of: currentWeekMetric.week_of,
          followers: String(currentWeekMetric.followers),
          profile_views: String(currentWeekMetric.profile_views),
          search_appearances: String(currentWeekMetric.search_appearances),
          post_impressions: String(currentWeekMetric.post_impressions),
          connections: String(currentWeekMetric.connections),
        })
      }

      // Count posts by pillar
      const counts: Record<string, number> = {}
      if (postsRes.data) {
        postsRes.data.forEach((p: any) => {
          if (p.pillar) counts[p.pillar] = (counts[p.pillar] || 0) + 1
        })
      }
      setPillarCounts(counts)

      setLoading(false)
    }
    load()
  }, [currentWeekStart])

  const toggleProfileCheck = async (id: string, value: boolean) => {
    if (!userId) return
    const newChecks = { ...profileChecks, [id]: value }
    setProfileChecks(newChecks)

    const supabase = createClient()
    const { error } = await supabase.from('brand_profile_checklist').upsert({
      user_id: userId,
      checklist: newChecks
    })
    if (error) show('Could not save — run fix-missing-tables.sql in Supabase first.', 'error')
  }

  const toggleDailyAction = async (id: string, value: boolean) => {
    if (!userId) return
    const today = format(new Date(), 'yyyy-MM-dd')

    // If date changed, reset
    let currentActions = dailyActions
    if (actionDate !== today) {
      currentActions = {}
      setActionDate(today)
    }

    const newActions = { ...currentActions, [id]: value }
    setDailyActions(newActions)

    const supabase = createClient()
    const { error } = await supabase.from('brand_daily_actions').upsert({
      user_id: userId,
      date: today,
      actions_done: newActions
    })
    if (error) show('Could not save — run fix-missing-tables.sql in Supabase first.', 'error')
  }

  const saveMetrics = async () => {
    if (!userId) return
    setSavingMetrics(true)
    
    const dataToSave = {
      user_id: userId,
      week_of: metricForm.week_of,
      followers: parseInt(metricForm.followers || '0'),
      profile_views: parseInt(metricForm.profile_views || '0'),
      search_appearances: parseInt(metricForm.search_appearances || '0'),
      post_impressions: parseInt(metricForm.post_impressions || '0'),
      connections: parseInt(metricForm.connections || '0'),
    }

    const supabase = createClient()
    const { data, error } = await supabase.from('brand_metrics').upsert(dataToSave, { onConflict: 'user_id,week_of' }).select().single()

    if (error) {
      show('Failed to save metrics.', 'error')
    } else {
      setMetrics(prev => {
        const existing = prev.findIndex(m => m.week_of === metricForm.week_of)
        if (existing >= 0) {
          const newMetrics = [...prev]
          newMetrics[existing] = data as BrandMetric
          return newMetrics
        }
        return [data as BrandMetric, ...prev].sort((a, b) => b.week_of.localeCompare(a.week_of))
      })
      show('Metrics saved!', 'success')
    }
    setSavingMetrics(false)
  }

  if (loading) return (
    <div className="flex items-center justify-center py-24">
      <Loader2 size={32} className="animate-spin" style={{ color: 'var(--accent)' }} />
    </div>
  )

  const profileDoneCount = Object.values(profileChecks).filter(Boolean).length
  const dailyDoneCount = Object.values(dailyActions).filter(Boolean).length

  // Calculate chart max for simple CSS bars
  const maxFollowers = Math.max(...metrics.map(m => m.followers), 1)
  const last8Weeks = metrics.slice(0, 8).reverse()

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3 border-b pb-4" style={{ borderColor: 'var(--border)' }}>
        <div className="flex h-10 w-10 items-center justify-center rounded-lg" style={{ background: 'var(--accent-soft)', color: 'var(--accent)' }}>
          <Rocket size={20} />
        </div>
        <div>
          <h1 className="text-2xl font-bold" style={{ color: 'var(--text)' }}>Brand Hub</h1>
          <p className="text-sm" style={{ color: 'var(--text-muted)' }}>LinkedIn personal brand strategy & metrics.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Daily Actions */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                <CheckSquare size={18} style={{ color: 'var(--accent)' }} /> Daily Actions
              </h2>
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: dailyDoneCount === 5 ? 'var(--success-soft)' : 'var(--surface2)', color: dailyDoneCount === 5 ? 'var(--success)' : 'var(--text-muted)' }}>
                {dailyDoneCount}/5 done today
              </span>
            </div>
            <div className="space-y-2">
              {DAILY_ACTIONS.map(item => (
                <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#1A1A26]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#2D2D3F] bg-[#0A0A0F] text-[#6C5CE7] focus:ring-[#6C5CE7]"
                    checked={!!dailyActions[item.id]}
                    onChange={(e) => toggleDailyAction(item.id, e.target.checked)}
                  />
                  <span className="text-sm font-medium" style={{ color: dailyActions[item.id] ? 'var(--text-muted)' : 'var(--text)', textDecoration: dailyActions[item.id] ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Metrics Form */}
          <div className="card">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text)' }}>
              <BarChart3 size={18} style={{ color: 'var(--accent)' }} /> Log Weekly Metrics
            </h2>
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <label className="label">Week Of (Monday)</label>
                <input type="date" value={metricForm.week_of} onChange={e => setMetricForm({...metricForm, week_of: e.target.value})} className="input mt-1 w-full" />
              </div>
              <div>
                <label className="label">Followers</label>
                <input type="number" value={metricForm.followers} onChange={e => setMetricForm({...metricForm, followers: e.target.value})} className="input mt-1 w-full" />
              </div>
              <div>
                <label className="label">Connections</label>
                <input type="number" value={metricForm.connections} onChange={e => setMetricForm({...metricForm, connections: e.target.value})} className="input mt-1 w-full" />
              </div>
              <div>
                <label className="label">Profile Views</label>
                <input type="number" value={metricForm.profile_views} onChange={e => setMetricForm({...metricForm, profile_views: e.target.value})} className="input mt-1 w-full" />
              </div>
              <div>
                <label className="label">Search Appearances</label>
                <input type="number" value={metricForm.search_appearances} onChange={e => setMetricForm({...metricForm, search_appearances: e.target.value})} className="input mt-1 w-full" />
              </div>
              <div className="col-span-2">
                <label className="label">Post Impressions</label>
                <input type="number" value={metricForm.post_impressions} onChange={e => setMetricForm({...metricForm, post_impressions: e.target.value})} className="input mt-1 w-full" />
              </div>
              <div className="col-span-2 mt-2">
                <button onClick={saveMetrics} disabled={savingMetrics} className="btn-primary w-full flex items-center justify-center gap-2">
                  {savingMetrics && <Loader2 size={16} className="animate-spin" />}
                  Save Metrics
                </button>
              </div>
            </div>
          </div>

          {/* Chart */}
          {last8Weeks.length > 0 && (
            <div className="card">
              <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Follower Growth (Last 8 Weeks)</h2>
              <div className="flex h-32 items-end gap-2 pb-2">
                {last8Weeks.map(m => {
                  const height = `${Math.max((m.followers / maxFollowers) * 100, 5)}%`
                  return (
                    <div key={m.id} className="group relative flex flex-1 flex-col justify-end">
                      <div className="absolute -top-8 left-1/2 -translate-x-1/2 rounded bg-[#2D2D3F] px-2 py-1 text-xs opacity-0 transition-opacity group-hover:opacity-100 z-10 text-white whitespace-nowrap">
                        {m.followers} ({format(parseISO(m.week_of), 'MMM d')})
                      </div>
                      <div className="w-full rounded-t-sm transition-all hover:brightness-110" style={{ height, background: 'var(--accent)' }}></div>
                    </div>
                  )
                })}
              </div>
            </div>
          )}
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Profile Checklist */}
          <div className="card">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-bold flex items-center gap-2" style={{ color: 'var(--text)' }}>
                LinkedIn Profile
              </h2>
              <span className="rounded-full px-2 py-0.5 text-xs font-bold" style={{ background: profileDoneCount === 11 ? 'var(--success-soft)' : 'var(--surface2)', color: profileDoneCount === 11 ? 'var(--success)' : 'var(--text-muted)' }}>
                {profileDoneCount}/11 complete
              </span>
            </div>
            <div className="grid grid-cols-1 gap-2 md:grid-cols-2">
              {PROFILE_ITEMS.map(item => (
                <label key={item.id} className="flex cursor-pointer items-center gap-3 rounded-lg p-2 transition-colors hover:bg-[#1A1A26]">
                  <input
                    type="checkbox"
                    className="h-4 w-4 rounded border-[#2D2D3F] bg-[#0A0A0F] text-[#6C5CE7] focus:ring-[#6C5CE7]"
                    checked={!!profileChecks[item.id]}
                    onChange={(e) => toggleProfileCheck(item.id, e.target.checked)}
                  />
                  <span className="text-xs font-medium" style={{ color: profileChecks[item.id] ? 'var(--text-muted)' : 'var(--text)', textDecoration: profileChecks[item.id] ? 'line-through' : 'none' }}>
                    {item.label}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Content Pillars */}
          <div className="card">
            <h2 className="text-lg font-bold flex items-center gap-2 mb-4" style={{ color: 'var(--text)' }}>
              <Layers size={18} style={{ color: 'var(--accent)' }} /> Content Pillars
            </h2>
            <div className="grid grid-cols-2 gap-3">
              {PILLARS.map(pillar => (
                <Link key={pillar.slug} href={`/content?pillar=${pillar.slug}`} className="block">
                  <div className="rounded-lg p-3 transition-colors hover:bg-[#1A1A26]" style={{ border: '1px solid var(--border)' }}>
                    <div className="flex items-center gap-2 mb-2">
                      <div className="h-3 w-3 rounded-full" style={{ background: pillar.color }}></div>
                      <span className="text-xs font-bold truncate" style={{ color: 'var(--text)' }}>{pillar.name}</span>
                    </div>
                    <p className="text-xl font-bold" style={{ color: 'var(--text)' }}>
                      {pillarCounts[pillar.slug] || 0} <span className="text-xs font-normal text-muted">posts</span>
                    </p>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* Connection Growth Table */}
          <div className="card">
            <h2 className="text-sm font-bold mb-4" style={{ color: 'var(--text)' }}>Connection Growth</h2>
            {metrics.length === 0 ? (
              <p className="text-xs" style={{ color: 'var(--text-muted)' }}>No metrics logged yet.</p>
            ) : (
              <table className="w-full text-left text-sm">
                <thead>
                  <tr className="border-b" style={{ borderColor: 'var(--border)' }}>
                    <th className="pb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Week</th>
                    <th className="pb-2 font-medium" style={{ color: 'var(--text-muted)' }}>Connections</th>
                    <th className="pb-2 font-medium text-right" style={{ color: 'var(--text-muted)' }}>Growth</th>
                  </tr>
                </thead>
                <tbody className="divide-y" style={{ borderColor: 'var(--border)' }}>
                  {metrics.map((m, i) => {
                    const prev = metrics[i + 1]
                    const delta = prev ? m.connections - prev.connections : 0
                    return (
                      <tr key={m.id}>
                        <td className="py-2" style={{ color: 'var(--text)' }}>{format(parseISO(m.week_of), 'MMM d, yyyy')}</td>
                        <td className="py-2 font-bold" style={{ color: 'var(--text)' }}>{m.connections}</td>
                        <td className="py-2 text-right">
                          {delta !== 0 ? (
                            <span className="inline-flex items-center justify-end gap-1 font-bold text-xs" style={{ color: delta > 0 ? 'var(--success)' : 'var(--danger)' }}>
                              {delta > 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                              {Math.abs(delta)}
                            </span>
                          ) : <span className="text-xs" style={{ color: 'var(--text-muted)' }}>-</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
