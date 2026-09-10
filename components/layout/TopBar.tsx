'use client';

import Link from 'next/link';
import { Bell, Menu, ShoppingCart } from 'lucide-react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { toggleSidebar } from '@/store/slices/uiSlice';
import { switchRole } from '@/store/slices/authSlice';
import { markAllRead } from '@/store/slices/notificationsSlice';
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

  const [notifOpen, setNotifOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);

  return (
    <header className="sticky top-0 z-20 flex h-[68px] shrink-0 items-center justify-between border-b border-[#dce7eb] bg-white/90 px-5 backdrop-blur-xl">
      {/* Left: hamburger + title */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => dispatch(toggleSidebar())}
          className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] lg:hidden"
          aria-label={t('openSidebar')}
        >
          <Menu size={20} />
        </button>
        {title && <h1 className="hidden text-[15px] font-bold text-[#0f172a] sm:block">{title}</h1>}
      </div>

      {/* Right: actions */}
      <div className="flex items-center gap-2">
        {/* Cart */}
        <Link
          href="/courses"
          className="relative rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
          aria-label={t('cart')}
        >
          <ShoppingCart size={20} />
          {cartCount > 0 && (
            <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-[#0e7490] text-[9px] font-bold text-white">
              {cartCount}
            </span>
          )}
        </Link>

        {/* Notifications */}
        <div className="relative">
          <button
            onClick={() => { setNotifOpen((v) => !v); setRoleOpen(false); }}
            className="relative rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
            aria-label={t('notifications')}
            aria-expanded={notifOpen}
          >
            <Bell size={20} />
            {unread > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[9px] font-bold text-white">
                {unread}
              </span>
            )}
          </button>

          {notifOpen && (
            <div className="absolute right-0 top-12 z-50 w-80 rounded-2xl border border-[#dce7eb] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
              <div className="flex items-center justify-between border-b border-[#dce7eb] px-4 py-3">
                <span className="text-[13px] font-bold text-[#0f172a]">{t('notifications')}</span>
                <button
                  onClick={() => dispatch(markAllRead())}
                  className="text-[11px] font-semibold text-[#0e7490] hover:underline"
                >
                  {t('markAllRead')}
                </button>
              </div>
              <ul className="max-h-72 overflow-y-auto">
                {notifications.map((n) => (
                  <li key={n.id} className={cn('border-b border-[#f1f5f9] px-4 py-3 last:border-0', !n.read && 'bg-[#f0fdfd]')}>
                    <div className="flex items-start gap-2">
                      {!n.read && <span className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-[#0e7490]" aria-hidden />}
                      <div className={cn(!n.read ? '' : 'ml-4')}>
                        <p className="text-[12px] font-bold text-[#0f172a]">{n.title}</p>
                        <p className="mt-0.5 text-[11px] leading-4 text-[#64748b]">{n.body}</p>
                        <p className="mt-1 text-[10px] text-[#94a3b8]">{n.createdAt}</p>
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
              className="flex items-center gap-2.5 rounded-xl border border-[#e2eaee] bg-[#f8fafc] px-3 py-2 hover:border-[#8ecfd3]"
              aria-label="User menu"
              aria-expanded={roleOpen}
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#dbeafe] text-[11px] font-bold text-[#1e3a8a]">
                {user.initials}
              </span>
              <span className="hidden text-[12px] font-semibold text-[#0f172a] sm:block">{user.name}</span>
            </button>

            {roleOpen && (
              <div className="absolute right-0 top-12 z-50 w-52 rounded-2xl border border-[#dce7eb] bg-white shadow-[0_16px_40px_rgba(15,23,42,0.12)]">
                <div className="border-b border-[#dce7eb] px-4 py-3">
                  <p className="text-[12px] font-bold text-[#0f172a]">{user.name}</p>
                  <p className="text-[10px] text-[#64748b]">{user.email}</p>
                </div>
                <div className="px-3 py-2">
                  <p className="mb-1 px-1 text-[10px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">{t('switchRole')}</p>
                  {(['STUDENT', 'INSTRUCTOR', 'ADMIN'] as UserRole[]).map((role) => (
                    <button
                      key={role}
                      onClick={() => { dispatch(switchRole(role)); setRoleOpen(false); }}
                      className={cn(
                        'w-full rounded-lg px-3 py-2 text-left text-[12px] font-semibold transition-colors',
                        user.role === role ? 'bg-[#e0f7f7] text-[#0e7490]' : 'text-[#64748b] hover:bg-[#f1f5f9]',
                      )}
                    >
                      {t(ROLE_LABELS[role])}
                    </button>
                  ))}
                </div>
                <div className="border-t border-[#dce7eb] px-3 py-2">
                  <Link href="/settings" onClick={() => setRoleOpen(false)} className="block rounded-lg px-3 py-2 text-[12px] font-semibold text-[#64748b] hover:bg-[#f1f5f9]">
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
