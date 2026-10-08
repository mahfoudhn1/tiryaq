'use client';

import Link from 'next/link';
import { ChevronRight, HeartPulse, Siren } from 'lucide-react';

import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { useLocale } from '@/lib/i18n/useLocale';
import { CALCULATOR_CATEGORIES, getCalculatorsByCategory } from '@/lib/calculators';

const CATEGORY_ICONS: Record<string, React.ElementType> = {
  emergencyAndTrauma: Siren,
  cardiology: HeartPulse,
};

export default function EmergencyCalculatorsPage() {
  const { t } = useLocale();

  return (
    <AppShell title={t('calculatorsWorkspace')}>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        <header className="mb-10">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">
            {t('clinicalWorkspace')}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">
            {t('calculatorsWorkspace')}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[#64748b]">
            {t('calculatorsWorkspaceDescription')}
          </p>
        </header>

        <div className="space-y-10">
          {CALCULATOR_CATEGORIES.map((category) => {
            const calculators = getCalculatorsByCategory(category.id);
            if (calculators.length === 0) return null;

            const Icon = CATEGORY_ICONS[category.id] ?? HeartPulse;

            return (
              <section key={category.id} aria-labelledby={`category-${category.id}`}>
                <div className="mb-5 flex items-center gap-3 border-b border-[#dce7eb] pb-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#e0f7f7] text-[#0e7490]">
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0">
                    <h2
                      id={`category-${category.id}`}
                      className="text-lg font-bold tracking-[-0.03em] text-[#0f172a]"
                    >
                      {t(category.titleKey)}
                    </h2>
                    <p className="mt-0.5 text-[12px] leading-5 text-[#64748b]">
                      {t(category.descriptionKey)}
                    </p>
                  </div>

                  <Badge variant="teal" className="ml-auto shrink-0">
                    {calculators.length}{' '}
                    {t(calculators.length === 1 ? 'calculator' : 'calculators')}
                  </Badge>
                </div>

                <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3" role="list">
                  {calculators.map((calculator) => (
                    <li key={calculator.id}>
                      <Link
                        href={`/emergency/${calculator.slug}`}
                        className="flex h-full flex-col rounded-2xl border border-[#dce7eb] bg-white p-5 transition-colors hover:border-[#8ecfd3] hover:bg-[#f0fdfd]"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0e7490] text-white">
                          <Icon size={18} />
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
              </section>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
