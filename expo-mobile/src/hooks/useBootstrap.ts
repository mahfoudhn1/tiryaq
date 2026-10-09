import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser, clearUser } from '@/store/slices/authSlice';
import { hydrateSettings } from '@/store/slices/settingsSlice';
import { getAccessToken, clearTokens } from '@/api/client';
import { fetchMe } from '@/api/auth';

const SETTINGS_KEY = 'tiryaq.settings';
const BOOTSTRAP_TIMEOUT_MS = 5_000;

/**
 * Boots the app once: restores persisted settings (theme/language/notifications)
 * and the auth session, then reports readiness so we don't flash the wrong theme.
 */
export function useBootstrap(minimumSplashMs = 0) {
  const dispatch = useAppDispatch();
  const hydrated = useAppSelector((s) => s.settings.hydrated);
  const themeMode = useAppSelector((s) => s.settings.themeMode);
  const language = useAppSelector((s) => s.settings.language);
  const notifications = useAppSelector((s) => s.settings.notifications);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let mounted = true;
    const startedAt = Date.now();
    let splashTimeout: ReturnType<typeof setTimeout> | undefined;
    const bootstrapTimeout = setTimeout(() => {
      if (mounted) setLoading(false);
    }, BOOTSTRAP_TIMEOUT_MS);

    async function init() {
      try {
        const raw = await AsyncStorage.getItem(SETTINGS_KEY);
        if (raw) {
          const parsed = JSON.parse(raw);
          if (mounted) dispatch(hydrateSettings(parsed));
        } else if (mounted) {
          dispatch(hydrateSettings({}));
        }
      } catch {
        if (mounted) dispatch(hydrateSettings({}));
      }

      try {
        const token = await getAccessToken();
        if (token) {
          const user = await fetchMe();
          if (mounted) dispatch(setUser(user));
        }
      } catch {
        await clearTokens();
        if (mounted) dispatch(clearUser());
      } finally {
        clearTimeout(bootstrapTimeout);
        if (mounted) {
          const remaining = Math.max(0, minimumSplashMs - (Date.now() - startedAt));
          splashTimeout = setTimeout(() => {
            if (mounted) setLoading(false);
          }, remaining);
        }
      }
    }

    void init();
    return () => {
      mounted = false;
      clearTimeout(bootstrapTimeout);
      if (splashTimeout) clearTimeout(splashTimeout);
    };
  }, [dispatch, minimumSplashMs]);

  useEffect(() => {
    if (!hydrated) return;
    void AsyncStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ themeMode, language, notifications }),
    );
  }, [hydrated, themeMode, language, notifications]);

  return { loading };
}
