/* ─── shared types used across the entire app ─── */

export type Platform = "linkedin" | "github" | "twitter" | "blog";
export type TaskCategory = "linkedin" | "github" | "twitter" | "freelance" | "portfolio" | "blog" | "rentlyf" | "learning" | "networking";
export type PlanType = "A" | "B" | "C";
export type PostStatus = "not_posted" | "posted" | "skipped";
export type BlogStatus = "to_write" | "in_progress" | "published";
export type ProposalStatus = "sent" | "replied" | "won" | "rejected";
export type ProjectStatus = "active" | "completed";
export type FreelancePlatform = "fiverr" | "upwork" | "freelancer" | "contra" | "direct";
export type RentlyfCategory = "dashboard" | "testing" | "bugfix" | "backend";
export type LearningStatus = "not_started" | "in_progress" | "completed";

export interface DayTask {
  id: string;
  dayNumber: number;
  category: TaskCategory;
  title: string;
  description: string;
  completed: boolean;
  skipped: boolean;
  timeBlock?: string;
  postContent?: string;
  postUrl?: string;
  notes?: string;
}

export interface DayPlan {
  dayNumber: number;
  date: string;
  planType: PlanType;
  phase: string;
  weekNumber: number;
  weekLabel: string;
  tasks: DayTask[];
  dailyNotes: string;
  rentlyfHours: number;
  completed: boolean;
}

export interface ContentPost {
  id: string;
  dayNumber: number;
  platform: Platform;
  title: string;
  content: string;
  status: PostStatus;
  postedUrl?: string;
  postedDate?: string;
}

export type BlogPlatform = "hashnode" | "dev.to" | "medium" | "personal" | "linkedin" | "other";

export interface BlogPost {
  id: string;
  number: number;
  title: string;
  scheduledDay: number;
  status: BlogStatus;
  platform?: BlogPlatform;
  publishedUrl?: string;
  content?: string;
  wordCount?: number;
  tags?: string[];
  publishedDate?: string;
  timeSpent?: number; // hours spent writing
  notes?: string;
}

export interface FreelanceProposal {
  id: string;
  date: string;
  platform: FreelancePlatform;
  clientName: string;
  gigTitle: string;
  amount: number;
  status: ProposalStatus;
  notes?: string;
}

export interface FreelanceProject {
  id: string;
  clientName: string;
  projectType: string;
  amount: number;
  startDate: string;
  deadline?: string;
  status: ProjectStatus;
  testimonial?: string;
  tasks: { title: string; completed: boolean }[];
}

export interface RentlyfLog {
  id: string;
  date: string;
  hours: number;
  category: RentlyfCategory;
  notes: string;
}

export interface ScoreCardMetric {
  name: string;
  target: string;
  actual: string;
  status: "green" | "yellow" | "red" | "none";
}

export interface LearningTopic {
  id: string;
  title: string;
  category: string;
  status: LearningStatus;
  resources: string[];
  notes: string;
  hoursSpent: number;
}

export interface UserSettings {
  name: string;
  startDate: string;
  darkMode: boolean;
  accentColor: string;
  socialLinks: {
    linkedin?: string;
    github?: string;
    twitter?: string;
    portfolio?: string;
  };
  skippedDays: number[];
}

export interface TimeBlock {
  time: string;
  emoji: string;
  name: string;
  activity: string;
  duration: string;
}
