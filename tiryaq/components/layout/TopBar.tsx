'use client';

import Link from 'next/link';
import { Bell, Menu, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { setUser } from '@/store/slices/authSlice';
import { markAllRead } from '@/store/slices/notificationsSlice';
import { demoLogin } from '@/lib/api/auth';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { cn } from '@/lib/utils/cn';
import { UserRole } from '@/types/medical';
import { useLocale } from '@/lib/i18n/useLocale';

const ROLE_LABELS: Record<UserRole, 'student' | 'instructor' | 'admin'> = {
  STUDENT: 'student',
  INSTRUCTOR: 'instructor',
  ADMIN: 'admin',
};

export function TopBar({ title }: { title?: string }) {
  const dispatch = useAppDispatch();
  const user = useAppSelector((s) => s.auth.user);
  const notifications = useAppSelector((s) => s.notifications.items);
  const cartCount = useAppSelector((s) => s.cart.items.length);
  const unread = notifications.filter((n) => !n.read).length;
  const { t } = useLocale();

  const router = useRouter();
  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [switching, setSwitching] = useState(false);

  // Signing in as another demo account swaps the whole session (JWT + user).
  const changeRole = async (role: UserRole) => {
    setSwitching(true);
    try {
      const auth = await demoLogin(role);
      dispatch(setUser(auth.user));
      setRoleOpen(false);
      router.push(role === 'ADMIN' ? '/admin' : role === 'INSTRUCTOR' ? '/instructor' : '/dashboard');
    } finally {
      setSwitching(false);
    }
  };

  return (
    <header className="sticky top-0 z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-white/20 bg-[#075985]/90 bg-gradient-to-b from-[#38BDF8]/6 via-transparent to-[#0C4A6E]/35 px-5 shadow-[0_16px_40px_rgba(6,45,70,0.18),inset_0_1px_0_rgba(255,255,255,0.18)] backdrop-blur-2xl">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-lg p-2 text-[#DCEEFC] hover:bg-white/10 hover:text-white lg:hidden"
          aria-label={t('openSidebar')}
        >
          <Menu size={20} />
        </button>
        {title && <h1 className="hidden text-[15px] font-bold text-white sm:block">{title}</h1>}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Cart */}
        <Link
          href="/courses"
          className="relative rounded-lg p-2 text-[#DCEEFC] hover:bg-white/10 hover:text-white"
          aria-label={t('cart')}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#F0F9FF] text-[9px] font-bold text-[#0369A1]">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setRoleOpen(false); }}
            className="relative rounded-lg p-2 text-[#DCEEFC] hover:bg-white/10 hover:text-white"
            aria-label={t('notifications')}
            aria-expanded={notifOpen}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#DC2626] text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="glass-pop absolute right-0 top-12 z-50 w-80 overflow-hidden rounded-2xl border border-white/60 bg-white/92 shadow-[0_20px_50px_rgba(6,45,70,0.22)] backdrop-blur-2xl">
              <div className="flex items-center justify-between border-b border-[#0369A1]/10 px-4 py-3">
                <span className="text-[13px] font-bold text-[#0F2A3D]">{t('notifications')}</span>
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-[11px] font-semibold text-[#075985] hover:underline"
                >
                  {t('markAllRead')}
                </button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={cn('border-b border-[#0369A1]/10 px-4 py-3 last:border-0', !n.read && 'bg-[#0369A1]/10')}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0284C7]" aria-hidden />}
                      <div className={cn(!n.read ? '' : 'ml-4')}>
                        <p className="text-[12px] font-bold text-[#0F2A3D]">{n.title}</p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#5B7184]">{n.body}</p>
                        <p className="mt-1 text-[10px] text-[#5B7184]">{n.createdAt}</p>
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>

        {/* User / role switcher */}
        {user && (
          <div className="relative">
            <button
              onClick={() => { setRoleOpen((v) => !v); setNotifOpen(false); }}
              className="flex items-center gap-2.5 rounded-xl border border-white/25 bg-[#0C4A6E]/50 px-3 py-2 backdrop-blur-md transition-all duration-200 hover:border-white/50 hover:bg-[#0C4A6E]/70"
              aria-label="User menu"
              aria-expanded={roleOpen}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#E0F2FE] text-[11px] font-bold text-[#0C4A6E]">
                {user.initials}
              </span>
              <span className="hidden text-[12px] font-semibold text-white sm:block">{user.name}</span>
            </button>

            {roleOpen && (
              <div className="glass-pop absolute right-0 top-12 z-50 w-52 overflow-hidden rounded-2xl border border-white/60 bg-white/92 shadow-[0_20px_50px_rgba(6,45,70,0.22)] backdrop-blur-2xl">
                <div className="border-b border-[#0369A1]/10 px-4 py-3">
                  <p className="text-[12px] font-bold text-[#0F2A3D]">{user.name}</p>
                  <p className="text-[10px] text-[#5B7184]">{user.email}</p>
                </div>
                <div className="px-3 py-2">
                  <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#5B7184]">{t('switchRole')}</p>
                  {(['STUDENT', 'INSTRUCTOR', 'ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => void changeRole(role)}
                      disabled={switching}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition-colors disabled:opacity-50',
                        user.role === role ? 'bg-[#E0F2FE] text-[#0369A1]' : 'text-[#5B7184] hover:bg-[#0369A1]/10',
                      )}
                    >
                      {t(ROLE_LABELS[role])}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#0369A1]/10 px-3 py-2">
                  <Link href="/settings" onClick={() => setRoleOpen(false)} className="block rounded-lg px-3 py-2 text-[12px] font-semibold text-[#5B7184] hover:bg-[#0369A1]/10">
                    {t('settings')}
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
}
