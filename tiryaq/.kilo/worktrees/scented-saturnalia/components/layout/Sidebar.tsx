'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  PillBottle,
  HeartPulse,
  LayoutDashboard,
  Settings,
  Siren,
  Stethoscope,
  Users,
  Video,
  X,
} from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setSidebarOpen } from '@/store/slices/uiSlice';
import { cn } from '@/lib/utils/cn';
import { UserRole } from '@/types/medical';
import { useLocale } from '@/lib/i18n/useLocale';
import type { TranslationKey } from '@/lib/i18n/translations';

interface NavItem {
  label: TranslationKey;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const NAV: NavItem[] = [
  { label: 'dashboard', href: '/dashboard', icon: LayoutDashboard, roles: ['STUDENT'] },
  { label: 'courses', href: '/courses', icon: BookOpen, roles: ['STUDENT'] },
  { label: 'qbank', href: '/qbank', icon: ClipboardCheck, roles: ['STUDENT'] },
  { label: 'flashcards', href: '/flashcards', icon: BrainCircuit, roles: ['STUDENT'] },
  { label: 'cases', href: '/cases', icon: Stethoscope, roles: ['STUDENT'] },
  { label: 'liveClasses', href: '/live', icon: Video, roles: ['STUDENT'] },
  { label: 'analytics', href: '/analytics', icon: BarChart3, roles: ['STUDENT'] },
  { label: 'clinicalDoseCalculator', href: '/clinical-dose', icon: PillBottle, roles: ['STUDENT'] },
  { label: 'calculatorsWorkspace', href: '/emergency', icon: Siren, roles: ['STUDENT'] },
  { label: 'settings', href: '/settings', icon: Settings, roles: ['STUDENT', 'INSTRUCTOR', 'ADMIN'] },
  // Instructor
  { label: 'dashboard', href: '/instructor', icon: LayoutDashboard, roles: ['INSTRUCTOR'] },
  { label: 'myCourses', href: '/instructor/courses', icon: BookOpen, roles: ['INSTRUCTOR'] },
  { label: 'revenue', href: '/instructor/revenue', icon: BarChart3, roles: ['INSTRUCTOR'] },
  { label: 'students', href: '/instructor/students', icon: Users, roles: ['INSTRUCTOR'] },
  // Admin
  { label: 'dashboard', href: '/admin', icon: LayoutDashboard, roles: ['ADMIN'] },
  { label: 'instructors', href: '/admin/instructors', icon: GraduationCap, roles: ['ADMIN'] },
  { label: 'courses', href: '/admin/courses', icon: BookOpen, roles: ['ADMIN'] },
  { label: 'users', href: '/admin/users', icon: Users, roles: ['ADMIN'] },
];

export function Sidebar() {
  const dispatch = useAppDispatch();
  const pathname = usePathname();
  const user = useAppSelector((s) => s.auth.user);
  const sidebarOpen = useAppSelector((s) => s.ui.sidebarOpen);
  const { t } = useLocale();

  const role = user?.role ?? 'STUDENT';
  const items = NAV.filter((n) => n.roles.includes(role));

  return (
    <>
      {/* Backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-[#0f172a]/30 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-[#dce7eb] bg-white transition-transform duration-200 lg:sticky lg:top-0 lg:h-screen lg:translate-x-0',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-[#dce7eb] px-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Tiryaq home">
            <span className="flex h-9 w-9 items-center justify-center rounded-[11px] bg-[#0f172a] text-white">
              <HeartPulse size={18} strokeWidth={2.4} />
            </span>
            <span>
              <span className="block text-[18px] font-bold leading-none tracking-[-0.05em] text-[#0f172a]">tiryaq</span>
              <span className="mt-0.5 block text-[8px] font-bold leading-none tracking-[0.16em] text-[#0e7490]">
                {role === 'INSTRUCTOR' ? t('instructorPortal') : role === 'ADMIN' ? t('adminConsole') : t('studentPortal')}
              </span>
            </span>
          </Link>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="rounded-lg p-1.5 text-[#64748b] hover:bg-[#f1f5f9] lg:hidden"
            aria-label={t('closeSidebar')}
          >
            <X size={18} />
          </button>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto px-3 py-4" aria-label={t('mainNavigation')}>
          <ul className="space-y-0.5" role="list">
            {items.map((item) => {
              const active = pathname === item.href || (item.href !== '/dashboard' && item.href !== '/instructor' && item.href !== '/admin' && pathname.startsWith(item.href));
              return (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    onClick={() => dispatch(setSidebarOpen(false))}
                    className={cn(
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors',
                      active
                        ? 'bg-[#e0f7f7] text-[#0e7490]'
                        : 'text-[#64748b] hover:bg-[#f8fafc] hover:text-[#0f172a]',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon size={17} className={active ? 'text-[#0e7490]' : 'text-[#94a3b8] group-hover:text-[#64748b]'} />
                    {t(item.label)}
                    {active && <ChevronRight size={14} className="ml-auto opacity-60" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        {user && (
          <div className="shrink-0 border-t border-[#dce7eb] p-4">
            <div className="flex items-center gap-3 rounded-xl bg-[#f8fafc] px-3 py-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-bold text-[#1e3a8a]">
                {user.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold text-[#0f172a]">{user.name}</div>
                <div className="text-[10px] text-[#64748b]">{user.year ?? user.specialty ?? t(user.role.toLowerCase() as TranslationKey)}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
