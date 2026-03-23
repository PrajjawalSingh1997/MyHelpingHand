"use client";
import { useSettingsStore, useBlogStore, useLearningStore, useGoalsStore, useFreelanceStore, useRentlyfStore } from "@/store/stores";
import { useTaskStore } from "@/store/task-store";
import { exportAllData, importAllData } from "@/lib/storage";
import { generateReadableExport } from "@/lib/export";
import { useState } from "react";
import { Download, Upload, Trash2, AlertTriangle, FileText, FileJson } from "lucide-react";

export default function SettingsPage() {
  const { settings, updateSettings } = useSettingsStore();
  const days = useTaskStore((s) => s.days);
  const resetTasks = useTaskStore((s) => s.resetAll);
  const blogs = useBlogStore((s) => s.blogs);
  const resetBlogs = useBlogStore((s) => s.resetBlogs);
  const topics = useLearningStore((s) => s.topics);
  const resetLearning = useLearningStore((s) => s.resetTopics);
  const { month1, month2, month3 } = useGoalsStore();
  const resetGoals = useGoalsStore((s) => s.resetGoals);
  const proposals = useFreelanceStore((s) => s.proposals);
  const projects = useFreelanceStore((s) => s.projects);
  const rentlyfLogs = useRentlyfStore((s) => s.logs);
  const [showReset, setShowReset] = useState(false);
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleExportMarkdown = () => {
    const md = generateReadableExport(days, blogs, proposals, projects, rentlyfLogs, { month1, month2, month3 }, topics, settings);
    const blob = new Blob([md], { type: "text/markdown" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growth-tracker-report-${new Date().toISOString().split("T")[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleExportJSON = () => {
    const data = exportAllData();
    const blob = new Blob([data], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `growth-tracker-backup-${new Date().toISOString().split("T")[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      try {
        importAllData(ev.target?.result as string);
        setImportStatus("Import successful! Refresh the page to see changes.");
      } catch {
        setImportStatus("Import failed. Invalid JSON file.");
      }
    };
    reader.readAsText(file);
  };

  const handleResetAll = () => {
    resetTasks();
    resetBlogs();
    resetLearning();
    resetGoals();
    setShowReset(false);
  };

  return (
    <div className="space-y-6">
      <h1 className="text-2xl font-bold text-white">⚙️ Settings</h1>

      {/* Profile */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-[#E2E8F0]">Profile</h3>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="text-xs text-[#64748B]">Name</label>
            <input
              value={settings.name}
              onChange={(e) => updateSettings({ name: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
          <div>
            <label className="text-xs text-[#64748B]">Start Date</label>
            <input
              type="date"
              value={settings.startDate}
              onChange={(e) => updateSettings({ startDate: e.target.value })}
              className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white focus:border-[#6C5CE7] focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Social Links */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-[#E2E8F0]">Social Links</h3>
        <div className="grid grid-cols-2 gap-4">
          {(["linkedin", "github", "twitter", "portfolio"] as const).map((key) => (
            <div key={key}>
              <label className="text-xs capitalize text-[#64748B]">{key}</label>
              <input
                value={settings.socialLinks[key] || ""}
                onChange={(e) => updateSettings({ socialLinks: { ...settings.socialLinks, [key]: e.target.value } })}
                placeholder={`Your ${key} URL`}
                className="mt-1 w-full rounded-lg border border-[#2D2D3F] bg-[#0A0A0F] px-3 py-2 text-sm text-white placeholder:text-[#64748B]/50 focus:border-[#6C5CE7] focus:outline-none"
              />
            </div>
          ))}
        </div>
      </div>

      {/* Data Management */}
      <div className="card">
        <h3 className="mb-4 text-sm font-semibold text-[#E2E8F0]">Data Management</h3>
        <div className="flex flex-wrap gap-3">
          <button onClick={handleExportMarkdown} className="flex items-center gap-2 rounded-lg bg-[#6C5CE7] px-4 py-2 text-sm text-white hover:bg-[#5A4BD1]">
            <FileText className="h-4 w-4" /> Export Report (Markdown)
          </button>
          <button onClick={handleExportJSON} className="flex items-center gap-2 rounded-lg bg-[#1E1E2E] px-4 py-2 text-sm text-[#E2E8F0] hover:bg-[#2D2D3F]">
            <FileJson className="h-4 w-4" /> Export Backup (JSON)
          </button>
          <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-[#1E1E2E] px-4 py-2 text-sm text-[#E2E8F0] transition-all hover:bg-[#2D2D3F]">
            <Upload className="h-4 w-4" /> Import Data
            <input type="file" accept=".json" onChange={handleImport} className="hidden" />
          </label>
          <button onClick={() => setShowReset(true)} className="flex items-center gap-2 rounded-lg bg-[#FF6B6B]/15 px-4 py-2 text-sm text-[#FF6B6B] transition-all hover:bg-[#FF6B6B]/25">
            <Trash2 className="h-4 w-4" /> Reset All Data
          </button>
        </div>
        <p className="mt-3 text-xs text-[#64748B]">
          📄 <strong>Markdown export</strong> — Human-readable report with stats, day-by-day progress, all posts, blog table, goals, and learning progress.<br />
          📦 <strong>JSON export</strong> — Raw backup file for importing back into the app.
        </p>

        {importStatus && <p className="mt-2 text-xs text-[#00B894]">{importStatus}</p>}

        {showReset && (
          <div className="mt-4 rounded-lg border border-[#FF6B6B]/30 bg-[#FF6B6B]/5 p-4">
            <div className="flex items-center gap-2 text-[#FF6B6B]">
              <AlertTriangle className="h-5 w-5" />
              <p className="text-sm font-semibold">This will delete ALL your data!</p>
            </div>
            <p className="mt-1 text-xs text-[#64748B]">Task completions, notes, freelance data, blog progress — everything will be reset to defaults.</p>
            <div className="mt-3 flex gap-3">
              <button onClick={handleResetAll} className="rounded-lg bg-[#FF6B6B] px-4 py-2 text-sm text-white hover:bg-[#FF4040]">Yes, Reset Everything</button>
              <button onClick={() => setShowReset(false)} className="rounded-lg bg-[#2D2D3F] px-4 py-2 text-sm text-[#64748B] hover:text-white">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Info */}
      <div className="card">
        <h3 className="mb-2 text-sm font-semibold text-[#E2E8F0]">About</h3>
        <p className="text-xs text-[#64748B]">Growth Tracker v1.0 — Built as part of the 90-Day Developer Growth Engine.</p>
        <p className="text-xs text-[#64748B]">All data is stored locally in your browser (localStorage).</p>
      </div>
    </div>
  );
}
