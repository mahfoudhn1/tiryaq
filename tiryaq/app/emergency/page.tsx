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
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075985]">
            {t('clinicalWorkspace')}
          </p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">
            {t('calculatorsWorkspace')}
          </h1>
          <p className="mt-2 max-w-2xl text-[14px] text-[#5B7184]">
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
                <div className="mb-5 flex items-center gap-3 border-b border-[#0369A1]/15 pb-4">
                  <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0369A1]">
                    <Icon size={18} />
                  </span>

                  <div className="min-w-0">
                    <h2
                      id={`category-${category.id}`}
                      className="text-lg font-bold tracking-[-0.03em] text-[#0F2A3D]"
                    >
                      {t(category.titleKey)}
                    </h2>
                    <p className="mt-0.5 text-[12px] leading-5 text-[#5B7184]">
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
                        className="flex h-full flex-col rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl transition-colors hover:border-[#38BDF8] hover:bg-[#0369A1]/10"
                      >
                        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#0369A1] text-white">
                          <Icon size={18} />
                        </span>

                        <span className="mt-4 text-[15px] font-bold text-[#0F2A3D]">
                          {t(calculator.titleKey)}
                        </span>

                        <span className="mt-2 flex-1 text-[12px] leading-5 text-[#5B7184]">
                          {t(calculator.descriptionKey)}
                        </span>

                        <span className="mt-4 inline-flex items-center gap-1 text-[12px] font-bold text-[#075985]">
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
