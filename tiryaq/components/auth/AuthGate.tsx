'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { usePathname, useRouter } from 'next/navigation';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { fetchMe } from '@/lib/api/auth';
import { clearTokens, isAuthenticated } from '@/lib/api/client';

/** Routes that render without a session. */
const PUBLIC_ROUTES = ['/', '/login'];
const REDIRECT_TARGET = '/login';

/**
 * Keeps protected screens from mounting before a session exists.
 *
 * Without this every page would fire its queries while the store is still
 * empty, hitting the API unauthenticated. Instead:
 *   - public routes render straight away,
 *   - with a stored token we fetch the profile and hydrate the store,
 *   - otherwise (or when the token is rejected) the user goes to /login.
 */
export function AuthGate({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const router = useRouter();
  const pathname = usePathname();
  const user = useAppSelector((state) => state.auth.user);

  const isPublicRoute = PUBLIC_ROUTES.includes(pathname);

  useEffect(() => {
    if (isPublicRoute || user) return;

    if (!isAuthenticated()) {
      router.replace(REDIRECT_TARGET);
      return;
    }

    let cancelled = false;
    fetchMe()
      .then((me) => {
        if (!cancelled) dispatch(setUser(me));
      })
      .catch(() => {
        clearTokens();
        if (!cancelled) router.replace(REDIRECT_TARGET);
      });

    return () => {
      cancelled = true;
    };
  }, [isPublicRoute, user, dispatch, router]);

  if (isPublicRoute || user) return <>{children}</>;

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 bg-[#FFFFFF]">
      <Image src="/tiryaqlogonobg.png" alt="Tiryaq" width={512} height={260} className="h-16 w-[150px] animate-pulse object-contain dark:brightness-0 dark:invert dark:sepia-[.18] dark:saturate-[2] dark:hue-rotate-[160deg]" />
      <p className="text-[13px] font-semibold text-[#5B7184]">Restoring your session…</p>
      <Link href={REDIRECT_TARGET} className="text-[12px] font-bold text-[#075985] hover:underline">
        Sign in instead
      </Link>
    </div>
  );
}
