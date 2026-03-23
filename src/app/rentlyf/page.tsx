"use client";
import { useRentlyfStore } from "@/store/stores";
import { useTaskStore } from "@/store/task-store";
import { useSyncRentlyfLogToDay, useUnifiedRentlyfStats } from "@/hooks/use-sync";
import { useState } from "react";
import { Plus } from "lucide-react";
import { RentlyfCategory } from "@/lib/types";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from "recharts";

const PIE_COLORS = ["#6C5CE7", "#00B894", "#FF6B6B", "#FDCB6E"];

export default function RentlyfPage() {
  const { logs, addLog } = useRentlyfStore();
  const days = useTaskStore((s) => s.days);
  const recalcDayHours = useSyncRentlyfLogToDay();
  const { totalHours, weeklyHours, byCategory } = useUnifiedRentlyfStats();
  const [showForm, setShowForm] = useState(false);

  const thisWeekLogs = logs.filter((l) => {
    const d = new Date(l.date);
    const now = new Date();
    const diff = (now.getTime() - d.getTime()) / (1000 * 60 * 60 * 24);
    return diff <= 7;
  });
  const weekHours = thisWeekLogs.reduce((s, l) => s + l.hours, 0);

  // Category pie data
  const pieData = Object.entries(byCategory).map(([name, value]) => ({ name, value }));

  const handleAdd = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    const date = fd.get("date") as string;

    addLog({
      id: `r${Date.now()}`,
      date,
      hours: Number(fd.get("hours")),
      category: fd.get("category") as RentlyfCategory,
      notes: fd.get("notes") as string,
    });

    // Sync: recalculate the day's total hours from all logs
    setTimeout(() => recalcDayHours(date), 50);

    setShowForm(false);
  };

  const catColors: Record<string, string> = {
    dashboard: "bg-blue-500/15 text-blue-400",
    testing: "bg-green-500/15 text-green-400",
    bugfix: "bg-red-500/15 text-red-400",
    backend: "bg-purple-500/15 text-purple-400",
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">🏠 Rentlyf Work Log</h1>
      <p className="text-xs text-[#64748B]">Hours logged here sync with Today View and Progress Dashboard.</p>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card text-center">
          <p className="text-2xl font-bold text-white">{totalHours}</p>
          <p className="text-xs text-[#64748B]">Total Hours</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#00B894]">{weekHours}</p>
          <p className="text-xs text-[#64748B]">This Week</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#6C5CE7]">{logs.length > 0 ? (totalHours / logs.length).toFixed(1) : 0}</p>
          <p className="text-xs text-[#64748B]">Avg per Entry</p>
        </div>
        <div className="card text-center">
          <p className="text-2xl font-bold text-[#FDCB6E]">{logs.length}</p>
          <p className="text-xs text-[#64748B]">Log Entries</p>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-2 gap-4">
        {/* Weekly Hours Bar Chart */}
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Coding Hours by Week</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={weeklyHours}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D3F" />
              <XAxis dataKey="week" stroke="#64748B" fontSize={10} />
              <YAxis stroke="#64748B" fontSize={10} />
              <Tooltip contentStyle={{ background: "#14141F", border: "1px solid #2D2D3F", borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="hours" fill="#6C5CE7" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Pie Chart */}
        {pieData.length > 0 && (
          <div className="card">
            <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Hours by Category</h3>
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={70} label={({ name, value }) => `${name}: ${value}h`}>
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: "#14141F", border: "1px solid #2D2D3F", borderRadius: 8, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}
      </div>

      {/* Add Entry */}
      <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm text-white hover:bg-[#5A4BD1]">
        <Plus className="h-4 w-4" /> Log Hours
      </button>

      {showForm && (
        <form onSubmit={handleAdd} className="card space-y-3">
          <div className="grid grid-cols-3 gap-3">
            <input name="date" type="date" defaultValue={new Date().toISOString().split("T")[0]} className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white" />
            <input name="hours" type="number" min={0} max={12} step={0.5} placeholder="Hours" required className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]" />
            <select name="category" className="rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white">
              <option value="dashboard">Dashboard</option>
              <option value="testing">Testing</option>
              <option value="bugfix">Bug Fix</option>
              <option value="backend">Backend</option>
            </select>
          </div>
          <input name="notes" placeholder="What did you work on?" className="w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]" />
          <button type="submit" className="rounded-lg bg-[#00B894] px-4 py-2 text-sm text-white hover:bg-[#00A381]">Save</button>
        </form>
      )}

      {/* Log Entries */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Work Log</h3>
        <div className="space-y-2">
          {[...logs].reverse().map((log) => (
            <div key={log.id} className="flex items-center justify-between rounded-lg bg-[#0A0A0F] p-3">
              <div>
                <p className="text-sm text-[#E2E8F0]">{log.notes || "No notes"}</p>
                <p className="text-[10px] text-[#64748B]">{log.date}</p>
              </div>
              <div className="flex items-center gap-2">
                <span className={`badge text-[10px] ${catColors[log.category] || ""}`}>{log.category}</span>
                <span className="text-sm font-bold text-[#6C5CE7]">{log.hours}h</span>
              </div>
            </div>
          ))}
          {logs.length === 0 && <p className="py-4 text-center text-xs text-[#64748B]">No entries yet. Log hours here or from the Today View — they sync automatically.</p>}
        </div>
      </div>
    </div>
  );
}
