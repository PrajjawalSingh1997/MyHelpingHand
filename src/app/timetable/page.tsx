"use client";
import { planA, planB, planC, weeklyRhythm } from "@/data/timetables";
import { useState, useEffect, useCallback } from "react";
import { TimeBlock } from "@/lib/types";
import { Check, RotateCcw } from "lucide-react";

/**
 * Timetable reset logic:
 * - Checkboxes are stored in localStorage with key "gt_timetable_checks"
 * - The stored object has a "date" field (YYYY-MM-DD based on 11 AM cutoff)
 * - When the page loads, if the stored date !== today's date (11 AM cutoff), all checkboxes reset
 * - "Today's date" changes at 11:00 AM IST, not midnight — because the user wakes at noon
 */
function getTimetableDay(): string {
  const now = new Date();
  // If before 11 AM, it's still "yesterday's" timetable day
  if (now.getHours() < 11) {
    const yesterday = new Date(now);
    yesterday.setDate(yesterday.getDate() - 1);
    return yesterday.toISOString().split("T")[0];
  }
  return now.toISOString().split("T")[0];
}

interface TimetableState {
  date: string;
  checked: Record<string, boolean>; // key: "planType_index"
}

function loadChecks(): TimetableState {
  if (typeof window === "undefined") return { date: getTimetableDay(), checked: {} };
  try {
    const raw = localStorage.getItem("gt_timetable_checks");
    if (!raw) return { date: getTimetableDay(), checked: {} };
    const parsed: TimetableState = JSON.parse(raw);
    // Auto-reset if date has changed
    if (parsed.date !== getTimetableDay()) {
      return { date: getTimetableDay(), checked: {} };
    }
    return parsed;
  } catch {
    return { date: getTimetableDay(), checked: {} };
  }
}

function saveChecks(state: TimetableState) {
  localStorage.setItem("gt_timetable_checks", JSON.stringify(state));
}

function TimelineView({
  blocks,
  label,
  planKey,
  checks,
  onToggle,
}: {
  blocks: TimeBlock[];
  label: string;
  planKey: string;
  checks: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const checkedCount = blocks.filter((_, i) => checks[`${planKey}_${i}`]).length;
  const pct = blocks.length > 0 ? Math.round((checkedCount / blocks.length) * 100) : 0;

  return (
    <div className="card">
      <div className="mb-4 flex items-center justify-between">
        <h3 className="text-sm font-semibold text-[#E2E8F0]">{label}</h3>
        <div className="flex items-center gap-2">
          <span className="text-xs text-[#64748B]">{checkedCount}/{blocks.length}</span>
          <div className="h-1.5 w-20 overflow-hidden rounded-full bg-[#2D2D3F]">
            <div className="h-full rounded-full bg-[#6C5CE7] transition-all" style={{ width: `${pct}%` }} />
          </div>
        </div>
      </div>
      <div className="space-y-2">
        {blocks.map((block, i) => {
          const key = `${planKey}_${i}`;
          const isChecked = checks[key] || false;
          // Check if current time is in this block's range
          const now = new Date();
          const currentHour = now.getHours() + now.getMinutes() / 60;
          const blockStart = parseTimeToHours(block.time.split("–")[0].trim());
          const blockEnd = parseTimeToHours(block.time.split("–")[1].trim());
          const isActive = currentHour >= blockStart && currentHour < blockEnd;

          return (
            <div
              key={i}
              className={`flex items-center gap-4 rounded-lg p-3 transition-all ${
                isActive
                  ? "bg-[#6C5CE7]/10 ring-1 ring-[#6C5CE7]"
                  : isChecked
                  ? "bg-[#00B894]/5"
                  : "bg-[#0A0A0F] hover:bg-[#1E1E2E]"
              }`}
            >
              {/* Checkbox */}
              <button
                onClick={() => onToggle(key)}
                className={`flex h-6 w-6 flex-shrink-0 items-center justify-center rounded-md border-2 transition-all ${
                  isChecked
                    ? "border-[#00B894] bg-[#00B894] text-white"
                    : "border-[#2D2D3F] bg-transparent hover:border-[#6C5CE7]"
                }`}
              >
                {isChecked && <Check className="h-4 w-4" />}
              </button>

              <span className="text-2xl">{block.emoji}</span>
              <div className="flex-1">
                <p className={`text-sm font-medium ${isChecked ? "text-[#64748B] line-through" : "text-[#E2E8F0]"}`}>
                  {block.name}
                </p>
                <p className="text-xs text-[#64748B]">{block.activity}</p>
              </div>
              <div className="text-right">
                <p className={`text-xs ${isActive ? "text-[#6C5CE7] font-semibold" : "text-[#6C5CE7]"}`}>
                  {block.time}
                  {isActive && " ◀ NOW"}
                </p>
                <p className="text-[10px] text-[#64748B]">{block.duration}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

// Parse "12:30 PM" → decimal hours (12.5)
function parseTimeToHours(timeStr: string): number {
  const match = timeStr.match(/(\d+):(\d+)\s*(AM|PM)/i);
  if (!match) return 0;
  let hours = parseInt(match[1]);
  const minutes = parseInt(match[2]);
  const period = match[3].toUpperCase();
  if (period === "PM" && hours !== 12) hours += 12;
  if (period === "AM" && hours === 12) hours = 0;
  return hours + minutes / 60;
}

export default function TimetablePage() {
  const [tab, setTab] = useState<"A" | "B" | "C" | "weekly">("A");
  const [checkState, setCheckState] = useState<TimetableState>({ date: "", checked: {} });
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setCheckState(loadChecks());
    setMounted(true);

    // Check every minute if we need to reset (11 AM boundary)
    const interval = setInterval(() => {
      const currentDay = getTimetableDay();
      setCheckState((prev) => {
        if (prev.date !== currentDay) {
          const newState = { date: currentDay, checked: {} };
          saveChecks(newState);
          return newState;
        }
        return prev;
      });
    }, 60000); // check every minute

    return () => clearInterval(interval);
  }, []);

  const toggleCheck = useCallback((key: string) => {
    setCheckState((prev) => {
      const newState = {
        ...prev,
        checked: { ...prev.checked, [key]: !prev.checked[key] },
      };
      saveChecks(newState);
      return newState;
    });
  }, []);

  const resetAll = () => {
    const newState: TimetableState = { date: getTimetableDay(), checked: {} };
    saveChecks(newState);
    setCheckState(newState);
  };

  // Count total checked today
  const totalChecked = Object.values(checkState.checked).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">⏰ Timetable</h1>
          <p className="text-xs text-[#64748B]">
            Checkboxes auto-reset at 11:00 AM daily • {totalChecked > 0 ? `${totalChecked} blocks completed today` : "Start checking off your blocks!"}
          </p>
        </div>
        <button onClick={resetAll} className="flex items-center gap-1 rounded-lg bg-[#FF6B6B]/15 px-3 py-1.5 text-xs text-[#FF6B6B] transition-all hover:bg-[#FF6B6B]/25">
          <RotateCcw className="h-3 w-3" /> Reset
        </button>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-[#2D2D3F] bg-[#14141F]">
        {([
          { key: "A" as const, label: "Plan A (Standard)" },
          { key: "B" as const, label: "Plan B (Heavy Coding)" },
          { key: "C" as const, label: "Plan C (Content Day)" },
          { key: "weekly" as const, label: "Weekly Rhythm" },
        ]).map((t) => (
          <button key={t.key} onClick={() => setTab(t.key)} className={`flex-1 px-4 py-2 text-sm transition-all ${tab === t.key ? "bg-[#6C5CE7] text-white" : "text-[#64748B] hover:text-white"}`}>
            {t.label}
          </button>
        ))}
      </div>

      {mounted && (
        <>
          {tab === "A" && <TimelineView blocks={planA} label="📘 Plan A — Standard Day (12 PM – 5 AM)" planKey="A" checks={checkState.checked} onToggle={toggleCheck} />}
          {tab === "B" && <TimelineView blocks={planB} label="📙 Plan B — Heavy Coding Day" planKey="B" checks={checkState.checked} onToggle={toggleCheck} />}
          {tab === "C" && <TimelineView blocks={planC} label="📗 Plan C — Content & Freelancing Day" planKey="C" checks={checkState.checked} onToggle={toggleCheck} />}
        </>
      )}

      {tab === "weekly" && (
        <div className="card">
          <h3 className="mb-4 text-sm font-semibold text-[#E2E8F0]">Weekly Rhythm</h3>
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-[#2D2D3F] text-[#64748B]">
                <th className="py-2 text-left font-medium">Day</th>
                <th className="py-2 text-left font-medium">Focus</th>
                <th className="py-2 text-center font-medium">Plan</th>
                <th className="py-2 text-right font-medium">Content Platform</th>
              </tr>
            </thead>
            <tbody>
              {weeklyRhythm.map((row) => {
                const today = new Date().toLocaleDateString("en-US", { weekday: "long" });
                const isToday = row.day === today;
                return (
                  <tr key={row.day} className={`border-b border-[#2D2D3F]/50 ${isToday ? "bg-[#6C5CE7]/10" : ""}`}>
                    <td className="py-3 font-medium text-[#E2E8F0]">
                      {row.day} {isToday && <span className="text-[10px] text-[#6C5CE7]">◀ TODAY</span>}
                    </td>
                    <td className="py-3 text-[#64748B]">{row.focus}</td>
                    <td className="py-3 text-center">
                      <span className={`badge ${row.plan === "A" ? "bg-blue-500/15 text-blue-400" : row.plan === "B" ? "bg-orange-500/15 text-orange-400" : "bg-green-500/15 text-green-400"}`}>
                        Plan {row.plan}
                      </span>
                    </td>
                    <td className="py-3 text-right text-[#64748B]">{row.platform}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
