"use client";
import { useTaskStore } from "@/store/task-store";
import { format, parseISO } from "date-fns";
import Link from "next/link";
import {
  Flame,
  Linkedin,
  Github,
  Twitter,
  DollarSign,
  ChevronRight,
  CheckCircle2,
  Circle,
  SkipForward,
} from "lucide-react";

const categoryIcons: Record<string, string> = {
  linkedin: "📝",
  github: "🐙",
  twitter: "🐦",
  freelance: "💼",
  portfolio: "🎨",
  blog: "✍️",
  rentlyf: "🏠",
  learning: "📚",
  networking: "📱",
};

export default function DashboardPage() {
  const days = useTaskStore((s) => s.days);
  const getCurrentDayNumber = useTaskStore((s) => s.getCurrentDayNumber);
  const getStreak = useTaskStore((s) => s.getStreak);

  const currentDay = getCurrentDayNumber();
  const streak = getStreak();
  const todayPlan = days.find((d) => d.dayNumber === currentDay);

  // Stats — only count tasks WITH postContent as "posts", otherwise they're just LinkedIn work
  const allTasks = days.flatMap((d) => d.tasks);
  const linkedinPosts = allTasks.filter((t) => t.category === "linkedin" && t.completed && t.postContent).length;
  const linkedinWork = allTasks.filter((t) => t.category === "linkedin" && t.completed && !t.postContent).length;
  const totalGithub = allTasks.filter((t) => t.category === "github" && t.completed).length;
  const twitterPosts = allTasks.filter((t) => t.category === "twitter" && t.completed && t.postContent).length;

  const todayTasks = todayPlan?.tasks || [];
  const completedToday = todayTasks.filter((t) => t.completed).length;
  const totalToday = todayTasks.length;
  const completionPct = totalToday > 0 ? Math.round((completedToday / totalToday) * 100) : 0;

  // Week days
  const weekStart = Math.floor((currentDay - 1) / 7) * 7 + 1;
  const weekDays = days.slice(weekStart - 1, weekStart + 6);

  // Upcoming uncompleted tasks
  const upcoming = days
    .filter((d) => d.dayNumber >= currentDay)
    .flatMap((d) => d.tasks.filter((t) => !t.completed && !t.skipped).map((t) => ({ ...t, date: d.date })))
    .slice(0, 6);

  return (
    <div className="space-y-6">
      {/* Today Summary */}
      <div className="card relative overflow-hidden">
        <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-[#6C5CE7]/5 to-transparent" />
        <div className="relative flex items-center justify-between">
          <div>
            <p className="text-xs text-[#64748B]">{todayPlan?.phase}</p>
            <h2 className="mt-1 text-2xl font-bold text-white">
              Day {currentDay}{" "}
              <span className="text-base font-normal text-[#64748B]">
                — {todayPlan ? format(parseISO(todayPlan.date), "EEEE, MMMM d") : ""}
              </span>
            </h2>
            <div className="mt-2 flex items-center gap-3">
              <span
                className={`badge ${
                  todayPlan?.planType === "A"
                    ? "bg-blue-500/15 text-blue-400"
                    : todayPlan?.planType === "B"
                    ? "bg-orange-500/15 text-orange-400"
                    : "bg-green-500/15 text-green-400"
                }`}
              >
                Plan {todayPlan?.planType}
              </span>
              <span className="text-sm text-[#64748B]">
                {completedToday}/{totalToday} tasks done
              </span>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="relative h-20 w-20">
              <svg className="h-20 w-20 -rotate-90" viewBox="0 0 36 36">
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#2D2D3F"
                  strokeWidth="3"
                />
                <path
                  d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                  fill="none"
                  stroke="#6C5CE7"
                  strokeWidth="3"
                  strokeDasharray={`${completionPct}, 100`}
                  strokeLinecap="round"
                />
              </svg>
              <span className="absolute inset-0 flex items-center justify-center text-lg font-bold text-white">
                {completionPct}%
              </span>
            </div>
            <Link
              href="/today"
              className="mt-2 flex items-center gap-1 text-xs text-[#6C5CE7] hover:underline"
            >
              View Full Day <ChevronRight className="h-3 w-3" />
            </Link>
          </div>
        </div>
        {/* Progress bar */}
        <div className="mt-4 h-1.5 w-full overflow-hidden rounded-full bg-[#2D2D3F]">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#6C5CE7] to-[#a78bfa] transition-all duration-500"
            style={{ width: `${completionPct}%` }}
          />
        </div>
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-4 gap-4">
        <div className="card">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[#FF6B6B]" />
            <span className="text-xs text-[#64748B]">Posting Streak</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{streak} days</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Linkedin className="h-5 w-5 text-blue-400" />
            <span className="text-xs text-[#64748B]">LinkedIn Posts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{linkedinPosts}</p>
          <p className="text-xs text-[#64748B]">/ 50 target {linkedinWork > 0 && <span className="text-[#6C5CE7]">+ {linkedinWork} tasks</span>}</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Github className="h-5 w-5 text-gray-400" />
            <span className="text-xs text-[#64748B]">GitHub Repos</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{totalGithub}</p>
          <p className="text-xs text-[#64748B]">/ 6 target</p>
        </div>
        <div className="card">
          <div className="flex items-center gap-2">
            <Twitter className="h-5 w-5 text-cyan-400" />
            <span className="text-xs text-[#64748B]">Twitter Posts</span>
          </div>
          <p className="mt-2 text-2xl font-bold text-white">{twitterPosts}</p>
          <p className="text-xs text-[#64748B]">/ 15 target</p>
        </div>
      </div>

      {/* Week Overview + Upcoming Tasks */}
      <div className="grid grid-cols-2 gap-4">
        {/* Week Overview */}
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">This Week</h3>
          <div className="grid grid-cols-7 gap-2">
            {weekDays.map((day) => {
              const done = day.tasks.filter((t) => t.completed || t.skipped).length;
              const total = day.tasks.length;
              const pct = total > 0 ? done / total : 0;
              const isCurrent = day.dayNumber === currentDay;
              return (
                <Link key={day.dayNumber} href={`/day/${day.dayNumber}`}>
                  <div
                    className={`flex flex-col items-center rounded-lg p-2 transition-all ${
                      isCurrent ? "bg-[#6C5CE7]/20 ring-1 ring-[#6C5CE7]" : "hover:bg-[#1E1E2E]"
                    }`}
                  >
                    <span className="text-[10px] text-[#64748B]">
                      {format(parseISO(day.date), "EEE")}
                    </span>
                    <span className="mt-1 text-sm font-medium text-white">{day.dayNumber}</span>
                    <div
                      className={`mt-1 h-2 w-2 rounded-full ${
                        day.dayNumber > currentDay
                          ? "bg-[#2D2D3F]"
                          : pct >= 0.8
                          ? "bg-[#00B894]"
                          : pct >= 0.5
                          ? "bg-[#FDCB6E]"
                          : "bg-[#FF6B6B]"
                      }`}
                    />
                  </div>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Upcoming Tasks */}
        <div className="card">
          <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">Upcoming Tasks</h3>
          <ul className="space-y-2">
            {upcoming.map((task) => (
              <li key={task.id} className="flex items-center gap-2 text-sm">
                <span>{categoryIcons[task.category] || "📌"}</span>
                <span className="flex-1 truncate text-[#E2E8F0]">{task.title}</span>
                <span className="text-[10px] text-[#64748B]">Day {task.dayNumber}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* 90-Day Progress Overview */}
      <div className="card">
        <h3 className="mb-3 text-sm font-semibold text-[#E2E8F0]">90-Day Progress</h3>
        <div className="flex gap-[2px]">
          {days.map((day) => {
            const done = day.tasks.filter((t) => t.completed || t.skipped).length;
            const total = day.tasks.length;
            const pct = total > 0 ? done / total : 0;
            const isFuture = day.dayNumber > currentDay;
            return (
              <Link key={day.dayNumber} href={`/day/${day.dayNumber}`}>
                <div
                  title={`Day ${day.dayNumber}: ${Math.round(pct * 100)}%`}
                  className={`h-6 w-[7px] rounded-sm transition-all hover:scale-y-125 ${
                    isFuture
                      ? "bg-[#2D2D3F]"
                      : pct >= 0.8
                      ? "bg-[#00B894]"
                      : pct >= 0.5
                      ? "bg-[#FDCB6E]"
                      : pct > 0
                      ? "bg-[#FF6B6B]"
                      : "bg-[#2D2D3F]"
                  }`}
                />
              </Link>
            );
          })}
        </div>
        <div className="mt-2 flex justify-between text-[10px] text-[#64748B]">
          <span>Day 1</span>
          <span>Day 30</span>
          <span>Day 60</span>
          <span>Day 90</span>
        </div>
      </div>
    </div>
  );
}
