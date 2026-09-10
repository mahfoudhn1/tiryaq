'use client';

import { useMemo, useState } from 'react';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, CreditCard, Lock, User as UserIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setLanguage, type Language } from '@/store/slices/localeSlice';
import { useLocale } from '@/lib/i18n/useLocale';
import type { TranslationKey } from '@/lib/i18n/translations';
import { zodResolver } from '@/lib/utils/zodResolver';
import { cn } from '@/lib/utils/cn';

const SECTIONS = [
  { id: 'profile', label: 'profile', icon: UserIcon },
  { id: 'notifications', label: 'notifications', icon: Bell },
  { id: 'subscription', label: 'subscription', icon: CreditCard },
  { id: 'security', label: 'security', icon: Lock },
] as const;

type SectionId = typeof SECTIONS[number]['id'];

const profileSchema = (t: (key: TranslationKey) => string) => z.object({
  name: z.string().min(2, t('enterName')),
  email: z.string().email(t('enterEmail')),
  year: z.string().optional(),
});

type ProfileForm = z.infer<ReturnType<typeof profileSchema>>;

const inputClass = 'w-full rounded-xl border border-[#dce7eb] bg-[#f8fafc] px-3.5 py-2.5 text-[13px] text-[#0f172a] placeholder:text-[#94a3b8] focus:border-[#0e7490] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0e7490]/15';
const labelClass = 'mb-1.5 block text-[12px] font-bold text-[#0f172a]';

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId>('profile');
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const { language, t } = useLocale();
  const [saved, setSaved] = useState(false);
  const resolver = useMemo(() => zodResolver(profileSchema(t)), [t]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver,
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', year: user?.year ?? '' },
  });

  const onSave = () => { setSaved(true); setTimeout(() => setSaved(false), 2500); };
  const changeLanguage = (nextLanguage: Language) => {
    dispatch(setLanguage(nextLanguage));
    window.localStorage.setItem('language', nextLanguage);
  };

  return (
    <AppShell title={t('settings')}>
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">{t('settings')}</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">{t('settingsDescription')}</p>
        </div>

        <div className="flex flex-col gap-8 sm:flex-row">
          {/* Section nav */}
          <nav className="sm:w-48 shrink-0" aria-label="Settings sections">
            <ul className="flex gap-1 overflow-x-auto sm:flex-col sm:overflow-visible" role="list">
              {SECTIONS.map((s) => (
                <li key={s.id}>
                  <button
                    onClick={() => setSection(s.id)}
                    className={cn(
                      'flex w-full items-center gap-2.5 whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-semibold transition-colors',
                      section === s.id ? 'bg-[#e0f7f7] text-[#0e7490]' : 'text-[#64748b] hover:bg-[#f8fafc]',
                    )}
                    aria-current={section === s.id ? 'page' : undefined}
                  >
                    <s.icon size={16} />
                    {t(s.label)}
                  </button>
                </li>
              ))}
            </ul>
          </nav>

          {/* Section content */}
          <div className="min-w-0 flex-1">
            {section === 'profile' && user && (
              <form onSubmit={handleSubmit(onSave)} className="rounded-2xl border border-[#dce7eb] bg-white p-6" noValidate>
                <h2 className="mb-5 text-[16px] font-bold text-[#0f172a]">{t('profile')}</h2>

                <div className="mb-6 rounded-xl bg-[#f8fafc] p-4">
                  <p className="text-[13px] font-bold text-[#0f172a]">{t('language')}</p>
                  <p className="mt-1 text-[12px] text-[#64748b]">{t('languageDescription')}</p>
                  <div className="mt-3 flex flex-wrap gap-2" role="group" aria-label={t('language')}>
                    {([
                      ['en', 'english'],
                      ['fr', 'french'],
                      ['ar', 'arabic'],
                    ] as const).map(([code, label]) => (
                      <button
                        key={code}
                        type="button"
                        onClick={() => changeLanguage(code)}
                        aria-pressed={language === code}
                        className={cn(
                          'rounded-full border px-3 py-1.5 text-[12px] font-bold transition-colors',
                          language === code
                            ? 'border-[#0e7490] bg-[#0e7490] text-white'
                            : 'border-[#dce7eb] bg-white text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]',
                        )}
                      >
                        {t(label)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 flex items-center gap-4">
                  <Avatar initials={user.initials} size="lg" />
                  <div>
                    <p className="text-[13px] font-bold text-[#0f172a]">{user.name}</p>
                    <Badge variant="teal" className="mt-1">{user.role}</Badge>
                  </div>
                  <button type="button" className="ml-auto rounded-full border border-[#dce7eb] px-3 py-1.5 text-[12px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
                    {t('changePhoto')}
                  </button>
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label htmlFor="name" className={labelClass}>{t('fullName')}</label>
                    <input id="name" {...register('name')} className={inputClass} aria-invalid={!!errors.name} />
                    {errors.name && <p className="mt-1 text-[11px] text-red-500">{errors.name.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="email" className={labelClass}>{t('email')}</label>
                    <input id="email" type="email" {...register('email')} className={inputClass} aria-invalid={!!errors.email} />
                    {errors.email && <p className="mt-1 text-[11px] text-red-500">{errors.email.message}</p>}
                  </div>
                  <div>
                    <label htmlFor="year" className={labelClass}>{t('yearOfStudy')}</label>
                    <input id="year" {...register('year')} placeholder="MS-V" className={inputClass} />
                  </div>
                </div>

                <div className="mt-6 flex items-center gap-3">
                  <Button type="submit">{t('saveChanges')}</Button>
                  {saved && <span className="text-[12px] font-semibold text-emerald-600">{t('saved')}</span>}
                </div>
              </form>
            )}

            {section === 'notifications' && (
              <div className="rounded-2xl border border-[#dce7eb] bg-white p-6">
                <h2 className="mb-5 text-[16px] font-bold text-[#0f172a]">{t('notifications')}</h2>
                <div className="space-y-1">
                  {[
                    { label: t('dailyReminders'), desc: t('dailyRemindersDescription'), on: true },
                    { label: t('liveAlerts'), desc: t('liveAlertsDescription'), on: true },
                    { label: t('streakWarnings'), desc: t('streakWarningsDescription'), on: true },
                    { label: t('courseAnnouncements'), desc: t('courseAnnouncementsDescription'), on: false },
                    { label: t('weeklySummary'), desc: t('weeklySummaryDescription'), on: true },
                  ].map((n) => (
                    <ToggleRow key={n.label} label={n.label} desc={n.desc} defaultOn={n.on} />
                  ))}
                </div>
              </div>
            )}

            {section === 'subscription' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#dce7eb] bg-white p-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[16px] font-bold text-[#0f172a]">{t('currentPlan')}</h2>
                      <p className="mt-1 text-[13px] text-[#64748b]">{t('freePlan')}</p>
                    </div>
                    <Badge variant="slate">{t('free')}</Badge>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#f8fafc] p-5">
                    <p className="text-[13px] font-bold text-[#0f172a]">Tiryaq Pro</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#64748b]">
                      {t('proDescription')}
                    </p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0f172a]">$19</span>
                      <span className="text-[12px] text-[#64748b]">{t('perMonth')}</span>
                    </div>
                    <Button className="mt-4">{t('upgradeToPro')}</Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#dce7eb] bg-white p-6">
                  <h2 className="mb-4 text-[16px] font-bold text-[#0f172a]">{t('paymentMethod')}</h2>
                  <p className="text-[13px] text-[#64748b]">{t('noPaymentMethod')}</p>
                  <Button variant="secondary" className="mt-4">{t('addPaymentMethod')}</Button>
                </div>
              </div>
            )}

            {section === 'security' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#dce7eb] bg-white p-6">
                  <h2 className="mb-5 text-[16px] font-bold text-[#0f172a]">{t('password')}</h2>
                  <div className="space-y-4">
                    <div>
                      <label htmlFor="current" className={labelClass}>{t('currentPassword')}</label>
                      <input id="current" type="password" className={inputClass} autoComplete="current-password" />
                    </div>
                    <div>
                      <label htmlFor="new" className={labelClass}>{t('newPassword')}</label>
                      <input id="new" type="password" className={inputClass} autoComplete="new-password" />
                    </div>
                  </div>
                  <Button className="mt-5">{t('updatePassword')}</Button>
                </div>

                <div className="rounded-2xl border border-[#dce7eb] bg-white p-6">
                  <h2 className="mb-2 text-[16px] font-bold text-[#0f172a]">{t('twoFactorAuthentication')}</h2>
                  <p className="text-[13px] text-[#64748b]">{t('twoFactorDescription')}</p>
                  <Button variant="secondary" className="mt-4">{t('enable2FA')}</Button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </AppShell>
  );
}

function ToggleRow({ label, desc, defaultOn }: { label: string; desc: string; defaultOn: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-center justify-between gap-4 border-b border-[#f1f5f9] py-4 last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-[#0f172a]">{label}</p>
        <p className="text-[11px] text-[#64748b]">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0e7490] focus-visible:ring-offset-2',
          on ? 'bg-[#0e7490]' : 'bg-[#cbd5e1]',
        )}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', on ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}
