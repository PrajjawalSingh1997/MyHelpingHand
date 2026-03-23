/* ─── Sync hooks that keep all stores in sync ─── */
"use client";

import { useTaskStore } from "@/store/task-store";
import { useBlogStore, useRentlyfStore } from "@/store/stores";

/**
 * When Rentlyf hours change on the Today page,
 * auto-create/update a log entry in the Rentlyf store.
 */
export function useSyncRentlyfHours() {
  const updateRentlyfHours = useTaskStore((s) => s.updateRentlyfHours);
  const addLog = useRentlyfStore((s) => s.addLog);
  const logs = useRentlyfStore((s) => s.logs);
  const updateLog = useRentlyfStore((s) => s.updateLog);
  const days = useTaskStore((s) => s.days);

  const syncHours = (dayNumber: number, hours: number) => {
    // 1. Update the task store
    updateRentlyfHours(dayNumber, hours);

    // 2. Find the date for this day
    const day = days.find((d) => d.dayNumber === dayNumber);
    if (!day) return;
    const date = day.date;

    // 3. Check if a log exists for this date
    const existingLog = logs.find((l) => l.date === date && l.notes.startsWith("[Auto]"));
    if (existingLog) {
      updateLog(existingLog.id, { hours });
    } else if (hours > 0) {
      addLog({
        id: `auto_${Date.now()}`,
        date,
        hours,
        category: "dashboard",
        notes: `[Auto] Day ${dayNumber} — logged from Today View`,
      });
    }
  };

  return syncHours;
}

/**
 * When a Rentlyf log is added/updated on the Rentlyf page,
 * update the corresponding day's rentlyfHours in the task store.
 */
export function useSyncRentlyfLogToDay() {
  const updateRentlyfHours = useTaskStore((s) => s.updateRentlyfHours);
  const days = useTaskStore((s) => s.days);
  const logs = useRentlyfStore((s) => s.logs);

  const recalcDayHours = (date: string) => {
    // Find which day this date belongs to
    const day = days.find((d) => d.date === date);
    if (!day) return;

    // Sum all logs for this date
    const totalHours = logs
      .filter((l) => l.date === date)
      .reduce((sum, l) => sum + l.hours, 0);

    updateRentlyfHours(day.dayNumber, totalHours);
  };

  return recalcDayHours;
}

/**
 * When a blog task is completed/uncompleted in the day view,
 * sync the corresponding blog post status in the blog store.
 */
export function useSyncBlogStatus() {
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateBlog = useBlogStore((s) => s.updateBlog);
  const blogs = useBlogStore((s) => s.blogs);
  const days = useTaskStore((s) => s.days);

  const toggleBlogTask = (dayNumber: number, taskId: string) => {
    // 1. Toggle the task in task store
    toggleTask(dayNumber, taskId);

    // 2. Find the task to check its new state
    const day = days.find((d) => d.dayNumber === dayNumber);
    const task = day?.tasks.find((t) => t.id === taskId);
    if (!task || task.category !== "blog") return;

    // The task was toggled, so the NEW completed state is !task.completed
    const nowCompleted = !task.completed;

    // 3. Find matching blog by scheduledDay
    const matchingBlog = blogs.find((b) => b.scheduledDay === dayNumber);
    if (matchingBlog) {
      updateBlog(matchingBlog.id, {
        status: nowCompleted ? "published" : "to_write",
      });
    }
  };

  return toggleBlogTask;
}

/**
 * When a blog status changes in the Blog Manager,
 * sync the corresponding task in the task store.
 */
export function useSyncBlogToTask() {
  const editTask = useTaskStore((s) => s.editTask);
  const toggleTask = useTaskStore((s) => s.toggleTask);
  const updateBlog = useBlogStore((s) => s.updateBlog);
  const days = useTaskStore((s) => s.days);

  const updateBlogWithSync = (blogId: string, scheduledDay: number, newStatus: "to_write" | "in_progress" | "published") => {
    // 1. Update blog store
    updateBlog(blogId, { status: newStatus });

    // 2. Find matching task in task store
    const day = days.find((d) => d.dayNumber === scheduledDay);
    if (!day) return;
    const blogTask = day.tasks.find((t) => t.category === "blog");
    if (!blogTask) return;

    // 3. Sync completion
    if (newStatus === "published" && !blogTask.completed) {
      toggleTask(scheduledDay, blogTask.id);
    } else if (newStatus !== "published" && blogTask.completed) {
      toggleTask(scheduledDay, blogTask.id);
    }
  };

  return updateBlogWithSync;
}

/**
 * Get total Rentlyf hours from the unified source (Rentlyf log store).
 * This is the single source of truth for all charts.
 */
export function useUnifiedRentlyfStats() {
  const logs = useRentlyfStore((s) => s.logs);
  const days = useTaskStore((s) => s.days);

  // Total hours from logs
  const totalLogHours = logs.reduce((s, l) => s + l.hours, 0);

  // Total hours from day plans (fallback for days without detailed logs)
  const totalDayHours = days.reduce((s, d) => s + d.rentlyfHours, 0);

  // Use the higher value (accounts for both sources)
  const totalHours = Math.max(totalLogHours, totalDayHours);

  // Weekly hours from logs
  const weeklyHours = Array.from({ length: 13 }, (_, i) => {
    const weekDays = days.filter((d) => d.weekNumber === i + 1);
    const weekDates = weekDays.map((d) => d.date);
    const fromLogs = logs.filter((l) => weekDates.includes(l.date)).reduce((s, l) => s + l.hours, 0);
    const fromDays = weekDays.reduce((s, d) => s + d.rentlyfHours, 0);
    return { week: `W${i + 1}`, hours: Math.max(fromLogs, fromDays) };
  });

  // Category breakdown from logs
  const byCategory = logs.reduce<Record<string, number>>((acc, l) => {
    acc[l.category] = (acc[l.category] || 0) + l.hours;
    return acc;
  }, {});

  return { totalHours, weeklyHours, byCategory, logs };
}
