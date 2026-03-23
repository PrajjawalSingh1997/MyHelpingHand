"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard,
  CalendarCheck,
  Calendar,
  PenTool,
  BarChart3,
  FileText,
  Briefcase,
  Building2,
  Target,
  Clock,
  BookOpen,
  Settings,
  Rocket,
} from "lucide-react";

const navItems = [
  { href: "/", icon: LayoutDashboard, label: "Dashboard", emoji: "🏠" },
  { href: "/today", icon: CalendarCheck, label: "Today", emoji: "📅" },
  { href: "/calendar", icon: Calendar, label: "Calendar", emoji: "📆" },
  { href: "/content", icon: PenTool, label: "Content Hub", emoji: "✍️" },
  { href: "/progress", icon: BarChart3, label: "Progress", emoji: "📊" },
  { href: "/blog", icon: FileText, label: "Blog Manager", emoji: "📝" },
  { href: "/freelance", icon: Briefcase, label: "Freelance", emoji: "💼" },
  { href: "/rentlyf", icon: Building2, label: "Rentlyf Log", emoji: "🏠" },
  { href: "/goals", icon: Target, label: "Goals", emoji: "🎯" },
  { href: "/timetable", icon: Clock, label: "Timetable", emoji: "⏰" },
  { href: "/learning", icon: BookOpen, label: "Learning", emoji: "📚" },
  { href: "/settings", icon: Settings, label: "Settings", emoji: "⚙️" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[#2D2D3F] bg-[#0A0A0F]">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-[#2D2D3F] px-5 py-4">
        <Rocket className="h-6 w-6 text-[#6C5CE7]" />
        <span className="text-lg font-bold text-white">Growth Tracker</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#6C5CE7]/15 text-[#6C5CE7]"
                      : "text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#E2E8F0]"
                  )}
                >
                  <span className="text-base">{item.emoji}</span>
                  <span>{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#2D2D3F] px-5 py-3">
        <p className="text-xs text-[#64748B]">Prajjawal Singh</p>
        <p className="text-[10px] text-[#64748B]/60">90-Day Growth Engine</p>
      </div>
    </aside>
  );
}
