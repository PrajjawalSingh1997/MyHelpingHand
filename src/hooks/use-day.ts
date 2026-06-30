'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import type { Day, Task } from '@/types/database'

export interface DayWithTasks extends Day {
  tasks: Task[]
}

export function useDay(dayNumber: number, cycleId?: string | null) {
  const [day, setDay] = useState<DayWithTasks | null>(null)
  const [loading, setLoading] = useState(true)
  const [userId, setUserId] = useState<string | null>(null)
  const [resolvedCycleId, setResolvedCycleId] = useState<string | null>(cycleId ?? null)

  const loadDay = useCallback(async () => {
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setLoading(false); return }
    setUserId(user.id)

    let cId = cycleId ?? resolvedCycleId
    if (!cId) {
      const { data: c } = await supabase
        .from('ninety_day_cycles')
        .select('id')
        .eq('user_id', user.id)
        .eq('is_active', true)
        .single() as { data: { id: string } | null }
      cId = c?.id ?? null
      if (cId) setResolvedCycleId(cId)
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
      setDay({ ...data, tasks: sorted })
    } else {
      setDay(null)
    }
    setLoading(false)
  }, [dayNumber, cycleId, resolvedCycleId])

  useEffect(() => { loadDay() }, [loadDay])

  const toggleTask = useCallback(async (taskId: string) => {
    const task = day?.tasks.find(t => t.id === taskId)
    if (!task) return
    const supabase = createClient()
    const newStatus = task.status === 'completed' ? 'pending' : 'completed'
    await supabase.from('tasks').update({ status: newStatus }).eq('id', taskId)
    setDay(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: newStatus } : t)
    } : null)
  }, [day])

  const skipTask = useCallback(async (taskId: string) => {
    const supabase = createClient()
    await supabase.from('tasks').update({ status: 'skipped' }).eq('id', taskId)
    setDay(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, status: 'skipped' } : t)
    } : null)
  }, [])

  const editTask = useCallback(async (taskId: string, updates: { title?: string; content?: string; notes?: string }) => {
    const supabase = createClient()
    await supabase.from('tasks').update(updates).eq('id', taskId)
    setDay(prev => prev ? {
      ...prev,
      tasks: prev.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
    } : null)
  }, [])

  const deleteTask = useCallback(async (taskId: string) => {
    const supabase = createClient()
    await supabase.from('tasks').delete().eq('id', taskId)
    setDay(prev => prev ? { ...prev, tasks: prev.tasks.filter(t => t.id !== taskId) } : null)
  }, [])

  const updateNotes = useCallback(async (notes: string) => {
    if (!day) return
    const supabase = createClient()
    await supabase.from('days').update({ notes }).eq('id', day.id)
    setDay(prev => prev ? { ...prev, notes } : null)
  }, [day])

  const updateRentlyfHours = useCallback(async (hours: number) => {
    if (!day) return
    const supabase = createClient()
    await supabase.from('days').update({ rentlyf_hours: hours }).eq('id', day.id)

    // Also upsert a rentlyf log entry
    const { data: { user } } = await createClient().auth.getUser()
    if (user) {
      await supabase.from('rentlyf_logs').upsert(
        { user_id: user.id, date: day.date, hours, category: 'dashboard' },
        { onConflict: 'user_id,date' }
      )
    }
    setDay(prev => prev ? { ...prev, rentlyf_hours: hours } : null)
  }, [day])

  const postponeTask = useCallback(async (taskId: string, targetDayNumber: number) => {
    if (!day || !resolvedCycleId) return
    const supabase = createClient()
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return

    const task = day.tasks.find(t => t.id === taskId)
    if (!task) return

    const { data: targetDay } = await supabase
      .from('days')
      .select('id')
      .eq('cycle_id', resolvedCycleId)
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
      notes: `[Postponed from Day ${day.day_number}]${task.notes ? ` ${task.notes}` : ''}`,
      sort_order: task.sort_order,
    })
    await supabase.from('tasks').update({ status: 'postponed' }).eq('id', taskId)
    await loadDay()
  }, [day, resolvedCycleId, loadDay])

  return {
    day, loading, userId, resolvedCycleId,
    toggleTask, skipTask, editTask, deleteTask,
    updateNotes, updateRentlyfHours, postponeTask,
    reload: loadDay,
  }
}
