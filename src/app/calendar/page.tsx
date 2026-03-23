"use client";
import { useTaskStore } from "@/store/task-store";
import { format, parseISO } from "date-fns";
import Link from "next/link";

const monthMeta = [
  { label: "Month 1: The Origin Story", start: 1, end: 30 },
  { label: "Month 2: The Builder", start: 31, end: 60 },
  { label: "Month 3: The Authority", start: 61, end: 90 },
];

export default function CalendarPage() {
  const days = useTaskStore((s) => s.days);
  const getCurrentDayNumber = useTaskStore((s) => s.getCurrentDayNumber);
  const currentDay = getCurrentDayNumber();

  const totalCompleted = days.filter((d) => d.dayNumber <= currentDay).reduce((sum, d) => {
    const done = d.tasks.filter((t) => t.completed || t.skipped).length;
    return sum + (done / d.tasks.length >= 0.5 ? 1 : 0);
  }, 0);

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📆 Calendar View</h1>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{currentDay}</p>
          <p className="text-xs text-[#64748B]">Days In</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#00B894]">{totalCompleted}</p>
          <p className="text-xs text-[#64748B]">Good Days (≥50%)</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{90 - currentDay}</p>
          <p className="text-xs text-[#64748B]">Days Remaining</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#6C5CE7]">{Math.round((totalCompleted / Math.max(currentDay, 1)) * 100)}%</p>
          <p className="text-xs text-[#64748B]">Success Rate</p>
        </div>
      </div>

      {/* Calendar Grid by Month */}
      {monthMeta.map((month) => {
        const monthDays = days.filter((d) => d.dayNumber >= month.start && d.dayNumber <= month.end);
        const weeks: (typeof days)[] = [];
        for (let i = 0; i < monthDays.length; i += 7) {
          weeks.push(monthDays.slice(i, i + 7));
        }

        return (
          <div key={month.label} className="card">
            <h3 className="mb-4 text-sm font-semibold text-[#E2E8F0]">{month.label}</h3>
            <div className="space-y-2">
              {/* Day headers */}
              <div className="grid grid-cols-7 gap-2">
                {["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"].map((d) => (
                  <div key={d} className="text-center text-[10px] font-medium text-[#64748B]">{d}</div>
                ))}
              </div>

              {weeks.map((week, wi) => (
                <div key={wi} className="grid grid-cols-7 gap-2">
                  {week.map((day) => {
                    const done = day.tasks.filter((t) => t.completed || t.skipped).length;
                    const total = day.tasks.length;
                    const pct = total > 0 ? done / total : 0;
                    const isCurrent = day.dayNumber === currentDay;
                    const isFuture = day.dayNumber > currentDay;

                    return (
                      <Link key={day.dayNumber} href={`/day/${day.dayNumber}`}>
                        <div
                          className={`relative flex flex-col items-center rounded-lg p-2 transition-all hover:scale-105 ${
                            isCurrent
                              ? "bg-[#6C5CE7]/20 ring-2 ring-[#6C5CE7]"
                              : isFuture
                              ? "bg-[#14141F] opacity-40"
                              : pct >= 0.8
                              ? "bg-[#00B894]/10"
                              : pct >= 0.5
                              ? "bg-[#FDCB6E]/10"
                              : pct > 0
                              ? "bg-[#FF6B6B]/10"
                              : "bg-[#14141F]"
                          }`}
                        >
                          <span className="text-[10px] text-[#64748B]">{format(parseISO(day.date), "MMM d")}</span>
                          <span className="text-sm font-bold text-white">{day.dayNumber}</span>
                          <div className="mt-1 flex items-center gap-0.5">
                            {day.tasks.some((t) => t.category === "linkedin") && <span className="text-[8px]">📝</span>}
                            {day.tasks.some((t) => t.category === "github") && <span className="text-[8px]">🐙</span>}
                            {day.tasks.some((t) => t.category === "twitter") && <span className="text-[8px]">🐦</span>}
                          </div>
                          <span className={`badge mt-1 text-[8px] ${isFuture ? "bg-[#2D2D3F] text-[#64748B]" : pct >= 0.8 ? "bg-[#00B894]/20 text-[#00B894]" : pct >= 0.5 ? "bg-[#FDCB6E]/20 text-[#FDCB6E]" : "bg-[#FF6B6B]/20 text-[#FF6B6B]"}`}>
                            {isFuture ? "—" : `${Math.round(pct * 100)}%`}
                          </span>
                          {/* Plan indicator */}
                          <div className={`absolute right-1 top-1 h-1.5 w-1.5 rounded-full ${day.planType === "A" ? "bg-blue-400" : day.planType === "B" ? "bg-orange-400" : "bg-green-400"}`} />
                        </div>
                      </Link>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
