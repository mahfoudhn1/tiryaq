'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  AlertCircle, BarChart3, Clock, Target, TrendingUp,
} from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getStudyAnalytics } from '@/services/studyService';
import { cn } from '@/lib/utils/cn';

const EXAM_SCORES = [
  { label: 'Knowledge', score: 78, desc: 'Factual recall across all subjects' },
  { label: 'Retention', score: 86, desc: 'Long-term card retention rate' },
  { label: 'Clinical reasoning', score: 80, desc: 'Case simulation performance' },
  { label: 'Question performance', score: 74, desc: 'QBank accuracy over last 30 days' },
  { label: 'Consistency', score: 90, desc: 'Daily study streak and habit score' },
];

const OVERALL_READINESS = Math.round(EXAM_SCORES.reduce((a, s) => a + s.score, 0) / EXAM_SCORES.length);

const WEAK_TOPICS = [
  { subject: 'Renal / Nephrology', score: 62, avg: 78 },
  { subject: 'Pulmonology', score: 74, avg: 78 },
];

export default function AnalyticsPage() {
  const [tab, setTab] = useState<'overview' | 'exam'>('overview');

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['analytics'],
    queryFn: getStudyAnalytics,
  });

  const maxReviewed = analytics ? Math.max(...analytics.progress.reviewHistory.map((d) => d.reviewedCount)) : 1;

  return (
    <AppShell title="Analytics">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Performance</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Analytics</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">Your clinical knowledge mastery and study patterns at a glance.</p>
        </div>

        {/* Tab switcher */}
        <div className="mb-8 flex gap-2" role="tablist">
          {(['overview', 'exam'] as const).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn('rounded-full px-4 py-2 text-[13px] font-semibold capitalize transition-colors', tab === t ? 'bg-[#0e7490] text-white' : 'border border-[#dce7eb] bg-white text-[#64748b] hover:border-[#8ecfd3]')}
            >
              {t === 'overview' ? 'Overview' : 'Exam Readiness'}
            </button>
          ))}
        </div>

        {isLoading ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : analytics ? (
          tab === 'overview' ? (
            <>
              {/* Stats */}
              <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                <StatCard label="Study streak" value={analytics.progress.streakDays} detail="days" icon={TrendingUp} color="teal" />
                <StatCard label="Accuracy" value={`${analytics.progress.accuracyRate.toFixed(1)}%`} icon={Target} color="blue" progress={analytics.progress.accuracyRate} />
                <StatCard label="Hours studied" value={analytics.totalHoursStudied} icon={Clock} color="amber" />
                <StatCard label="Retention" value={`${analytics.cardsRetentionRate.toFixed(0)}%`} icon={BarChart3} color="green" progress={analytics.cardsRetentionRate} />
              </div>

              {/* Subject mastery */}
              <div className="mb-6 rounded-2xl border border-[#dce7eb] bg-white p-6">
                <h2 className="mb-5 text-[16px] font-bold text-[#0f172a]">Subject mastery</h2>
                <div className="space-y-4">
                  {analytics.progress.subjectMastery.map((s) => (
                    <div key={s.subject}>
                      <div className="mb-1.5 flex items-center justify-between text-[13px]">
                        <span className="font-semibold text-[#0f172a]">{s.subject}</span>
                        <span className={cn('font-bold', s.masteryPercent >= 80 ? 'text-emerald-600' : s.masteryPercent >= 65 ? 'text-amber-600' : 'text-red-500')}>
                          {s.masteryPercent}%
                        </span>
                      </div>
                      <div className="h-2 overflow-hidden rounded-full bg-[#e2eaee]">
                        <div
                          className={cn('h-full rounded-full', s.masteryPercent >= 80 ? 'bg-emerald-500' : s.masteryPercent >= 65 ? 'bg-amber-400' : 'bg-red-400')}
                          style={{ width: `${s.masteryPercent}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weekly activity chart */}
              <div className="mb-6 rounded-2xl border border-[#dce7eb] bg-white p-6">
                <h2 className="mb-5 text-[16px] font-bold text-[#0f172a]">Weekly review activity</h2>
                <div className="flex h-36 items-end gap-3">
                  {analytics.progress.reviewHistory.map((day) => (
                    <div key={day.date} className="flex flex-1 flex-col items-center gap-2">
                      <span className="text-[10px] font-bold text-[#0e7490]">{day.accuracy}%</span>
                      <div
                        className="w-full rounded-t-lg bg-[#0e7490]"
                        style={{ height: `${(day.reviewedCount / maxReviewed) * 100}px` }}
                      />
                      <span className="text-[10px] text-[#94a3b8]">{day.date}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Weak topics */}
              {WEAK_TOPICS.length > 0 && (
                <div className="rounded-2xl border border-amber-200 bg-amber-50 p-5">
                  <div className="mb-4 flex items-center gap-2">
                    <AlertCircle size={17} className="text-amber-600" />
                    <h2 className="text-[14px] font-bold text-amber-800">Areas needing focus</h2>
                  </div>
                  <div className="space-y-3">
                    {WEAK_TOPICS.map((t) => (
                      <div key={t.subject} className="flex items-center justify-between gap-4 rounded-xl bg-white p-4">
                        <div>
                          <p className="text-[13px] font-bold text-[#0f172a]">{t.subject}</p>
                          <p className="text-[11px] text-[#64748b]">
                            Your score: {t.score}% · Average: {t.avg}%
                          </p>
                        </div>
                        <div className="flex items-center gap-2">
                          <Link href="/qbank/session" className="rounded-full border border-[#dce7eb] px-3 py-1.5 text-[11px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
                            Practice questions
                          </Link>
                          <Link href="/flashcards/review" className="rounded-full bg-[#0e7490] px-3 py-1.5 text-[11px] font-bold text-white hover:bg-[#155e75]">
                            Review flashcards
                          </Link>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </>
          ) : (
            /* Exam Readiness tab */
            <>
              <div className="mb-8 flex flex-col items-center justify-center rounded-2xl border border-[#dce7eb] bg-white p-10 text-center">
                <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Overall exam readiness</p>
                <div className="relative mt-6">
                  <svg className="h-44 w-44 -rotate-90" viewBox="0 0 100 100">
                    <circle cx="50" cy="50" r="42" stroke="#e2eaee" strokeWidth="10" fill="none" />
                    <circle
                      cx="50" cy="50" r="42"
                      stroke={OVERALL_READINESS >= 80 ? '#10b981' : OVERALL_READINESS >= 65 ? '#f59e0b' : '#ef4444'}
                      strokeWidth="10" fill="none"
                      strokeDasharray={`${OVERALL_READINESS * 2.638} ${263.8 - OVERALL_READINESS * 2.638}`}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center">
                    <span className="text-4xl font-bold tracking-tight text-[#0f172a]">{OVERALL_READINESS}%</span>
                    <span className="text-[11px] text-[#64748b]">ready</span>
                  </div>
                </div>
                <p className="mt-4 max-w-sm text-[13px] leading-5 text-[#64748b]">
                  {OVERALL_READINESS >= 80
                    ? "Strong performance across all dimensions. Keep up the daily reviews."
                    : OVERALL_READINESS >= 65
                    ? "Good foundation. Focus on your weaker subjects to push past 80%."
                    : "More consistent practice needed. Start with your weakest subject today."}
                </p>
              </div>

              {/* Score breakdown */}
              <div className="space-y-3">
                {EXAM_SCORES.map((s) => (
                  <div key={s.label} className="flex items-center gap-5 rounded-2xl border border-[#dce7eb] bg-white p-5">
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <p className="text-[14px] font-bold text-[#0f172a]">{s.label}</p>
                        <span className={cn('text-[16px] font-bold', s.score >= 80 ? 'text-emerald-600' : s.score >= 65 ? 'text-amber-600' : 'text-red-500')}>
                          {s.score}%
                        </span>
                      </div>
                      <p className="mt-0.5 text-[11px] text-[#64748b]">{s.desc}</p>
                      <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#e2eaee]">
                        <div
                          className={cn('h-full rounded-full transition-all', s.score >= 80 ? 'bg-emerald-500' : s.score >= 65 ? 'bg-amber-400' : 'bg-red-400')}
                          style={{ width: `${s.score}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </>
          )
        ) : null}
      </div>
    </AppShell>
  );
}
