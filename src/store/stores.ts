"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { BlogPost, FreelanceProposal, FreelanceProject, RentlyfLog, ScoreCardMetric, LearningTopic, UserSettings } from "@/lib/types";
import { defaultBlogs } from "@/data/blogs";
import { defaultLearningTopics } from "@/data/learning";
import { month1Targets, month2Targets, month3Targets } from "@/data/goals";

/* ─── Blog Store ─── */
interface BlogState {
  blogs: BlogPost[];
  updateBlog: (id: string, updates: Partial<BlogPost>) => void;
  resetBlogs: () => void;
}
export const useBlogStore = create<BlogState>()(
  persist(
    (set) => ({
      blogs: defaultBlogs,
      updateBlog: (id, updates) => set((s) => ({ blogs: s.blogs.map((b) => (b.id === id ? { ...b, ...updates } : b)) })),
      resetBlogs: () => set({ blogs: defaultBlogs }),
    }),
    { name: "gt_blogs" }
  )
);

/* ─── Freelance Store ─── */
interface FreelanceState {
  proposals: FreelanceProposal[];
  projects: FreelanceProject[];
  addProposal: (p: FreelanceProposal) => void;
  updateProposal: (id: string, updates: Partial<FreelanceProposal>) => void;
  deleteProposal: (id: string) => void;
  addProject: (p: FreelanceProject) => void;
  updateProject: (id: string, updates: Partial<FreelanceProject>) => void;
  toggleProjectTask: (projectId: string, taskIndex: number) => void;
}
export const useFreelanceStore = create<FreelanceState>()(
  persist(
    (set) => ({
      proposals: [],
      projects: [],
      addProposal: (p) => set((s) => ({ proposals: [...s.proposals, p] })),
      updateProposal: (id, updates) => set((s) => ({ proposals: s.proposals.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      deleteProposal: (id) => set((s) => ({ proposals: s.proposals.filter((p) => p.id !== id) })),
      addProject: (p) => set((s) => ({ projects: [...s.projects, p] })),
      updateProject: (id, updates) => set((s) => ({ projects: s.projects.map((p) => (p.id === id ? { ...p, ...updates } : p)) })),
      toggleProjectTask: (projectId, taskIndex) =>
        set((s) => ({
          projects: s.projects.map((p) =>
            p.id === projectId
              ? { ...p, tasks: p.tasks.map((t, i) => (i === taskIndex ? { ...t, completed: !t.completed } : t)) }
              : p
          ),
        })),
    }),
    { name: "gt_freelance" }
  )
);

/* ─── Rentlyf Log Store ─── */
interface RentlyfState {
  logs: RentlyfLog[];
  addLog: (log: RentlyfLog) => void;
  updateLog: (id: string, updates: Partial<RentlyfLog>) => void;
  deleteLog: (id: string) => void;
}
export const useRentlyfStore = create<RentlyfState>()(
  persist(
    (set) => ({
      logs: [],
      addLog: (log) => set((s) => ({ logs: [...s.logs, log] })),
      updateLog: (id, updates) => set((s) => ({ logs: s.logs.map((l) => (l.id === id ? { ...l, ...updates } : l)) })),
      deleteLog: (id) => set((s) => ({ logs: s.logs.filter((l) => l.id !== id) })),
    }),
    { name: "gt_rentlyf" }
  )
);

/* ─── Goals / Score Cards Store ─── */
interface GoalsState {
  month1: ScoreCardMetric[];
  month2: ScoreCardMetric[];
  month3: ScoreCardMetric[];
  updateMetric: (month: 1 | 2 | 3, index: number, updates: Partial<ScoreCardMetric>) => void;
  resetGoals: () => void;
}
export const useGoalsStore = create<GoalsState>()(
  persist(
    (set) => ({
      month1: month1Targets,
      month2: month2Targets,
      month3: month3Targets,
      updateMetric: (month, index, updates) =>
        set((s) => {
          const key = `month${month}` as "month1" | "month2" | "month3";
          const updated = [...s[key]];
          updated[index] = { ...updated[index], ...updates };
          return { [key]: updated };
        }),
      resetGoals: () => set({ month1: month1Targets, month2: month2Targets, month3: month3Targets }),
    }),
    { name: "gt_goals" }
  )
);

/* ─── Learning Store ─── */
interface LearningState {
  topics: LearningTopic[];
  updateTopic: (id: string, updates: Partial<LearningTopic>) => void;
  resetTopics: () => void;
}
export const useLearningStore = create<LearningState>()(
  persist(
    (set) => ({
      topics: defaultLearningTopics,
      updateTopic: (id, updates) => set((s) => ({ topics: s.topics.map((t) => (t.id === id ? { ...t, ...updates } : t)) })),
      resetTopics: () => set({ topics: defaultLearningTopics }),
    }),
    { name: "gt_learning" }
  )
);

/* ─── Settings Store ─── */
interface SettingsState {
  settings: UserSettings;
  updateSettings: (updates: Partial<UserSettings>) => void;
}
export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        name: "Prajjawal Singh",
        startDate: "2026-03-24",
        darkMode: true,
        accentColor: "#6C5CE7",
        socialLinks: {},
        skippedDays: [],
      },
      updateSettings: (updates) => set((s) => ({ settings: { ...s.settings, ...updates } })),
    }),
    { name: "gt_settings" }
  )
);
