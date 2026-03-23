/* ─── Readable export helpers ─── */

import { DayPlan } from "@/lib/types";
import { BlogPost, FreelanceProposal, FreelanceProject, RentlyfLog, ScoreCardMetric, LearningTopic, UserSettings } from "@/lib/types";

function statusEmoji(done: boolean, skipped: boolean): string {
  if (done) return "✅";
  if (skipped) return "⏭️";
  return "⬜";
}

export function generateReadableExport(
  days: DayPlan[],
  blogs: BlogPost[],
  proposals: FreelanceProposal[],
  projects: FreelanceProject[],
  rentlyfLogs: RentlyfLog[],
  goals: { month1: ScoreCardMetric[]; month2: ScoreCardMetric[]; month3: ScoreCardMetric[] },
  learningTopics: LearningTopic[],
  settings: UserSettings
): string {
  const lines: string[] = [];

  lines.push(`# 📊 Growth Tracker — Full Export`);
  lines.push(`**Exported:** ${new Date().toLocaleDateString("en-IN", { dateStyle: "full" })}`);
  lines.push(`**Name:** ${settings.name}`);
  lines.push(`**Start Date:** ${settings.startDate}`);
  lines.push(``);

  // ─── Overview Stats ───
  const allTasks = days.flatMap((d) => d.tasks);
  const totalTasks = allTasks.length;
  const completedTasks = allTasks.filter((t) => t.completed).length;
  const skippedTasks = allTasks.filter((t) => t.skipped).length;
  const totalHours = days.reduce((s, d) => s + d.rentlyfHours, 0);

  lines.push(`## 📈 Overall Stats`);
  lines.push(`| Metric | Value |`);
  lines.push(`|--------|-------|`);
  lines.push(`| Total Tasks | ${totalTasks} |`);
  lines.push(`| Completed | ${completedTasks} (${totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0}%) |`);
  lines.push(`| Skipped | ${skippedTasks} |`);
  lines.push(`| Pending | ${totalTasks - completedTasks - skippedTasks} |`);
  lines.push(`| Rentlyf Hours | ${totalHours} hrs |`);
  lines.push(`| LinkedIn Posts Done | ${allTasks.filter((t) => t.category === "linkedin" && t.completed).length} |`);
  lines.push(`| GitHub Tasks Done | ${allTasks.filter((t) => t.category === "github" && t.completed).length} |`);
  lines.push(`| Twitter Posts Done | ${allTasks.filter((t) => t.category === "twitter" && t.completed).length} |`);
  lines.push(`| Blog Posts Done | ${allTasks.filter((t) => t.category === "blog" && t.completed).length} |`);
  lines.push(``);

  // ─── Day by Day ───
  lines.push(`---`);
  lines.push(`## 📅 Day-by-Day Progress`);
  lines.push(``);

  for (const day of days) {
    const done = day.tasks.filter((t) => t.completed).length;
    const total = day.tasks.length;
    const pct = total > 0 ? Math.round((done / total) * 100) : 0;

    lines.push(`### Day ${day.dayNumber} — ${day.date} (Plan ${day.planType}) [${pct}%]`);

    for (const task of day.tasks) {
      const emoji = statusEmoji(task.completed, task.skipped);
      lines.push(`- ${emoji} **[${task.category.toUpperCase()}]** ${task.title}`);
      if (task.postUrl) lines.push(`  - 🔗 ${task.postUrl}`);
      if (task.notes) lines.push(`  - 📝 ${task.notes}`);
    }

    if (day.rentlyfHours > 0) lines.push(`- ⏱️ Rentlyf Hours: ${day.rentlyfHours}`);
    if (day.dailyNotes) lines.push(`- 📝 Notes: ${day.dailyNotes}`);
    lines.push(``);
  }

  // ─── Content History ───
  lines.push(`---`);
  lines.push(`## ✍️ Content History`);
  lines.push(``);

  const postsWithContent = days.flatMap((d) => d.tasks.filter((t) => t.postContent).map((t) => ({ ...t, date: d.date })));
  for (const post of postsWithContent) {
    lines.push(`### Day ${post.dayNumber} — ${post.category.toUpperCase()}: ${post.title}`);
    lines.push(`**Status:** ${post.completed ? "✅ Posted" : post.skipped ? "⏭️ Skipped" : "⬜ Pending"}`);
    if (post.postUrl) lines.push(`**URL:** ${post.postUrl}`);
    lines.push(`\`\`\``);
    lines.push(post.postContent!);
    lines.push(`\`\`\``);
    lines.push(``);
  }

  // ─── Blog Progress ───
  lines.push(`---`);
  lines.push(`## 📝 Blog Progress`);
  lines.push(`| # | Title | Status | Day |`);
  lines.push(`|---|-------|--------|-----|`);
  for (const blog of blogs) {
    lines.push(`| ${blog.number} | ${blog.title} | ${blog.status === "published" ? "✅" : blog.status === "in_progress" ? "🟡" : "⬜"} ${blog.status} | ${blog.scheduledDay} |`);
  }
  lines.push(``);

  // ─── Freelance ───
  lines.push(`---`);
  lines.push(`## 💼 Freelance Tracker`);
  if (proposals.length > 0) {
    lines.push(`### Proposals Sent: ${proposals.length}`);
    lines.push(`| Date | Platform | Client | Gig | Amount | Status |`);
    lines.push(`|------|----------|--------|-----|--------|--------|`);
    for (const p of proposals) {
      lines.push(`| ${p.date} | ${p.platform} | ${p.clientName} | ${p.gigTitle} | ₹${p.amount} | ${p.status} |`);
    }
    lines.push(``);
  }
  if (projects.length > 0) {
    lines.push(`### Projects: ${projects.length}`);
    for (const p of projects) {
      lines.push(`- **${p.clientName}** — ${p.projectType} (₹${p.amount}) [${p.status}]`);
    }
    lines.push(``);
  }

  // ─── Rentlyf Log ───
  if (rentlyfLogs.length > 0) {
    lines.push(`---`);
    lines.push(`## 🏠 Rentlyf Work Log`);
    lines.push(`| Date | Hours | Category | Notes |`);
    lines.push(`|------|-------|----------|-------|`);
    for (const log of rentlyfLogs) {
      lines.push(`| ${log.date} | ${log.hours}h | ${log.category} | ${log.notes} |`);
    }
    lines.push(``);
  }

  // ─── Goals ───
  lines.push(`---`);
  lines.push(`## 🎯 Goals & Score Cards`);
  const allGoals = [
    { label: "Month 1", metrics: goals.month1 },
    { label: "Month 2", metrics: goals.month2 },
    { label: "Month 3", metrics: goals.month3 },
  ];
  for (const g of allGoals) {
    lines.push(`### ${g.label}`);
    lines.push(`| Metric | Target | Actual | Status |`);
    lines.push(`|--------|--------|--------|--------|`);
    for (const m of g.metrics) {
      const s = m.status === "green" ? "🟢" : m.status === "yellow" ? "🟡" : m.status === "red" ? "🔴" : "—";
      lines.push(`| ${m.name} | ${m.target} | ${m.actual || "—"} | ${s} |`);
    }
    lines.push(``);
  }

  // ─── Learning ───
  lines.push(`---`);
  lines.push(`## 📚 Learning Progress`);
  lines.push(`| Topic | Status | Hours |`);
  lines.push(`|-------|--------|-------|`);
  for (const t of learningTopics) {
    lines.push(`| ${t.title} | ${t.status === "completed" ? "✅" : t.status === "in_progress" ? "🟡" : "⬜"} | ${t.hoursSpent}h |`);
  }
  lines.push(``);

  lines.push(`---`);
  lines.push(`*Generated by Growth Tracker App*`);

  return lines.join("\n");
}
