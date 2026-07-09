'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Day, Task } from '@/types/database'

export interface DayWithTasks extends Day {
  tasks: Task[]
}

export function useDay(dayNumber: number, cycleId?: string | null) {
  const [day, setDay] = useState<DayWithTasks | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)

  // Use a ref for resolvedCycleId to avoid adding it as a loadDay dependency
  // (which causes a double-fetch every time the cycle is first resolved).
  const cycleIdRef = useRef<string | null>(cycleId ?? null)
  const [resolvedCycleId, setResolvedCycleId] = useState<string | null>(cycleId ?? null)

  // Ref mirror of day state — lets callbacks read current day without stale closure.
  const dayRef = useRef<DayWithTasks | null>(null)

  const setDaySync = (d: DayWithTasks | null) => {
    dayRef.current = d
    setDay(d)
  }

  const loadDay = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    let cId = cycleId ?? cycleIdRef.current
    if (!cId) {
      const { data: c } = await supabase
        .from('ninety_day_cycles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as { data: { id: string } | null }
      cId = c?.id ?? null
      if (cId) {
        cycleIdRef.current = cId
        setResolvedCycleId(cId)
      }
    }
    if (!cId) { setLoading(false); return }

    const { data } = await supabase
      .from('days')
      .select('*, tasks(*)')
      .eq('cycle_id', cId)
      .eq('day_number', dayNumber)
      .single() as { data: any }

    if (data) {
      const sorted = [...(data.tasks ?? [])].sort(
        (a: Task, b: Task) => a.sort_order - b.sort_order
      )
      setDaySync({ ...data, tasks: sorted })
    } else {
      setDaySync(null)
    }
    setLoading(false)
  // Only depends on dayNumber and cycleId prop — not resolvedCycleId state —
  // so switching cycleId from outside triggers a reload but resolving it internally doesn't.
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dayNumber, cycleId])

  useEffect(() => { loadDay() }, [loadDay])

  const toggleTask = useCallback(async (taskId: string) => {
    // Read from ref to avoid stale closure on rapid clicks
    const task = dayRef.current?.tasks.find(t => t.id === taskId)
    if (!task) return
    const supabase = createClient()
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    const { error } = await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    if (!error) {
      setDay(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      } : null)
      dayRef.current = dayRef.current ? {
        ...dayRef.current,
        tasks: dayRef.current.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
      } : null
    }
  }, [])

  const skipTask = useCallback(async (taskId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').update({ status: 'skipped' }).eq('id', taskId)
    if (!error) {
      setDay(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'skipped' } : t)
      } : null)
      if (dayRef.current) {
        dayRef.current = {
          ...dayRef.current,
          tasks: dayRef.current.tasks.map(t => t.id === taskId ? { ...t, status: 'skipped' } : t)
        }
      }
    }
  }, [])

  const editTask = useCallback(async (taskId: string, updates: { title?: string; content?: string; notes?: string }) => {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').update(updates).eq('id', taskId)
    if (!error) {
      setDay(prev => prev ? {
        ...prev,
        tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
      } : null)
    }
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    const supabase = createClient()
    const { error } = await supabase.from('tasks').delete().eq('id', taskId)
    if (!error) {
      setDay(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : null)
      if (dayRef.current) {
        dayRef.current = { ...dayRef.current, tasks: dayRef.current.tasks.filter(t => t.id !== taskId) }
      }
    }
  }, [])

  const addTask = useCallback(async (title: string, category?: string) => {
    const currentDay = dayRef.current
    const currentUserId = userId
    if (!currentDay || !currentUserId) return
    const supabase = createClient()
    const maxOrder = currentDay.tasks.reduce((m, t) => Math.max(m, t.sort_order ?? 0), 0)
    const { data, error } = await supabase.from('tasks').insert({
      day_id: currentDay.id,
      user_id: currentUserId,
      title,
      category: category ?? 'general',
      status: 'pending',
      sort_order: maxOrder + 1,
    }).select().single() as { data: Task | null; error: any }
    if (data && !error) {
      setDay(prev => prev ? { ...prev, tasks: [...prev.tasks, data] } : null)
      if (dayRef.current) {
        dayRef.current = { ...dayRef.current, tasks: [...dayRef.current.tasks, data] }
      }
    }
  }, [userId])

  const updateNotes = useCallback(async (notes: string) => {
    const currentDay = dayRef.current
    if (!currentDay) return
    const supabase = createClient()
    await supabase.from('days').update({ notes }).eq('id', currentDay.id)
    setDay(prev => prev ? { ...prev, notes } : null)
    if (dayRef.current) dayRef.current = { ...dayRef.current, notes }
  }, [])

  const updateRentlyfHours = useCallback(async (hours: number) => {
    const currentDay = dayRef.current
    if (!currentDay) return
    const supabase = createClient()
    // Single client for both writes
    await supabase.from('days').update({ rentlyf_hours: hours }).eq('id', currentDay.id)
    const { data: { user } } = await supabase.auth.getUser()
    if (user) {
      await supabase.from('rentlyf_logs').upsert(
        { user_id: user.id, date: currentDay.date, hours, category: 'dashboard' },
        { onConflict: 'user_id,date' }
      )
    }
    setDay(prev => prev ? { ...prev, rentlyf_hours: hours } : null)
    if (dayRef.current) dayRef.current = { ...dayRef.current, rentlyf_hours: hours }
  }, [])

  const postponeTask = useCallback(async (taskId: string, targetDayNumber: number) => {
    const currentDay = dayRef.current
    const cId = cycleIdRef.current
    if (!currentDay || !cId) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const task = currentDay.tasks.find(t => t.id === taskId)
    if (!task) return

    const { data: targetDay } = await supabase
      .from('days')
      .select('id')
      .eq('cycle_id', cId)
      .eq('day_number', targetDayNumber)
      .single() as { data: { id: string } | null }

    if (!targetDay) return

    await supabase.from('tasks').insert({
      day_id: targetDay.id,
      user_id: user.id,
      title: task.title,
      category: task.category,
      platform: task.platform,
      status: 'pending',
      content: task.content,
      notes: `[Postponed from Day ${currentDay.day_number}]${task.notes ? ` ${task.notes}` : ''}`,
      sort_order: task.sort_order,
    })
    await supabase.from('tasks').update({ status: 'postponed' }).eq('id', taskId)
    await loadDay()
  }, [loadDay])

  return {
    day, loading, userId, resolvedCycleId,
    toggleTask, skipTask, editTask, deleteTask, addTask,
    updateNotes, updateRentlyfHours, postponeTask,
    reload: loadDay,
  }
}
