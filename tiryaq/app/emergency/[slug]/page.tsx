'use client';

import { use } from 'react';
import Link from 'next/link';
import { ChevronRight } from 'lucide-react';

import { AppShell } from '@/components/layout/AppShell';
import { CalculatorView } from '@/components/calculators/CalculatorView';
import { useLocale } from '@/lib/i18n/useLocale';
import { getCalculatorBySlug } from '@/lib/calculators';

export default function EmergencyCalculatorPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = use(params);
  const { t } = useLocale();
  const calculator = getCalculatorBySlug(slug);

  if (!calculator) {
    return (
      <AppShell>
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <p className="text-[16px] font-bold text-[#0F2A3D]">{t('calculatorNotFound')}</p>
          <Link
            href="/emergency"
            className="mt-3 inline-flex items-center gap-1 text-[13px] font-semibold text-[#075985] hover:underline"
          >
            {t('backToEmergency')}
            <ChevronRight size={14} />
          </Link>
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t(calculator.titleKey)}>
      <CalculatorView calculator={calculator} />
    </AppShell>
  );
}
