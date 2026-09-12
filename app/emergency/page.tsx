'use client';

import Link from 'next/link';
import { ChevronRight, HeartPulse } from 'lucide-react';

import { AppShell } from '@/components/layout/AppShell';
import { useLocale } from '@/lib/i18n/useLocale';
import { CALCULATORS } from '@/lib/calculators';

export default function EmergencyCalculatorsPage() {
  const { t } = useLocale();

  return (
    <AppShell title={t('emergencyAndTrauma')}>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">
            {t('clinicalWorkspace')}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">
            {t('emergencyAndTrauma')}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[#64748b]">
            {t('emergencyAndTraumaDescription')}
          </p>
        </header>

        <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
          {CALCULATORS.map((calculator) => (
            <li key={calculator.id}>
              <Link
                href={`/emergency/${calculator.slug}`}
                className="flex h-full flex-col rounded-2xl border border-[#dce7eb] bg-white p-5 transition-colors hover:border-[#8ecfd3] hover:bg-[#f0fdfd]"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e7490] text-white">
                  <HeartPulse size={18} />
                </span>

                <span className="mt-4 text-[15px] font-bold text-[#0f172a]">
                  {t(calculator.titleKey)}
                </span>

                <span className="mt-2 flex-1 text-[12px] leading-5 text-[#64748b]">
                  {t(calculator.descriptionKey)}
                </span>

                <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-[#0e7490]">
                  {t('openCalculator')}
                  <ChevronRight size={14} />
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </AppShell>
  );
}
