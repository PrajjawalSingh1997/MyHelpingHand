# 🚀 Growth Tracker

A personal productivity web app built to track progress through a **90-Day Developer Growth Engine**. Manage daily tasks, content creation, blog writing, freelance work, coding hours, and goals — all in one beautiful dark-themed dashboard.

## ✨ Features

- **📅 90-Day Task System** — Pre-planned daily tasks across LinkedIn, GitHub, Twitter, Blog, Freelancing, and more
- **✏️ Editable Content** — Edit post titles, content, and save published URLs
- **⏩ Task Postponement** — Move tasks to any other day with automatic tracking
- **📊 Progress Dashboard** — Charts for task completion, coding hours, platform breakdown
- **📝 Blog Manager** — Kanban board with platform selection, tags, content editor, word count
- **🏠 Rentlyf Work Log** — Track coding hours with category breakdown and charts
- **🎯 Goals & Score Cards** — Auto-computed actuals synced from real task data
- **⏰ Timetable** — Daily schedule with checkboxes that auto-reset at 11 AM
- **✍️ Content Hub** — All posts in one place with edit, copy, and status tracking
- **📄 Markdown Export** — Export full progress report as readable `.md` file
- **🔄 Data Sync** — Changes in one page automatically reflect everywhere

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| Styling | TailwindCSS |
| State | Zustand (with localStorage persistence) |
| Charts | Recharts |
| Icons | Lucide React |

## 🚀 Getting Started

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build
```

Open [http://localhost:3000](http://localhost:3000) to view the app.

## 📁 Project Structure

```
src/
├── app/          → 12 pages (Next.js App Router)
├── components/   → Layout (Sidebar, TopBar)
├── data/         → Static data generators (days, blogs, goals, timetables)
├── hooks/        → Sync hooks for cross-store data flow
├── store/        → Zustand state management
└── lib/          → Types, utilities, storage, export
```

## 💾 Data Storage

All data is stored locally in your browser's `localStorage`. No backend required.
Data persists across browser refreshes and restarts. Use the Export feature in Settings to backup your progress.

## 👤 Author

**Prajjawal Singh**

---

Built as part of the 90-Day Developer Growth Engine 🌱
