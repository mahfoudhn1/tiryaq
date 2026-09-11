'use client';

import { ClinicalDoseCalculator } from '@/components/ClinicalDoseCalculator';
import { AppShell } from '@/components/layout/AppShell';
import { useLocale } from '@/lib/i18n/useLocale';

export default function ClinicalDosePage() {
  const { t } = useLocale();

  return (
    <AppShell title={t('clinicalDoseCalculator')}>
      <ClinicalDoseCalculator />
    </AppShell>
  );
}