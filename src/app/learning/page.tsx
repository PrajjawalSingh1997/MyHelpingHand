"use client";
import { useLearningStore } from "@/store/stores";
import { LearningStatus } from "@/lib/types";

const statusColors: Record<LearningStatus, string> = {
  not_started: "bg-[#2D2D3F] text-[#64748B]",
  in_progress: "bg-[#FDCB6E]/15 text-[#FDCB6E]",
  completed: "bg-[#00B894]/15 text-[#00B894]",
};

const statusLabels: Record<LearningStatus, string> = {
  not_started: "Not Started",
  in_progress: "In Progress",
  completed: "Completed",
};

const nextStatus = (s: LearningStatus): LearningStatus => {
  if (s === "not_started") return "in_progress";
  if (s === "in_progress") return "completed";
  return "not_started";
};

const catColors: Record<string, string> = {
  Portfolio: "bg-pink-500/15 text-pink-400",
  Marketing: "bg-amber-500/15 text-amber-400",
  Business: "bg-emerald-500/15 text-emerald-400",
  Career: "bg-blue-500/15 text-blue-400",
  Technical: "bg-purple-500/15 text-purple-400",
};

export default function LearningPage() {
  const { topics, updateTopic } = useLearningStore();

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📚 Learning Tracker</h1>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{topics.filter((t) => t.status === "completed").length}</p>
          <p className="text-xs text-[#64748B]">Completed</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#FDCB6E]">{topics.filter((t) => t.status === "in_progress").length}</p>
          <p className="text-xs text-[#64748B]">In Progress</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#6C5CE7]">{topics.reduce((s, t) => s + t.hoursSpent, 0)}</p>
          <p className="text-xs text-[#64748B]">Total Hours</p>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-2 gap-4">
        {topics.map((topic) => (
          <div key={topic.id} className="card">
            <div className="flex items-center justify-between">
              <span className={`badge text-[10px] ${catColors[topic.category] || "bg-[#2D2D3F] text-[#64748B]"}`}>
                {topic.category}
              </span>
              <button
                onClick={() => updateTopic(topic.id, { status: nextStatus(topic.status) })}
                className={`badge cursor-pointer text-[10px] ${statusColors[topic.status]}`}
              >
                {statusLabels[topic.status]}
              </button>
            </div>
            <h3 className="mt-3 text-sm font-semibold text-[#E2E8F0]">{topic.title}</h3>
            <p className="mt-1 text-xs text-[#64748B]">{topic.notes}</p>

            {/* Hours */}
            <div className="mt-3 flex items-center gap-2">
              <span className="text-xs text-[#64748B]">Hours:</span>
              <input
                type="number"
                min={0}
                value={topic.hoursSpent}
                onChange={(e) => updateTopic(topic.id, { hoursSpent: Number(e.target.value) })}
                className="w-16 rounded border border-[#2D2D3F] bg-[#0A0A0F] px-2 py-1 text-center text-xs text-white focus:border-[#6C5CE7] focus:outline-none"
              />
            </div>

            {/* Resources */}
            {topic.resources.length > 0 && (
              <div className="mt-3">
                <p className="text-[10px] text-[#64748B]">Resources:</p>
                <div className="mt-1 flex flex-wrap gap-1">
                  {topic.resources.map((r, i) => (
                    <a key={i} href={r} target="_blank" rel="noopener noreferrer" className="badge bg-[#6C5CE7]/10 text-[10px] text-[#6C5CE7] hover:bg-[#6C5CE7]/20">
                      {new URL(r).hostname}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
