"use client";
import { weeklyRhythm } from "@/data/timetables";
import { useTimetableStore } from "@/store/stores";
import { useState, useEffect, useCallback } from "react";
import { TimeBlock } from "@/lib/types";
import { Check, RotateCcw, Pencil, Trash2, Plus, X } from "lucide-react";

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
  planKey: "A" | "B" | "C";
  checks: Record<string, boolean>;
  onToggle: (key: string) => void;
}) {
  const checkedCount = blocks.filter((_, i) => checks[`${planKey}_${i}`]).length;
  const pct = blocks.length > 0 ? Math.round((checkedCount / blocks.length) * 100) : 0;

  const { updateBlock, deleteBlock, addBlock } = useTimetableStore();
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editForm, setEditForm] = useState<TimeBlock>({ time: "", emoji: "", name: "", activity: "", duration: "" });
  const [isAdding, setIsAdding] = useState(false);

  const startEdit = (index: number, block: TimeBlock) => {
    setEditingIndex(index);
    setEditForm(block);
    setIsAdding(false);
  };
  const saveEdit = () => {
    if (editingIndex !== null) {
      updateBlock(planKey, editingIndex, editForm);
      setEditingIndex(null);
    }
  };
  const startAdd = () => {
    setIsAdding(true);
    setEditingIndex(null);
    setEditForm({ time: "00:00 AM – 00:00 AM", emoji: "📌", name: "New Block", activity: "Description here", duration: "1 hr" });
  };
  const saveAdd = () => {
    addBlock(planKey, editForm);
    setIsAdding(false);
  };

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
          if (editingIndex === i) {
            return (
              <div key={i} className="rounded-lg bg-[#0A0A0F] p-4 space-y-3 ring-1 ring-[#2D2D3F]">
                <div className="flex gap-2">
                  <div className="w-16">
                    <label className="text-[10px] text-[#64748B]">Emoji</label>
                    <input value={editForm.emoji} onChange={e => setEditForm({...editForm, emoji: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-sm text-center text-white focus:border-[#6C5CE7] focus:outline-none" />
                  </div>
                  <div className="flex-1">
                    <label className="text-[10px] text-[#64748B]">Block Name</label>
                    <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-sm font-medium text-white focus:border-[#6C5CE7] focus:outline-none" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-[#64748B]">Activity details</label>
                  <input value={editForm.activity} onChange={e => setEditForm({...editForm, activity: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-xs text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none" />
                </div>
                <div className="flex gap-2">
                  <div className="flex-1">
                    <label className="text-[10px] text-[#64748B]">Time</label>
                    <input value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-xs text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none" placeholder="12:00 PM – 1:30 PM" />
                  </div>
                  <div className="w-24">
                    <label className="text-[10px] text-[#64748B]">Duration</label>
                    <input value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-xs text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none" />
                  </div>
                </div>
                <div className="flex gap-2 pt-2">
                  <button onClick={saveEdit} className="rounded-lg bg-[#00B894] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#00A381]">Save</button>
                  <button onClick={() => setEditingIndex(null)} className="rounded-lg bg-[#2D2D3F] px-4 py-1.5 text-xs font-medium text-[#64748B] hover:text-white">Cancel</button>
                </div>
              </div>
            );
          }

          const key = `${planKey}_${i}`;
          const isChecked = checks[key] || false;
          // Check if current time is in this block's range
          const now = new Date();
          const currentHour = now.getHours() + now.getMinutes() / 60;
          const blockStart = parseTimeToHours(block.time.split("–")[0]?.trim() || "0:00 AM");
          const blockEnd = parseTimeToHours(block.time.split("–")[1]?.trim() || "0:00 AM");
          const isActive = currentHour >= blockStart && currentHour < blockEnd;

          return (
            <div
              key={i}
              className={`group flex items-center gap-4 rounded-lg p-3 transition-all ${
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

              {/* Edit/Delete Actions */}
              <div className="flex flex-col items-center gap-1 opacity-0 transition-opacity group-hover:opacity-100 pl-2 border-l border-[#2D2D3F]">
                <button onClick={() => startEdit(i, block)} className="rounded p-1 text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#6C5CE7]" title="Edit">
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <button onClick={() => { if (confirm("Delete this block?")) deleteBlock(planKey, i); }} className="rounded p-1 text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#FF6B6B]" title="Delete">
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          );
        })}

        {/* Add Block */}
        {isAdding ? (
          <div className="rounded-lg bg-[#0A0A0F] p-4 space-y-3 ring-1 ring-[#6C5CE7]/50 mt-4">
            <h4 className="text-sm font-semibold text-[#6C5CE7]">Add New Time Block</h4>
            <div className="flex gap-2">
              <div className="w-16">
                <label className="text-[10px] text-[#64748B]">Emoji</label>
                <input value={editForm.emoji} onChange={e => setEditForm({...editForm, emoji: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-sm text-center text-white focus:border-[#6C5CE7] focus:outline-none" />
              </div>
              <div className="flex-1">
                <label className="text-[10px] text-[#64748B]">Block Name</label>
                <input value={editForm.name} onChange={e => setEditForm({...editForm, name: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-sm font-medium text-white focus:border-[#6C5CE7] focus:outline-none" />
              </div>
            </div>
            <div>
              <label className="text-[10px] text-[#64748B]">Activity details</label>
              <input value={editForm.activity} onChange={e => setEditForm({...editForm, activity: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-xs text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none" />
            </div>
            <div className="flex gap-2">
              <div className="flex-1">
                <label className="text-[10px] text-[#64748B]">Time</label>
                <input value={editForm.time} onChange={e => setEditForm({...editForm, time: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-xs text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none" placeholder="12:00 PM – 1:30 PM" />
              </div>
              <div className="w-24">
                <label className="text-[10px] text-[#64748B]">Duration</label>
                <input value={editForm.duration} onChange={e => setEditForm({...editForm, duration: e.target.value})} className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-1.5 text-xs text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none" />
              </div>
            </div>
            <div className="flex gap-2 pt-2">
              <button onClick={saveAdd} className="rounded-lg bg-[#6C5CE7] px-4 py-1.5 text-xs font-medium text-white hover:bg-[#5a4add]">Add Block</button>
              <button onClick={() => setIsAdding(false)} className="rounded-lg bg-[#2D2D3F] px-4 py-1.5 text-xs font-medium text-[#64748B] hover:text-white">Cancel</button>
            </div>
          </div>
        ) : (
          <button onClick={startAdd} className="mt-2 w-full flex items-center justify-center gap-2 rounded-lg border border-dashed border-[#2D2D3F] bg-[#0A0A0F]/50 p-3 text-sm text-[#64748B] transition-all hover:border-[#6C5CE7] hover:text-[#6C5CE7]">
            <Plus className="h-4 w-4" /> Add Block
          </button>
        )}
      </div>
    </div>
  );
}

// Parse "12:30 PM" → decimal hours (12.5)
function parseTimeToHours(timeStr: string): number {
  if (!timeStr) return 0;
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
  const { planA, planB, planC } = useTimetableStore();

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
          {tab === "A" && <TimelineView blocks={planA} label="📘 Plan A — Standard Day" planKey="A" checks={checkState.checked} onToggle={toggleCheck} />}
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
