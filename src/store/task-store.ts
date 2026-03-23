/* ─── Main task store — persists task completion, notes, hours ─── */
"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { DayPlan, DayTask } from "@/lib/types";
import { generateAllDays } from "@/data/days";

interface TaskState {
  days: DayPlan[];
  toggleTask: (dayNumber: number, taskId: string) => void;
  skipTask: (dayNumber: number, taskId: string) => void;
  editTask: (dayNumber: number, taskId: string, updates: Partial<DayTask>) => void;
  postponeTask: (fromDay: number, taskId: string, toDay: number) => void;
  updateNotes: (dayNumber: number, notes: string) => void;
  updateRentlyfHours: (dayNumber: number, hours: number) => void;
  getDay: (dayNumber: number) => DayPlan | undefined;
  getCurrentDayNumber: () => number;
  getStreak: () => number;
  resetAll: () => void;
}

const START_DATE = new Date("2026-03-24");

function calcCurrentDay(): number {
  const now = new Date();
  const diff = Math.floor((now.getTime() - START_DATE.getTime()) / (1000 * 60 * 60 * 24));
  return Math.max(1, Math.min(90, diff + 1));
}

export const useTaskStore = create<TaskState>()(
  persist(
    (set, get) => ({
      days: generateAllDays(),

      toggleTask: (dayNumber, taskId) =>
        set((s) => ({
          days: s.days.map((d) =>
            d.dayNumber === dayNumber
              ? {
                  ...d,
                  tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, completed: !t.completed, skipped: false } : t)),
                  completed: d.tasks.every((t) => (t.id === taskId ? !t.completed : t.completed) || t.skipped),
                }
              : d
          ),
        })),

      skipTask: (dayNumber, taskId) =>
        set((s) => ({
          days: s.days.map((d) =>
            d.dayNumber === dayNumber
              ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, skipped: !t.skipped, completed: false } : t)) }
              : d
          ),
        })),

      editTask: (dayNumber, taskId, updates) =>
        set((s) => ({
          days: s.days.map((d) =>
            d.dayNumber === dayNumber
              ? { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, ...updates } : t)) }
              : d
          ),
        })),

      postponeTask: (fromDay, taskId, toDay) =>
        set((s) => {
          const sourceDay = s.days.find((d) => d.dayNumber === fromDay);
          const task = sourceDay?.tasks.find((t) => t.id === taskId);
          if (!task || toDay < 1 || toDay > 90 || toDay === fromDay) return s;

          const postponedTask: DayTask = {
            ...task,
            id: `postponed_${Date.now()}`,
            dayNumber: toDay,
            completed: false,
            skipped: false,
            notes: `⏩ Postponed from Day ${fromDay}${task.notes ? ` | ${task.notes}` : ""}`,
          };

          return {
            days: s.days.map((d) => {
              if (d.dayNumber === fromDay) {
                return { ...d, tasks: d.tasks.map((t) => (t.id === taskId ? { ...t, skipped: true, notes: `⏩ Moved to Day ${toDay}` } : t)) };
              }
              if (d.dayNumber === toDay) {
                return { ...d, tasks: [...d.tasks, postponedTask] };
              }
              return d;
            }),
          };
        }),

      updateNotes: (dayNumber, notes) =>
        set((s) => ({
          days: s.days.map((d) => (d.dayNumber === dayNumber ? { ...d, dailyNotes: notes } : d)),
        })),

      updateRentlyfHours: (dayNumber, hours) =>
        set((s) => ({
          days: s.days.map((d) => (d.dayNumber === dayNumber ? { ...d, rentlyfHours: hours } : d)),
        })),

      getDay: (dayNumber) => get().days.find((d) => d.dayNumber === dayNumber),

      getCurrentDayNumber: () => calcCurrentDay(),

      getStreak: () => {
        const days = get().days;
        let streak = 0;
        const today = calcCurrentDay();
        for (let i = today - 1; i >= 0; i--) {
          const day = days[i];
          if (!day) break;
          const totalTasks = day.tasks.length;
          const done = day.tasks.filter((t) => t.completed || t.skipped).length;
          if (done / totalTasks >= 0.5) streak++;
          else break;
        }
        return streak;
      },

      resetAll: () => set({ days: generateAllDays() }),
    }),
    { name: "gt_tasks" }
  )
);
