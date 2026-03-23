"use client";
import { useTaskStore } from "@/store/task-store";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import { ChevronLeft, ChevronRight, Copy, Check, SkipForward, Pencil, ArrowRight, X } from "lucide-react";
import { useState } from "react";
import { useSyncRentlyfHours, useSyncBlogStatus } from "@/hooks/use-sync";

const categoryLabels: Record<string, { label: string; emoji: string; color: string }> = {
  linkedin: { label: "LinkedIn", emoji: "📝", color: "bg-blue-500/15 text-blue-400" },
  github: { label: "GitHub", emoji: "🐙", color: "bg-gray-500/15 text-gray-300" },
  twitter: { label: "Twitter", emoji: "🐦", color: "bg-cyan-500/15 text-cyan-400" },
  freelance: { label: "Freelancing", emoji: "💼", color: "bg-amber-500/15 text-amber-400" },
  portfolio: { label: "Portfolio", emoji: "🎨", color: "bg-pink-500/15 text-pink-400" },
  blog: { label: "Blog", emoji: "✍️", color: "bg-purple-500/15 text-purple-400" },
  rentlyf: { label: "Rentlyf", emoji: "🏠", color: "bg-green-500/15 text-green-400" },
  learning: { label: "Learning", emoji: "📚", color: "bg-indigo-500/15 text-indigo-400" },
  networking: { label: "Networking", emoji: "📱", color: "bg-teal-500/15 text-teal-400" },
};

function TodayContent({ dayNumber }: { dayNumber: number }) {
  const days = useTaskStore((s) => s.days);
  const rawToggleTask = useTaskStore((s) => s.toggleTask);
  const skipTask = useTaskStore((s) => s.skipTask);
  const editTask = useTaskStore((s) => s.editTask);
  const postponeTask = useTaskStore((s) => s.postponeTask);
  const updateNotes = useTaskStore((s) => s.updateNotes);
  const syncRentlyfHours = useSyncRentlyfHours();
  const syncBlogToggle = useSyncBlogStatus();

  // Unified toggle: syncs blog tasks with Blog Manager
  const toggleTask = (dayNum: number, taskId: string) => {
    const day = days.find((d) => d.dayNumber === dayNum);
    const task = day?.tasks.find((t) => t.id === taskId);
    if (task?.category === "blog") {
      syncBlogToggle(dayNum, taskId);
    } else {
      rawToggleTask(dayNum, taskId);
    }
  };
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editContent, setEditContent] = useState("");
  const [editPostUrl, setEditPostUrl] = useState("");
  const [postponeId, setPostponeId] = useState<string | null>(null);
  const [postponeDay, setPostponeDay] = useState("");

  const day = days.find((d) => d.dayNumber === dayNumber);
  if (!day) return <p className="text-[#64748B]">Day not found.</p>;

  const done = day.tasks.filter((t) => t.completed).length;
  const total = day.tasks.length;
  const pct = total > 0 ? Math.round((done / total) * 100) : 0;

  // Group tasks by category
  const grouped: Record<string, typeof day.tasks> = {};
  day.tasks.forEach((t) => {
    if (!grouped[t.category]) grouped[t.category] = [];
    grouped[t.category].push(t);
  });

  const copyPost = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const startEditing = (taskId: string) => {
    const task = day.tasks.find((t) => t.id === taskId);
    if (!task) return;
    setEditingId(taskId);
    setEditTitle(task.title);
    setEditContent(task.postContent || "");
    setEditPostUrl(task.postUrl || "");
  };

  const saveEdit = () => {
    if (!editingId) return;
    editTask(day.dayNumber, editingId, {
      title: editTitle,
      postContent: editContent || undefined,
      postUrl: editPostUrl || undefined,
    });
    setEditingId(null);
  };

  const handlePostpone = () => {
    if (!postponeId || !postponeDay) return;
    const targetDay = parseInt(postponeDay);
    if (targetDay >= 1 && targetDay <= 90 && targetDay !== dayNumber) {
      postponeTask(dayNumber, postponeId, targetDay);
      setPostponeId(null);
      setPostponeDay("");
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="card">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748B]">{day.phase} · {day.weekLabel}</p>
            <h1 className="mt-1 text-3xl font-bold text-white">DAY {day.dayNumber}</h1>
            <p className="mt-1 text-sm text-[#64748B]">{format(parseISO(day.date), "EEEE, MMMM d, yyyy")}</p>
            <div className="mt-2 flex items-center gap-3">
              <span className={`badge ${day.planType === "A" ? "bg-blue-500/15 text-blue-400" : day.planType === "B" ? "bg-orange-500/15 text-orange-400" : "bg-green-500/15 text-green-400"}`}>
                Plan {day.planType}
              </span>
              <span className="text-sm text-[#64748B]">{done}/{total} completed</span>
            </div>
          </div>
          <div className="relative h-24 w-24">
            <svg className="h-24 w-24 -rotate-90" viewBox="0 0 36 36">
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#2D2D3F" strokeWidth="3" />
              <path d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831" fill="none" stroke="#6C5CE7" strokeWidth="3" strokeDasharray={`${pct}, 100`} strokeLinecap="round" />
            </svg>
            <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-white">{pct}%</span>
          </div>
        </div>
      </div>

      {/* Postpone Modal */}
      {postponeId && (
        <div className="card border-[#FDCB6E]/30 bg-[#FDCB6E]/5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ArrowRight className="h-5 w-5 text-[#FDCB6E]" />
              <span className="text-sm font-medium text-[#E2E8F0]">Postpone task to day:</span>
              <input
                type="number"
                min={1}
                max={90}
                value={postponeDay}
                onChange={(e) => setPostponeDay(e.target.value)}
                placeholder="Day #"
                className="w-20 rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-1.5 text-sm text-white focus:border-[#FDCB6E] focus:outline-none"
              />
            </div>
            <div className="flex gap-2">
              <button onClick={handlePostpone} className="rounded-lg bg-[#FDCB6E] px-3 py-1.5 text-xs font-medium text-black hover:bg-[#f0c050]">Move</button>
              <button onClick={() => { setPostponeId(null); setPostponeDay(""); }} className="text-[#64748B] hover:text-white"><X className="h-4 w-4" /></button>
            </div>
          </div>
        </div>
      )}

      {/* Task Groups */}
      {Object.entries(grouped).map(([cat, tasks]) => {
        const meta = categoryLabels[cat] || { label: cat, emoji: "📌", color: "bg-gray-500/15 text-gray-300" };
        return (
          <div key={cat} className="card">
            <div className="mb-3 flex items-center gap-2">
              <span className="text-lg">{meta.emoji}</span>
              <h3 className="text-sm font-semibold text-[#E2E8F0]">{meta.label}</h3>
              <span className={`badge text-[10px] ${meta.color}`}>
                {tasks.filter((t) => t.completed).length}/{tasks.length}
              </span>
            </div>
            <ul className="space-y-2">
              {tasks.map((task) => (
                <li key={task.id} className="group">
                  {/* Edit mode */}
                  {editingId === task.id ? (
                    <div className="space-y-3 rounded-lg bg-[#0A0A0F] p-4">
                      <div>
                        <label className="text-[10px] text-[#64748B]">Task Title</label>
                        <input
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-2 text-sm text-white focus:border-[#6C5CE7] focus:outline-none"
                        />
                      </div>
                      {(task.postContent || task.category === "linkedin" || task.category === "twitter") && (
                        <div>
                          <label className="text-[10px] text-[#64748B]">Post Content (editable)</label>
                          <textarea
                            value={editContent}
                            onChange={(e) => setEditContent(e.target.value)}
                            rows={8}
                            className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] p-3 text-sm text-[#E2E8F0] focus:border-[#6C5CE7] focus:outline-none"
                          />
                          <p className="mt-1 text-[10px] text-[#64748B]">{editContent.length} characters</p>
                        </div>
                      )}
                      <div>
                        <label className="text-[10px] text-[#64748B]">Post URL (where you uploaded it)</label>
                        <input
                          value={editPostUrl}
                          onChange={(e) => setEditPostUrl(e.target.value)}
                          placeholder="https://linkedin.com/posts/..."
                          className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#14141F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none"
                        />
                      </div>
                      <div className="flex gap-2">
                        <button onClick={saveEdit} className="rounded-lg bg-[#00B894] px-4 py-2 text-xs text-white hover:bg-[#00A381]">💾 Save Changes</button>
                        <button onClick={() => setEditingId(null)} className="rounded-lg bg-[#2D2D3F] px-4 py-2 text-xs text-[#64748B] hover:text-white">Cancel</button>
                      </div>
                    </div>
                  ) : (
                    /* Normal display mode */
                    <div className="flex items-start gap-3 rounded-lg p-2 transition-all hover:bg-[#1E1E2E]">
                      <button
                        onClick={() => toggleTask(day.dayNumber, task.id)}
                        className={`mt-0.5 flex-shrink-0 transition-all ${task.completed ? "text-[#00B894]" : task.skipped ? "text-[#FDCB6E]" : "text-[#64748B] hover:text-[#6C5CE7]"}`}
                      >
                        {task.completed ? <Check className="h-5 w-5" /> : <div className="h-5 w-5 rounded border-2 border-current" />}
                      </button>
                      <div className="flex-1">
                        <p className={`text-sm ${task.completed ? "text-[#64748B] line-through" : task.skipped ? "text-[#FDCB6E]" : "text-[#E2E8F0]"}`}>
                          {task.title}
                        </p>
                        {task.timeBlock && <p className="mt-0.5 text-[10px] text-[#64748B]">⏰ {task.timeBlock}</p>}
                        {task.notes && <p className="mt-0.5 text-[10px] text-[#FDCB6E]">{task.notes}</p>}
                        {task.postUrl && (
                          <a href={task.postUrl} target="_blank" rel="noopener noreferrer" className="mt-0.5 block text-[10px] text-[#6C5CE7] hover:underline">
                            🔗 {task.postUrl}
                          </a>
                        )}
                        {/* Post content preview */}
                        {task.postContent && (
                          <div className="mt-2 rounded-lg bg-[#0A0A0F] p-3">
                            <pre className="max-h-24 overflow-hidden whitespace-pre-wrap text-xs text-[#64748B]">
                              {task.postContent.slice(0, 200)}...
                            </pre>
                            <div className="mt-2 flex gap-2">
                              <button
                                onClick={() => copyPost(task.id, task.postContent!)}
                                className="flex items-center gap-1 rounded-md bg-[#6C5CE7]/15 px-2 py-1 text-[10px] font-medium text-[#6C5CE7] transition-all hover:bg-[#6C5CE7]/25"
                              >
                                {copiedId === task.id ? <><Check className="h-3 w-3" /> Copied!</> : <><Copy className="h-3 w-3" /> Copy Post</>}
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                      {/* Action buttons */}
                      <div className="flex flex-shrink-0 items-center gap-1 opacity-0 transition-all group-hover:opacity-100">
                        <button onClick={() => startEditing(task.id)} className="rounded p-1 text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#6C5CE7]" title="Edit task">
                          <Pencil className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => { setPostponeId(task.id); setPostponeDay(""); }} className="rounded p-1 text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#FDCB6E]" title="Postpone task">
                          <ArrowRight className="h-3.5 w-3.5" />
                        </button>
                        <button onClick={() => skipTask(day.dayNumber, task.id)} className="rounded p-1 text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#FDCB6E]" title="Skip task">
                          <SkipForward className="h-3.5 w-3.5" />
                        </button>
                      </div>
                    </div>
                  )}
                </li>
              ))}
            </ul>
          </div>
        );
      })}

      {/* Rentlyf Hours */}
      <div className="card">
        <h3 className="mb-2 text-sm font-semibold text-[#E2E8F0]">🏠 Rentlyf Hours Today</h3>
        <input
          type="number"
          min={0}
          max={12}
          value={day.rentlyfHours}
          onChange={(e) => syncRentlyfHours(day.dayNumber, Number(e.target.value))}
          className="w-20 rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-1.5 text-sm text-white focus:border-[#6C5CE7] focus:outline-none"
        />
        <span className="ml-2 text-xs text-[#64748B]">hours (synced with Rentlyf Log)</span>
      </div>

      {/* Notes */}
      <div className="card">
        <h3 className="mb-2 text-sm font-semibold text-[#E2E8F0]">📝 Notes</h3>
        <textarea
          value={day.dailyNotes}
          onChange={(e) => updateNotes(day.dayNumber, e.target.value)}
          placeholder="Jot down anything for today..."
          className="w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] p-3 text-sm text-[#E2E8F0] placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none"
          rows={3}
        />
      </div>

      {/* Navigation */}
      <div className="flex items-center justify-between">
        {dayNumber > 1 ? (
          <Link href={`/day/${dayNumber - 1}`} className="flex items-center gap-1 text-sm text-[#6C5CE7] hover:underline">
            <ChevronLeft className="h-4 w-4" /> Day {dayNumber - 1}
          </Link>
        ) : <div />}
        {dayNumber < 90 ? (
          <Link href={`/day/${dayNumber + 1}`} className="flex items-center gap-1 text-sm text-[#6C5CE7] hover:underline">
            Day {dayNumber + 1} <ChevronRight className="h-4 w-4" />
          </Link>
        ) : <div />}
      </div>
    </div>
  );
}

export default function TodayPage() {
  const getCurrentDayNumber = useTaskStore((s) => s.getCurrentDayNumber);
  const currentDay = getCurrentDayNumber();
  return <TodayContent dayNumber={currentDay} />;
}

export { TodayContent };
