'use client';

import { store } from '@/store/store';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Provider } from 'react-redux';
import { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { LANGUAGES, setLanguage, type Language } from '@/store/slices/localeSlice';

function LocaleInitializer({ children }: { children: React.ReactNode }) {
  const dispatch = useAppDispatch();
  const language = useAppSelector((state) => state.locale.language);

  useEffect(() => {
    const storedLanguage = window.localStorage.getItem('language');
    if (storedLanguage && LANGUAGES.includes(storedLanguage as Language)) {
      dispatch(setLanguage(storedLanguage as Language));
    }
  }, [dispatch]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  return children;
}

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: { queries: { staleTime: 30_000, retry: 1 } },
  }));

  return (
    <Provider store={store}>
      <LocaleInitializer>
        <QueryClientProvider client={queryClient}>
          {children}
        </QueryClientProvider>
      </LocaleInitializer>
    </Provider>
  );
}
