"use client";
import { useTaskStore } from "@/store/task-store";
import { format } from "date-fns";
import { Flame } from "lucide-react";

export function TopBar() {
  const currentDay = useTaskStore((s) => s.getCurrentDayNumber());
  const streak = useTaskStore((s) => s.getStreak());

  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-[#2D2D3F] bg-[#0A0A0F]/80 px-6 backdrop-blur-md">
      <div className="flex items-center gap-3">
        <span className="text-sm text-[#64748B]">
          {format(new Date(), "EEEE, MMMM d, yyyy")}
        </span>
      </div>

      <div className="flex items-center gap-4">
        {/* Streak */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#FF6B6B]/10 px-3 py-1">
          <Flame className="h-4 w-4 text-[#FF6B6B]" />
          <span className="text-xs font-semibold text-[#FF6B6B]">{streak} day streak</span>
        </div>

        {/* Day counter */}
        <div className="flex items-center gap-1.5 rounded-full bg-[#6C5CE7]/10 px-3 py-1">
          <span className="text-xs font-semibold text-[#6C5CE7]">Day {currentDay} of 90</span>
        </div>
      </div>
    </header>
  );
}
