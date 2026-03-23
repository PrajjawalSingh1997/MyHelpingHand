"use client";
import { useGoalsStore } from "@/store/stores";
import { useTaskStore } from "@/store/task-store";
import { useBlogStore, useFreelanceStore, useRentlyfStore } from "@/store/stores";
import { useUnifiedRentlyfStats } from "@/hooks/use-sync";
import { useState, useMemo } from "react";
import { RefreshCw } from "lucide-react";

export default function GoalsPage() {
  const { month1, month2, month3, updateMetric } = useGoalsStore();
  const days = useTaskStore((s) => s.days);
  const blogs = useBlogStore((s) => s.blogs);
  const proposals = useFreelanceStore((s) => s.proposals);
  const projects = useFreelanceStore((s) => s.projects);
  const { totalHours } = useUnifiedRentlyfStats();
  const [tab, setTab] = useState<1 | 2 | 3>(1);

  // Auto-compute actuals from real data
  const allTasks = days.flatMap((d) => d.tasks);
  const month1Days = days.filter((d) => d.dayNumber <= 30);
  const month2Days = days.filter((d) => d.dayNumber <= 60);
  const month3Days = days.filter((d) => d.dayNumber <= 90);

  const computedActuals = useMemo(() => {
    const m1Tasks = month1Days.flatMap((d) => d.tasks);
    const m2Tasks = month2Days.flatMap((d) => d.tasks);
    const m1Hrs = month1Days.reduce((s, d) => s + d.rentlyfHours, 0);
    const publishedBlogs = blogs.filter((b) => b.status === "published").length;
    const totalProposals = proposals.length;
    const totalClients = projects.length;

    return {
      // Month 1 auto-values (matched by metric name)
      "LinkedIn Posts_1": String(m1Tasks.filter((t) => t.category === "linkedin" && t.completed && t.postContent).length),
      "GitHub Repos_1": String(m1Tasks.filter((t) => t.category === "github" && t.completed).length),
      "Twitter Posts_1": String(m1Tasks.filter((t) => t.category === "twitter" && t.completed && t.postContent).length),
      "Blog Posts_1": String(blogs.filter((b) => b.status === "published" && b.scheduledDay <= 30).length),
      "Freelance Profiles Created_1": String(m1Tasks.filter((t) => t.category === "freelance" && t.completed).length),
      "Upwork Proposals Sent_1": String(totalProposals),
      "Freelance Clients_1": String(totalClients),
      "Rentlyf Coding Hours_1": `${m1Hrs} hrs`,

      // Month 2 auto-values (cumulative)
      "LinkedIn Posts_2": String(m2Tasks.filter((t) => t.category === "linkedin" && t.completed && t.postContent).length),
      "GitHub Repos (Total)_2": String(m2Tasks.filter((t) => t.category === "github" && t.completed).length),
      "Blog Posts (Total)_2": String(publishedBlogs),
      "Freelance Proposals (Total)_2": String(totalProposals),
      "Freelance Clients_2": String(totalClients),

      // Month 3 auto-values (cumulative)
      "LinkedIn Posts_3": String(allTasks.filter((t) => t.category === "linkedin" && t.completed && t.postContent).length),
      "LinkedIn Connections (Total)_3": "", // Can't auto-compute this
      "Blog Posts (Total)_3": String(publishedBlogs),
      "Freelance Clients (Total)_3": String(totalClients),
      "GitHub Repos (Total)_3": String(allTasks.filter((t) => t.category === "github" && t.completed).length),
    };
  }, [days, blogs, proposals, projects]);

  const months = { 1: month1, 2: month2, 3: month3 };
  const monthLabels = { 1: "Month 1: The Origin Story", 2: "Month 2: The Builder", 3: "Month 3: The Authority" };
  const currentMetrics = months[tab];

  const getStatusColor = (status: string) => {
    switch (status) {
      case "green": return "bg-[#00B894]/15 text-[#00B894]";
      case "yellow": return "bg-[#FDCB6E]/15 text-[#FDCB6E]";
      case "red": return "bg-[#FF6B6B]/15 text-[#FF6B6B]";
      default: return "bg-[#2D2D3F] text-[#64748B]";
    }
  };

  const autoFillActuals = () => {
    currentMetrics.forEach((metric, i) => {
      const key = `${metric.name}_${tab}`;
      const autoValue = computedActuals[key as keyof typeof computedActuals];
      if (autoValue && autoValue !== "" && metric.actual === "") {
        updateMetric(tab, i, { actual: autoValue });
      }
    });
  };

  // Auto-status calculation
  const getAutoStatus = (metric: { target: string; actual: string }): "green" | "yellow" | "red" | "none" => {
    if (!metric.actual || metric.actual === "" || metric.actual === "—") return "none";
    const targetNum = parseFloat(metric.target.replace(/[^0-9.]/g, ""));
    const actualNum = parseFloat(metric.actual.replace(/[^0-9.]/g, ""));
    if (isNaN(targetNum) || isNaN(actualNum)) {
      // For non-numeric (✅, LIVE, etc.)
      if (metric.actual === "✅" || metric.actual.toLowerCase() === "live" || metric.actual.toLowerCase() === "yes" || metric.actual.toLowerCase() === "done") return "green";
      return "none";
    }
    const pct = (actualNum / targetNum) * 100;
    if (pct >= 80) return "green";
    if (pct >= 50) return "yellow";
    return "red";
  };

  const autoFillStatuses = () => {
    currentMetrics.forEach((metric, i) => {
      if (metric.actual && metric.status === "none") {
        const autoStatus = getAutoStatus(metric);
        if (autoStatus !== "none") updateMetric(tab, i, { status: autoStatus });
      }
    });
  };

  // Compute current month summary
  const greenCount = currentMetrics.filter((m) => m.status === "green").length;
  const yellowCount = currentMetrics.filter((m) => m.status === "yellow").length;
  const redCount = currentMetrics.filter((m) => m.status === "red").length;
  const filledCount = currentMetrics.filter((m) => m.actual !== "").length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-white">🎯 Goals & Score Cards</h1>
        <div className="flex gap-2">
          <button onClick={autoFillActuals} className="flex items-center gap-1 rounded-lg bg-[#6C5CE7]/15 px-3 py-1.5 text-xs text-[#6C5CE7] transition-all hover:bg-[#6C5CE7]/25">
            <RefreshCw className="h-3 w-3" /> Sync Actuals
          </button>
          <button onClick={autoFillStatuses} className="flex items-center gap-1 rounded-lg bg-[#00B894]/15 px-3 py-1.5 text-xs text-[#00B894] transition-all hover:bg-[#00B894]/25">
            Auto Status
          </button>
        </div>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#00B894]">{greenCount}</p>
          <p className="text-xs text-[#64748B]">🟢 On Track</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#FDCB6E]">{yellowCount}</p>
          <p className="text-xs text-[#64748B]">🟡 Needs Work</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#FF6B6B]">{redCount}</p>
          <p className="text-xs text-[#64748B]">🔴 Behind</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{filledCount}/{currentMetrics.length}</p>
          <p className="text-xs text-[#64748B]">Tracked</p>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex rounded-lg border border-[#2D2D3F] bg-[#14141F]">
        {([1, 2, 3] as const).map((m) => (
          <button key={m} onClick={() => setTab(m)} className={`flex-1 px-4 py-2 text-sm transition-all ${tab === m ? "bg-[#6C5CE7] text-white" : "text-[#64748B] hover:text-white"}`}>
            Month {m}
          </button>
        ))}
      </div>

      {/* Score Card */}
      <div className="card">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-[#E2E8F0]">{monthLabels[tab]}</h3>
          <p className="text-[10px] text-[#64748B]">💡 Click "Sync Actuals" to auto-fill from your task data</p>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2D2D3F] text-[#64748B]">
              <th className="py-2 text-left font-medium">Metric</th>
              <th className="py-2 text-center font-medium">Target</th>
              <th className="py-2 text-center font-medium">Actual</th>
              <th className="py-2 text-center font-medium">Auto</th>
              <th className="py-2 text-center font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {currentMetrics.map((metric, i) => {
              const key = `${metric.name}_${tab}`;
              const autoValue = computedActuals[key as keyof typeof computedActuals];
              return (
                <tr key={metric.name} className="border-b border-[#2D2D3F]/50">
                  <td className="py-3 text-[#E2E8F0]">{metric.name}</td>
                  <td className="py-3 text-center text-[#6C5CE7] font-medium">{metric.target}</td>
                  <td className="py-3 text-center">
                    <input
                      type="text"
                      value={metric.actual}
                      onChange={(e) => updateMetric(tab, i, { actual: e.target.value })}
                      placeholder="—"
                      className="w-24 rounded border border-[#2D2D3F] bg-[#0A0A0F] px-2 py-1 text-center text-sm text-white focus:border-[#6C5CE7] focus:outline-none"
                    />
                  </td>
                  <td className="py-3 text-center">
                    {autoValue ? (
                      <button
                        onClick={() => updateMetric(tab, i, { actual: autoValue })}
                        className="rounded bg-[#6C5CE7]/10 px-2 py-0.5 text-[10px] text-[#6C5CE7] hover:bg-[#6C5CE7]/20"
                        title="Click to use this value"
                      >
                        {autoValue}
                      </button>
                    ) : (
                      <span className="text-[10px] text-[#64748B]">manual</span>
                    )}
                  </td>
                  <td className="py-3 text-center">
                    <select
                      value={metric.status}
                      onChange={(e) => updateMetric(tab, i, { status: e.target.value as "green" | "yellow" | "red" | "none" })}
                      className={`badge cursor-pointer border-0 text-[10px] ${getStatusColor(metric.status)}`}
                    >
                      <option value="none">—</option>
                      <option value="green">🟢 On Track</option>
                      <option value="yellow">🟡 Needs Work</option>
                      <option value="red">🔴 Behind</option>
                    </select>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Overall 90-Day Card */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Overall 90-Day Progress</h3>
        <div className="grid grid-cols-5 gap-4 text-center">
          {[
            { label: "LinkedIn Posts", computed: String(allTasks.filter((t) => t.category === "linkedin" && t.completed && t.postContent).length), targets: ["18", "34", "50"] },
            { label: "GitHub Tasks", computed: String(allTasks.filter((t) => t.category === "github" && t.completed).length), targets: ["4+", "6+", "6+"] },
            { label: "Blog Posts", computed: String(blogs.filter((b) => b.status === "published").length), targets: ["5+", "12+", "18+"] },
            { label: "Rentlyf Hours", computed: `${totalHours}`, targets: ["~150", "~300", "~450"] },
            { label: "Freelance Clients", computed: String(projects.length), targets: ["0-1", "1-2", "3-5"] },
          ].map((row) => (
            <div key={row.label} className="rounded-lg bg-[#0A0A0F] p-3">
              <p className="text-[10px] text-[#64748B]">{row.label}</p>
              <p className="mt-1 text-lg font-bold text-white">{row.computed}</p>
              <div className="mt-2 space-y-0.5">
                {row.targets.map((t, i) => (
                  <p key={i} className="text-[10px] text-[#64748B]">M{i + 1}: <span className="text-[#6C5CE7]">{t}</span></p>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
