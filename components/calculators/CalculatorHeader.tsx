'use client';

import { Activity } from 'lucide-react';

import { useLocale } from '@/lib/i18n/useLocale';
import type { CalculatorDefinition } from '@/lib/calculators/types';

interface CalculatorHeaderProps {
  calculator: CalculatorDefinition;
}

export function CalculatorHeader({ calculator }: CalculatorHeaderProps) {
  const { t } = useLocale();

  return (
    <header className="mb-8 border-b border-[#dce7eb] pb-6 dark:border-[#304950]">
      <div className="mb-3 inline-flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.16em] text-[#0e7490]">
        <Activity size={14} />
        {t(calculator.categoryKey)}
      </div>
      <h1 className="text-3xl font-bold tracking-tighter sm:text-4xl">{t(calculator.titleKey)}</h1>
      <p className="mt-2 max-w-2xl text-sm leading-6 text-[#64748b] dark:text-[#a9bbc1]">
        {t(calculator.descriptionKey)}
      </p>
    </header>
  );
}
