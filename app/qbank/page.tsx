'use client';

import { useState } from 'react';
import { BarChart3, BookOpen, Play, Target, Timer } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { cn } from '@/lib/utils/cn';

const SUBJECTS = ['All', 'Cardiology', 'Pulmonology', 'Neurology', 'Renal / Nephrology', 'Pediatrics', 'Rheumatology / Orthopedics'];
const DIFFICULTIES = ['All', 'Easy', 'Medium', 'Hard'];

const SUBJECT_STATS = [
  { subject: 'Cardiology', answered: 48, correct: 42, pct: 88 },
  { subject: 'Pulmonology', answered: 35, correct: 26, pct: 74 },
  { subject: 'Renal / Nephrology', answered: 22, correct: 14, pct: 64 },
  { subject: 'Pediatrics', answered: 30, correct: 21, pct: 70 },
  { subject: 'Rheumatology', answered: 18, correct: 15, pct: 83 },
];

export default function QBankDashboardPage() {
  const [subject, setSubject] = useState('All');
  const [difficulty, setDifficulty] = useState('All');

  return (
    <AppShell title="QBank">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Question bank</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">QBank</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">High-yield clinical vignettes. Build exam confidence question by question.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Questions answered" value={153} icon={BookOpen} color="teal" />
          <StatCard label="Accuracy" value="78.5%" icon={Target} color="blue" progress={78.5} />
          <StatCard label="Avg. time / question" value="82s" icon={Timer} color="amber" />
          <StatCard label="Weak subjects" value={2} detail="need focus" icon={BarChart3} color="slate" />
        </div>

        {/* Start session */}
        <div className="mb-8 rounded-2xl border border-[#dce7eb] bg-white p-6">
          <h2 className="mb-4 text-[15px] font-bold text-[#0f172a]">Start a new session</h2>

          <div className="flex flex-wrap gap-4">
            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Subject</label>
              <select
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full rounded-xl border border-[#dce7eb] bg-[#f8fafc] px-3 py-2.5 text-[13px] text-[#0f172a] focus:border-[#0e7490] focus:outline-none"
                aria-label="Filter by subject"
              >
                {SUBJECTS.map((s) => <option key={s}>{s}</option>)}
              </select>
            </div>

            <div className="flex-1 min-w-[180px]">
              <label className="mb-1.5 block text-[11px] font-bold uppercase tracking-[0.1em] text-[#94a3b8]">Difficulty</label>
              <select
                value={difficulty}
                onChange={(e) => setDifficulty(e.target.value)}
                className="w-full rounded-xl border border-[#dce7eb] bg-[#f8fafc] px-3 py-2.5 text-[13px] text-[#0f172a] focus:border-[#0e7490] focus:outline-none"
                aria-label="Filter by difficulty"
              >
                {DIFFICULTIES.map((d) => <option key={d}>{d}</option>)}
              </select>
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Link
              href="/qbank/session"
              className="flex items-center gap-2 rounded-full bg-[#0e7490] px-5 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(14,116,144,0.2)] hover:bg-[#155e75]"
            >
              <Play size={16} /> Start session
            </Link>
            <Link
              href="/quiz/1"
              className="flex items-center gap-2 rounded-full border border-[#dce7eb] bg-white px-5 py-3 text-[13px] font-semibold text-[#64748b] hover:border-[#8ecfd3] hover:text-[#0e7490]"
            >
              Quick quiz (3 questions)
            </Link>
          </div>
        </div>

        {/* Subject breakdown */}
        <h2 className="mb-4 text-[15px] font-bold text-[#0f172a]">Performance by subject</h2>
        <div className="rounded-2xl border border-[#dce7eb] bg-white p-5">
          <div className="space-y-5">
            {SUBJECT_STATS.map((s) => (
              <div key={s.subject}>
                <div className="mb-1.5 flex items-center justify-between">
                  <span className="text-[13px] font-semibold text-[#0f172a]">{s.subject}</span>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span className="text-[#64748b]">{s.answered} answered</span>
                    <span className={cn('font-bold', s.pct >= 80 ? 'text-emerald-600' : s.pct >= 65 ? 'text-amber-600' : 'text-red-500')}>
                      {s.pct}%
                    </span>
                  </div>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[#e2eaee]">
                  <div
                    className={cn('h-full rounded-full', s.pct >= 80 ? 'bg-emerald-500' : s.pct >= 65 ? 'bg-amber-400' : 'bg-red-400')}
                    style={{ width: `${s.pct}%` }}
                  />
                </div>
                {s.pct < 70 && (
                  <p className="mt-1 text-[10px] font-semibold text-red-500">Below average — focus recommended</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppShell>
  );
}
