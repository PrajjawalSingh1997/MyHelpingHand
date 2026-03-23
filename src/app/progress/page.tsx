"use client";
import { useTaskStore } from "@/store/task-store";
import { useUnifiedRentlyfStats } from "@/hooks/use-sync";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, AreaChart, Area } from "recharts";

export default function ProgressPage() {
  const days = useTaskStore((s) => s.days);
  const getCurrentDayNumber = useTaskStore((s) => s.getCurrentDayNumber);
  const currentDay = getCurrentDayNumber();
  const { totalHours: totalRentlyfHrs, weeklyHours: codingData } = useUnifiedRentlyfStats();

  // KPI calcs — only count tasks WITH postContent as "posts"
  const allTasks = days.flatMap((d) => d.tasks);
  const linkedinPosts = allTasks.filter((t) => t.category === "linkedin" && t.completed && t.postContent).length;
  const linkedinWork = allTasks.filter((t) => t.category === "linkedin" && t.completed && !t.postContent).length;
  const githubDone = allTasks.filter((t) => t.category === "github" && t.completed).length;
  const twitterPosts = allTasks.filter((t) => t.category === "twitter" && t.completed && t.postContent).length;
  const blogDone = allTasks.filter((t) => t.category === "blog" && t.completed).length;
  const freelanceDone = allTasks.filter((t) => t.category === "freelance" && t.completed).length;
  const totalCompleted = allTasks.filter((t) => t.completed).length;

  const kpis = [
    { label: "LinkedIn Posts", value: linkedinPosts, target: 50, color: "#3B82F6", extra: linkedinWork > 0 ? `+ ${linkedinWork} tasks` : "" },
    { label: "GitHub Activity", value: githubDone, target: 15, color: "#9CA3AF", extra: "" },
    { label: "Twitter Posts", value: twitterPosts, target: 15, color: "#22D3EE", extra: "" },
    { label: "Blog Posts", value: blogDone, target: 25, color: "#A78BFA", extra: "" },
    { label: "Freelance Tasks", value: freelanceDone, target: 30, color: "#FBBF24", extra: "" },
    { label: "Rentlyf Hours", value: totalRentlyfHrs, target: 450, color: "#34D399", extra: "" },
  ];

  // Daily completion chart data
  const completionData = days
    .filter((d) => d.dayNumber <= currentDay)
    .map((d) => {
      const done = d.tasks.filter((t) => t.completed || t.skipped).length;
      const total = d.tasks.length;
      return { day: d.dayNumber, completion: total > 0 ? Math.round((done / total) * 100) : 0 };
    });

  // Weekly posts by platform
  const weeklyData = Array.from({ length: 13 }, (_, i) => {
    const weekDays = days.filter((d) => d.weekNumber === i + 1);
    const weekTasks = weekDays.flatMap((d) => d.tasks);
    return {
      week: `W${i + 1}`,
      linkedin: weekTasks.filter((t) => t.category === "linkedin" && t.completed).length,
      twitter: weekTasks.filter((t) => t.category === "twitter" && t.completed).length,
      github: weekTasks.filter((t) => t.category === "github" && t.completed).length,
      blog: weekTasks.filter((t) => t.category === "blog" && t.completed).length,
    };
  });

  // Platform breakdown
  const categories = ["linkedin", "github", "twitter", "blog", "freelance", "rentlyf", "portfolio", "networking", "learning"];
  const platformTable = categories.map((cat) => {
    const total = allTasks.filter((t) => t.category === cat).length;
    const completed = allTasks.filter((t) => t.category === cat && t.completed).length;
    const skipped = allTasks.filter((t) => t.category === cat && t.skipped).length;
    return { category: cat, total, completed, skipped, pct: total > 0 ? Math.round((completed / total) * 100) : 0 };
  });

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">📊 Progress Dashboard</h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-3 gap-4">
        {kpis.map((kpi) => {
          const pct = Math.round((kpi.value / kpi.target) * 100);
          return (
            <div key={kpi.label} className="card">
              <p className="text-xs text-[#64748B]">{kpi.label}</p>
              <p className="mt-1 text-3xl font-bold text-white">{kpi.value}</p>
              <div className="mt-2 flex items-center justify-between text-xs text-[#64748B]">
                <span>Target: {kpi.target}</span>
                <span>{pct}%</span>
              </div>
              <div className="mt-1 h-1.5 w-full overflow-hidden rounded-full bg-[#2D2D3F]">
                <div className="h-full rounded-full transition-all" style={{ width: `${Math.min(pct, 100)}%`, backgroundColor: kpi.color }} />
              </div>
              {kpi.extra && <p className="mt-1 text-[10px] text-[#6C5CE7]">{kpi.extra}</p>}
            </div>
          );
        })}
      </div>

      {/* Charts Row */}
      <div className="grid grid-cols-2 gap-4">
        {/* Completion Over Time */}
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Daily Task Completion</h3>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={completionData}>
              <defs>
                <linearGradient id="compGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6C5CE7" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6C5CE7" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3F" />
              <XAxis dataKey="day" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "#14141F", border: "1px solid #2D2D3F", borderRadius: 8, fontSize: 12 }} />
              <Area type="monotone" dataKey="completion" stroke="#6C5CE7" fill="url(#compGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* Coding Hours */}
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Coding Hours by Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={codingData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3F" />
              <XAxis dataKey="week" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip contentStyle={{ background: "#14141F", border: "1px solid #2D2D3F", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="hours" fill="#34D399" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Platform Breakdown */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Platform Breakdown</h3>
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#2D2D3F] text-[#64748B]">
              <th className="py-2 text-left font-medium">Category</th>
              <th className="py-2 text-center font-medium">Total</th>
              <th className="py-2 text-center font-medium">Done</th>
              <th className="py-2 text-center font-medium">Skipped</th>
              <th className="py-2 text-right font-medium">Completion</th>
            </tr>
          </thead>
          <tbody>
            {platformTable.map((row) => (
              <tr key={row.category} className="border-b border-[#2D2D3F]/50">
                <td className="py-2 capitalize text-[#E2E8F0]">{row.category}</td>
                <td className="py-2 text-center text-[#64748B]">{row.total}</td>
                <td className="py-2 text-center text-[#00B894]">{row.completed}</td>
                <td className="py-2 text-center text-[#FDCB6E]">{row.skipped}</td>
                <td className="py-2 text-right">
                  <span className={`badge ${row.pct >= 80 ? "bg-[#00B894]/15 text-[#00B894]" : row.pct >= 50 ? "bg-[#FDCB6E]/15 text-[#FDCB6E]" : "bg-[#FF6B6B]/15 text-[#FF6B6B]"}`}>
                    {row.pct}%
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
