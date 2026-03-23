/* ─── timetable definitions for Plan A, B, C ─── */
import { TimeBlock } from "@/lib/types";

export const planA: TimeBlock[] = [
  { time: "12:00 PM – 12:30 PM", emoji: "🌅", name: "Wake & Prep", activity: "Morning routine, check messages", duration: "30 min" },
  { time: "12:30 PM – 1:30 PM", emoji: "📱", name: "Networking", activity: "LinkedIn: comment on 5-10 posts, accept connections, reply to DMs", duration: "1 hr" },
  { time: "1:30 PM – 4:30 PM", emoji: "💻", name: "Coding Block 1", activity: "Rentlyf: Dashboard / Testing / Backend work", duration: "3 hrs" },
  { time: "4:30 PM – 5:00 PM", emoji: "☕", name: "Break", activity: "Snack, walk, recharge", duration: "30 min" },
  { time: "5:00 PM – 7:00 PM", emoji: "💻", name: "Coding Block 2", activity: "Rentlyf: Continue coding or bug fixes", duration: "2 hrs" },
  { time: "7:00 PM – 8:00 PM", emoji: "🍽️", name: "Dinner", activity: "Break", duration: "1 hr" },
  { time: "8:00 PM – 9:30 PM", emoji: "✍️", name: "Content Creation", activity: "Write today's LinkedIn post + prepare GitHub commit", duration: "1.5 hrs" },
  { time: "9:30 PM – 10:00 PM", emoji: "📤", name: "Posting", activity: "Post on LinkedIn/Twitter, reply to comments", duration: "30 min" },
  { time: "10:00 PM – 1:00 AM", emoji: "🌐", name: "Freelancing", activity: "Build client websites / update gigs / send proposals", duration: "3 hrs" },
  { time: "1:00 AM – 3:00 AM", emoji: "📚", name: "Learning", activity: "Portfolio rebuild, learn Three.js, marketing research", duration: "2 hrs" },
  { time: "3:00 AM – 4:00 AM", emoji: "💻", name: "Light Coding", activity: "Planning for next day or light coding", duration: "1 hr" },
  { time: "4:00 AM – 4:30 AM", emoji: "📝", name: "Daily Wrap", activity: "Update bug sheet, tomorrow's tasks, Discord check", duration: "30 min" },
];

export const planB: TimeBlock[] = [
  { time: "12:00 PM – 1:00 PM", emoji: "📱", name: "Quick Networking", activity: "30 min LinkedIn + 30 min messages", duration: "1 hr" },
  { time: "1:00 PM – 7:00 PM", emoji: "💻", name: "Coding Marathon", activity: "Rentlyf work — 6 straight hours", duration: "6 hrs" },
  { time: "7:00 PM – 8:00 PM", emoji: "🍽️", name: "Dinner", activity: "Break", duration: "1 hr" },
  { time: "8:00 PM – 9:00 PM", emoji: "✍️", name: "Quick Content", activity: "Reuse a pre-written draft, post quickly", duration: "1 hr" },
  { time: "9:00 PM – 1:00 AM", emoji: "🌐", name: "Freelancing + Coding", activity: "Freelancing + More Coding", duration: "4 hrs" },
  { time: "1:00 AM – 3:00 AM", emoji: "📚", name: "Learning / Portfolio", activity: "Learning or Portfolio work", duration: "2 hrs" },
];

export const planC: TimeBlock[] = [
  { time: "12:00 PM – 2:00 PM", emoji: "📱", name: "Networking Marathon", activity: "LinkedIn commenting spree, connections", duration: "2 hrs" },
  { time: "2:00 PM – 4:00 PM", emoji: "💻", name: "Light Coding", activity: "Bug fixes, small tasks", duration: "2 hrs" },
  { time: "4:00 PM – 7:00 PM", emoji: "✍️", name: "Content Marathon", activity: "Write 3-4 posts for the week", duration: "3 hrs" },
  { time: "7:00 PM – 8:00 PM", emoji: "🍽️", name: "Dinner", activity: "Break", duration: "1 hr" },
  { time: "8:00 PM – 12:00 AM", emoji: "🌐", name: "Freelancing", activity: "Build client sites, send proposals", duration: "4 hrs" },
  { time: "12:00 AM – 3:00 AM", emoji: "🎨", name: "Portfolio + Learning", activity: "Portfolio rebuild + Learning", duration: "3 hrs" },
];

export const weeklyRhythm = [
  { day: "Monday", focus: "Coding + LinkedIn post", plan: "A" as const, platform: "LinkedIn" },
  { day: "Tuesday", focus: "Coding + GitHub push", plan: "A" as const, platform: "GitHub + Twitter" },
  { day: "Wednesday", focus: "Batch content day", plan: "C" as const, platform: "LinkedIn" },
  { day: "Thursday", focus: "Coding + Freelancing", plan: "B" as const, platform: "LinkedIn" },
  { day: "Friday", focus: "Coding + Showcase", plan: "A" as const, platform: "LinkedIn + Twitter" },
  { day: "Saturday", focus: "Freelancing + Portfolio", plan: "C" as const, platform: "Freelance platforms" },
  { day: "Sunday", focus: "Summary + Planning", plan: "C" as const, platform: "LinkedIn" },
];
