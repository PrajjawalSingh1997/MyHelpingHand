"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { format } from "date-fns";
import { Flame, LogOut } from "lucide-react";

interface TopBarProps {
  userId: string
  displayName: string
}

export function TopBar({ userId, displayName }: TopBarProps) {
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [cycleDay, setCycleDay] = useState<number | null>(null)
  const [streak, setStreak] = useState(0)

  useEffect(() => {
    setMounted(true)
    loadCycleInfo()
  }, [userId])

  async function loadCycleInfo() {
    const supabase = createClient()

    // Get active cycle
    const { data: cycle } = await supabase
      .from('ninety_day_cycles')
      .select('start_date, end_date')
      .eq('user_id', userId)
      .eq('is_active', true)
      .single() as { data: { start_date: string; end_date: string } | null }

    if (!cycle) return

    const today = new Date()
    const start = new Date(cycle.start_date)
    const dayNum = Math.floor((today.getTime() - start.getTime()) / 86400000) + 1
    setCycleDay(Math.min(Math.max(dayNum, 1), 90))

    // Calculate streak: count consecutive days backwards where >50% tasks done
    const { data: days } = await supabase
      .from('days')
      .select('date, id')
      .eq('user_id', userId)
      .lte('date', today.toISOString().split('T')[0])
      .order('date', { ascending: false })
      .limit(30) as { data: { id: string; date: string }[] | null }

    if (!days?.length) return

    let s = 0
    for (const day of days) {
      const { data: tasks } = await supabase
        .from('tasks')
        .select('status')
        .eq('day_id', day.id) as { data: { status: string }[] | null }

      if (!tasks?.length) break
      const done = tasks.filter(t => t.status === 'completed').length
      if (done / tasks.length >= 0.5) s++
      else break
    }
    setStreak(s)
  }

  async function handleSignOut() {
    const supabase = createClient()
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#2D2D3F] bg-[#0A0A0F]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#64748B]">
          {mounted ? format(new Date(), "EEEE, MMMM d, yyyy") : ""}
        </span>
      </div>

      <div className="flex items-center gap-3">
        {streak > 0 && (
          <div className="flex items-center gap-1.5 rounded-full bg-[#FF6B6B]/10 px-3 py-1">
            <Flame className="h-4 w-4 text-[#FF6B6B]" />
            <span className="text-xs font-semibold text-[#FF6B6B]">{streak}d streak</span>
          </div>
        )}

        {cycleDay !== null && (
          <div className="flex items-center gap-1.5 rounded-full bg-[#6C5CE7]/10 px-3 py-1">
            <span className="text-xs font-semibold text-[#6C5CE7]">Day {cycleDay} of 90</span>
          </div>
        )}

        <button
          onClick={handleSignOut}
          title="Sign out"
          className="flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-xs text-[#64748B] transition-colors hover:bg-[#1E1E2E] hover:text-[#E2E8F0]"
        >
          <LogOut size={14} />
          <span className="hidden sm:inline">{displayName}</span>
        </button>
      </div>
    </header>
  );
}
