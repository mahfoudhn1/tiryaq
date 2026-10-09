'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import {
  BarChart3,
  BookOpen,
  BrainCircuit,
  ChevronRight,
  ClipboardCheck,
  GraduationCap,
  PillBottle,
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
          className="fixed inset-0 z-30 bg-[#082F49]/40 backdrop-blur-sm lg:hidden"
          onClick={() => dispatch(setSidebarOpen(false))}
          aria-hidden
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          'fixed inset-y-0 start-0 z-40 flex w-64 flex-col overflow-hidden rounded-e-3xl border-e border-white/20 bg-[#075985]/90 bg-gradient-to-b from-[#38BDF8]/6 via-transparent to-[#0C4A6E]/35 shadow-[10px_0_44px_rgba(6,45,70,0.25),inset_1px_0_0_rgba(255,255,255,0.14)] backdrop-blur-2xl transition-transform duration-300 ease-out lg:sticky lg:top-0 lg:h-screen lg:translate-x-0 lg:rounded-e-none',
          sidebarOpen ? 'translate-x-0' : '-translate-x-full rtl:translate-x-full',
        )}
      >
        {/* Logo */}
        <div className="flex h-[68px] shrink-0 items-center justify-between border-b border-white/15 px-5">
          <Link href="/" className="flex items-center gap-3" aria-label="Tiryaq home">
            <span className="flex h-12 w-[104px] items-center justify-center overflow-hidden rounded-[9px] bg-[#F0F9FF] px-1.5">
              <Image src="/tiryaqlogo.svg" alt="Tiryaq" width={256} height={166} className="h-11 w-full object-contain" />
            </span>
          </Link>
          <button
            onClick={() => dispatch(setSidebarOpen(false))}
            className="rounded-lg p-1.5 text-[#DCEEFC] hover:bg-white/10 hover:text-white lg:hidden"
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
                      'group flex items-center gap-3 rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-all duration-200',
                      active
                        ? 'bg-[#E0F2FE] text-[#0C4A6E] shadow-[0_6px_16px_rgba(6,58,90,0.25)]'
                        : 'text-[#DCEEFC] hover:translate-x-0.5 hover:bg-white/10 hover:text-white rtl:hover:-translate-x-0.5',
                    )}
                    aria-current={active ? 'page' : undefined}
                  >
                    <item.icon size={17} className={active ? 'text-[#0369A1]' : 'text-[#A9D8F5] group-hover:text-white'} />
                    {t(item.label)}
                    {active && <ChevronRight size={14} className="ms-auto opacity-60 rtl:rotate-180" />}
                  </Link>
                </li>
              );
            })}
          </ul>
        </nav>

        {/* User footer */}
        {user && (
          <div className="shrink-0 border-t border-white/15 p-4">
            <div className="flex items-center gap-3 rounded-xl border border-white/15 bg-white/10 px-3 py-3 backdrop-blur-md transition-colors">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#E0F2FE] text-[11px] font-bold text-[#0C4A6E]">
                {user.initials}
              </span>
              <div className="min-w-0">
                <div className="truncate text-[12px] font-bold text-white">{user.name}</div>
                <div className="text-[10px] text-[#DCEEFC]">{user.year ?? user.specialty ?? t(user.role.toLowerCase() as TranslationKey)}</div>
              </div>
            </div>
          </div>
        )}
      </aside>
    </>
  );
}
