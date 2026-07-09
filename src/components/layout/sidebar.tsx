"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import {
  LayoutDashboard, CalendarCheck, Calendar, TrendingUp, Clock, Target,
  Heart, DollarSign, Users, FileText, PenSquare, BookOpen, Briefcase,
  Code2, Sparkles, Settings, ShieldCheck, Rocket, CheckSquare,
} from "lucide-react";

const ICON_MAP: Record<string, React.ElementType> = {
  LayoutDashboard, CalendarCheck, Calendar, TrendingUp, Clock, Target,
  Heart, DollarSign, Users, FileText, PenSquare, BookOpen, Briefcase,
  Code2, Sparkles, Settings, ShieldCheck, CheckSquare,
};

const SLUG_HREF: Record<string, string> = {
  dashboard: '/',
  today:     '/today',
  calendar:  '/calendar',
  progress:  '/progress',
  timetable: '/timetable',
  goals:     '/goals',
  health:    '/health',
  finance:   '/finance',
  crm:       '/crm',
  content:   '/content',
  blog:      '/blog',
  learning:  '/learning',
  freelance: '/freelance',
  rentlyf:   '/rentlyf',
  habits:    '/habits',
  brand:     '/brand',
  prompt:    '/prompt',
  settings:  '/settings',
};

interface Module {
  id: string
  name: string
  slug: string
  icon: string | null
  sort_order: number
}

interface SidebarProps {
  modules: Module[]
  displayName: string
  isAdmin: boolean
}

export function Sidebar({ modules, displayName, isAdmin }: SidebarProps) {
  const pathname = usePathname();

  return (
    <aside className="fixed left-0 top-0 z-40 flex h-screen w-[240px] flex-col border-r border-[#2D2D3F] bg-[#0A0A0F]">
      {/* Logo */}
      <div className="flex items-center gap-2 border-b border-[#2D2D3F] px-5 py-4">
        <Rocket className="h-6 w-6 text-[#6C5CE7]" />
        <span className="text-lg font-bold text-white">Life OS</span>
      </div>

      {/* Nav */}
      <nav className="flex-1 overflow-y-auto px-3 py-4">
        <ul className="space-y-1">
          {modules.map((mod) => {
            const href = SLUG_HREF[mod.slug] ?? `/${mod.slug}`
            const Icon = ICON_MAP[mod.icon ?? ''] ?? LayoutDashboard
            const isActive = pathname === href
              || (href !== '/' && pathname.startsWith(href))
              || (mod.slug === 'today' && pathname.startsWith('/day/'))

            return (
              <li key={mod.id}>
                <Link
                  href={href}
                  className={cn(
                    "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-[#6C5CE7]/15 text-[#6C5CE7]"
                      : "text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#E2E8F0]"
                  )}
                >
                  <Icon size={16} />
                  <span>{mod.name}</span>
                </Link>
              </li>
            )
          })}

          {/* Admin panel — only visible to super_admin */}
          {isAdmin && (
            <li>
              <Link
                href="/admin"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-all duration-200",
                  pathname.startsWith('/admin')
                    ? "bg-[#FDCB6E]/15 text-[#FDCB6E]"
                    : "text-[#64748B] hover:bg-[#1E1E2E] hover:text-[#E2E8F0]"
                )}
              >
                <ShieldCheck size={16} />
                <span>Admin Panel</span>
              </Link>
            </li>
          )}
        </ul>
      </nav>

      {/* Bottom */}
      <div className="border-t border-[#2D2D3F] px-5 py-3">
        <p className="text-xs font-medium text-[#E2E8F0] truncate">{displayName}</p>
        <p className="text-[10px] text-[#64748B]/60">Life OS v2</p>
      </div>
    </aside>
  );
}
