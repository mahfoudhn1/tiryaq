'use client';

import { useMemo, useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Bell, CreditCard, Lock, Moon, Sun, User as UserIcon } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { setUser } from '@/store/slices/authSlice';
import { updateMe } from '@/lib/api/auth';
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

const inputClass = 'w-full rounded-xl border border-[#0369A1]/15 bg-white px-3.5 py-2.5 text-[13px] text-[#0F2A3D] placeholder:text-[#5B7184] focus:border-[#0369A1] focus:bg-white focus:outline-none focus:ring-2 focus:ring-[#0369A1]/15';
const labelClass = 'mb-1.5 block text-[12px] font-bold text-[#0F2A3D]';

export default function SettingsPage() {
  const [section, setSection] = useState<SectionId>('profile');
  const user = useAppSelector((s) => s.auth.user);
  const dispatch = useAppDispatch();
  const { language, t } = useLocale();
  const [saved, setSaved] = useState(false);
  const [isDark, setIsDark] = useState(false);
  const resolver = useMemo(() => zodResolver(profileSchema(t)), [t]);

  const { register, handleSubmit, formState: { errors } } = useForm<ProfileForm>({
    resolver,
    defaultValues: { name: user?.name ?? '', email: user?.email ?? '', year: user?.year ?? '' },
  });

  const profileMutation = useMutation({
    mutationFn: (values: ProfileForm) =>
      updateMe({ name: values.name, email: values.email, year: values.year }),
    onSuccess: (me) => {
      dispatch(setUser(me));
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    },
  });

  const onSave = (values: ProfileForm) => profileMutation.mutate(values);
  const changeLanguage = (nextLanguage: Language) => {
    dispatch(setLanguage(nextLanguage));
    window.localStorage.setItem('language', nextLanguage);
  };
  const toggleTheme = () => {
    const nextIsDark = !document.documentElement.classList.contains('dark');
    document.documentElement.classList.toggle('dark', nextIsDark);
    window.localStorage.setItem('theme', nextIsDark ? 'dark' : 'light');
    setIsDark(nextIsDark);
  };

  return (
    <AppShell title={t('settings')}>
      <div className="mx-auto max-w-4xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">{t('settings')}</h1>
          <p className="mt-1 text-[14px] text-[#5B7184]">{t('settingsDescription')}</p>
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
                      section === s.id ? 'bg-[#E0F2FE] text-[#0369A1]' : 'text-[#5B7184] hover:bg-[#0369A1]/10',
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
              <form onSubmit={handleSubmit(onSave)} className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl" noValidate>
                <h2 className="mb-5 text-[16px] font-bold text-[#0F2A3D]">{t('profile')}</h2>

                <div className="mb-6 rounded-xl bg-[#0369A1]/10 p-4">
                  <p className="text-[13px] font-bold text-[#0F2A3D]">{t('language')}</p>
                  <p className="mt-1 text-[12px] text-[#5B7184]">{t('languageDescription')}</p>
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
                            ? 'border-[#0369A1] bg-[#0369A1] text-white'
                            : 'border-[#0369A1]/15 bg-white text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]',
                        )}
                      >
                        {t(label)}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="mb-6 flex items-center justify-between gap-4 rounded-xl bg-[#0369A1]/10 p-4">
                  <div>
                    <p className="text-[13px] font-bold text-[#0F2A3D]">{t('darkMode')}</p>
                    <p className="mt-1 text-[12px] text-[#5B7184]">{t('darkModeDescription')}</p>
                  </div>
                  <button
                    type="button"
                    role="switch"
                    aria-checked={isDark}
                    aria-label={t('darkMode')}
                    onClick={toggleTheme}
                    className={cn(
                      'flex h-9 w-9 shrink-0 items-center justify-center rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2',
                      isDark ? 'border-[#0369A1] bg-[#0369A1] text-white' : 'border-[#0369A1]/15 bg-white text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]',
                    )}
                  >
                    {isDark ? <Sun size={16} /> : <Moon size={16} />}
                  </button>
                </div>

                <div className="mb-6 flex items-center gap-4">
                  <Avatar initials={user.initials} size="lg" />
                  <div>
                    <p className="text-[13px] font-bold text-[#0F2A3D]">{user.name}</p>
                    <Badge variant="teal" className="mt-1">{user.role}</Badge>
                  </div>
                  <button type="button" className="ml-auto rounded-full border border-[#0369A1]/15 px-3 py-1.5 text-[12px] font-bold text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]">
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

                <div className="mt-6 flex flex-wrap items-center gap-3">
                  <Button type="submit" loading={profileMutation.isPending}>{t('saveChanges')}</Button>
                  {saved && <span className="text-[12px] font-semibold text-emerald-600">{t('saved')}</span>}
                  {profileMutation.isError && (
                    <span role="alert" className="text-[12px] font-semibold text-red-500">
                      {(profileMutation.error as Error).message}
                    </span>
                  )}
                </div>
              </form>
            )}

            {section === 'notifications' && (
              <div className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                <h2 className="mb-5 text-[16px] font-bold text-[#0F2A3D]">{t('notifications')}</h2>
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
                <div className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                  <div className="flex items-start justify-between">
                    <div>
                      <h2 className="text-[16px] font-bold text-[#0F2A3D]">{t('currentPlan')}</h2>
                      <p className="mt-1 text-[13px] text-[#5B7184]">{t('freePlan')}</p>
                    </div>
                    <Badge variant="slate">{t('free')}</Badge>
                  </div>

                  <div className="mt-5 rounded-xl bg-[#0369A1]/10 p-5">
                    <p className="text-[13px] font-bold text-[#0F2A3D]">Tiryaq Pro</p>
                    <p className="mt-1 text-[12px] leading-5 text-[#5B7184]">
                      {t('proDescription')}
                    </p>
                    <div className="mt-4 flex items-baseline gap-2">
                      <span className="text-2xl font-bold text-[#0F2A3D]">$19</span>
                      <span className="text-[12px] text-[#5B7184]">{t('perMonth')}</span>
                    </div>
                    <Button className="mt-4">{t('upgradeToPro')}</Button>
                  </div>
                </div>

                <div className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                  <h2 className="mb-4 text-[16px] font-bold text-[#0F2A3D]">{t('paymentMethod')}</h2>
                  <p className="text-[13px] text-[#5B7184]">{t('noPaymentMethod')}</p>
                  <Button variant="secondary" className="mt-4">{t('addPaymentMethod')}</Button>
                </div>
              </div>
            )}

            {section === 'security' && (
              <div className="space-y-4">
                <div className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                  <h2 className="mb-5 text-[16px] font-bold text-[#0F2A3D]">{t('password')}</h2>
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

                <div className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                  <h2 className="mb-2 text-[16px] font-bold text-[#0F2A3D]">{t('twoFactorAuthentication')}</h2>
                  <p className="text-[13px] text-[#5B7184]">{t('twoFactorDescription')}</p>
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
    <div className="flex items-center justify-between gap-4 border-b border-[#0369A1]/10 py-4 last:border-0">
      <div>
        <p className="text-[13px] font-semibold text-[#0F2A3D]">{label}</p>
        <p className="text-[11px] text-[#5B7184]">{desc}</p>
      </div>
      <button
        role="switch"
        aria-checked={on}
        aria-label={label}
        onClick={() => setOn((v) => !v)}
        className={cn(
          'relative h-6 w-11 shrink-0 rounded-full transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#0369A1] focus-visible:ring-offset-2',
          on ? 'bg-[#0369A1]' : 'bg-[#0369A1]/15',
        )}
      >
        <span className={cn('absolute top-0.5 h-5 w-5 rounded-full bg-white transition-transform', on ? 'translate-x-[22px]' : 'translate-x-0.5')} />
      </button>
    </div>
  );
}
