'use client'
import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { NinetyDayCycle } from '@/types/database'

export function useActiveCycle() {
  const [cycle, setCycle] = useState<NinetyDayCycle | null>(null)
  const [currentDay, setCurrentDay] = useState(1)
  const [userId, setUserId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function load() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) { setLoading(false); return }
      setUserId(user.id)

      const { data } = await supabase
        .from('ninety_day_cycles')
        .select('*')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as { data: NinetyDayCycle | null }

      if (data) {
        setCycle(data)
        const today = new Date()
        const start = new Date(data.start_date)
        const dayNum = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
        setCurrentDay(Math.min(Math.max(dayNum, 1), 90))
      }
      setLoading(false)
    }
    load()
  }, [])

  return { cycle, currentDay, userId, loading }
}
