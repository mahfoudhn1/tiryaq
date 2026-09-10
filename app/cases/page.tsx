'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Play, RotateCcw, Stethoscope, Target } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

const MOCK_CASES = [
  {
    id: 'case-101',
    title: 'Acute Right Lower Quadrant Pain',
    specialty: 'General Surgery',
    difficulty: 'Intermediate' as const,
    status: 'in-progress' as const,
    completedSteps: 2,
    totalSteps: 6,
    estimatedTime: '15 min',
    tags: ['Appendicitis', 'Surgical emergency'],
  },
  {
    id: 'case-102',
    title: '62-Year-Old with Acute Chest Pain',
    specialty: 'Cardiology',
    difficulty: 'Advanced' as const,
    status: 'available' as const,
    completedSteps: 0,
    totalSteps: 7,
    estimatedTime: '20 min',
    tags: ['ACS', 'STEMI', 'ECG'],
  },
  {
    id: 'case-103',
    title: 'Sudden Onset Unilateral Weakness',
    specialty: 'Neurology',
    difficulty: 'Advanced' as const,
    status: 'available' as const,
    completedSteps: 0,
    totalSteps: 8,
    estimatedTime: '25 min',
    tags: ['Stroke', 'tPA decision', 'NIHSS'],
  },
  {
    id: 'case-104',
    title: 'Young Woman with Butterfly Rash',
    specialty: 'Rheumatology',
    difficulty: 'Beginner' as const,
    status: 'completed' as const,
    completedSteps: 6,
    totalSteps: 6,
    estimatedTime: '12 min',
    tags: ['SLE', 'Autoimmune', 'ANA'],
  },
  {
    id: 'case-105',
    title: 'Infant with Fever and Bulging Fontanelle',
    specialty: 'Pediatrics',
    difficulty: 'Intermediate' as const,
    status: 'available' as const,
    completedSteps: 0,
    totalSteps: 5,
    estimatedTime: '15 min',
    tags: ['Meningitis', 'Lumbar puncture', 'Pediatric emergency'],
  },
  {
    id: 'case-106',
    title: 'Diabetic with Altered Mental Status',
    specialty: 'Endocrinology',
    difficulty: 'Intermediate' as const,
    status: 'completed' as const,
    completedSteps: 5,
    totalSteps: 5,
    estimatedTime: '15 min',
    tags: ['DKA', 'HHS', 'Glucose management'],
  },
];

const DIFFICULTY_VARIANT = { Beginner: 'green', Intermediate: 'amber', Advanced: 'red' } as const;
const STATUS_VARIANT = { available: 'slate', 'in-progress': 'teal', completed: 'green' } as const;

export default function CasesPage() {
  const [filter, setFilter] = useState<'all' | 'available' | 'in-progress' | 'completed'>('all');

  const filtered = filter === 'all' ? MOCK_CASES : MOCK_CASES.filter((c) => c.status === filter);
  const completed = MOCK_CASES.filter((c) => c.status === 'completed').length;
  const inProgress = MOCK_CASES.filter((c) => c.status === 'in-progress').length;

  return (
    <AppShell title="Clinical Cases">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Case simulator</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Clinical Cases</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">Work through realistic patient encounters and sharpen your clinical reasoning.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <StatCard label="Completed" value={completed} detail={`of ${MOCK_CASES.length} cases`} icon={CheckCircle} color="green" progress={Math.round((completed / MOCK_CASES.length) * 100)} />
          <StatCard label="In progress" value={inProgress} detail="cases" icon={RotateCcw} color="teal" />
          <StatCard label="Clinical reasoning" value="80%" detail="accuracy" icon={Target} color="blue" />
        </div>

        {/* Filter tabs */}
        <div className="mb-6 flex flex-wrap gap-2" role="group" aria-label="Filter cases">
          {(['all', 'available', 'in-progress', 'completed'] as const).map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={cn(
                'rounded-full px-4 py-2 text-[12px] font-semibold capitalize transition-colors',
                filter === f ? 'bg-[#0e7490] text-white' : 'bg-white border border-[#dce7eb] text-[#64748b] hover:border-[#8ecfd3] hover:text-[#0e7490]',
              )}
              aria-pressed={filter === f}
            >
              {f === 'all' ? `All (${MOCK_CASES.length})` : f.replace('-', ' ')}
            </button>
          ))}
        </div>

        {/* Case cards */}
        <div className="space-y-4">
          {filtered.map((c) => (
            <div key={c.id} className="rounded-2xl border border-[#dce7eb] bg-white p-5 transition-all hover:border-[#8ecfd3]">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={DIFFICULTY_VARIANT[c.difficulty]}>{c.difficulty}</Badge>
                    <Badge variant={STATUS_VARIANT[c.status]}>{c.status.replace('-', ' ')}</Badge>
                    <span className="text-[11px] text-[#94a3b8]">{c.specialty}</span>
                  </div>

                  <h3 className="mt-2 text-[15px] font-bold text-[#0f172a]">{c.title}</h3>

                  <div className="mt-2 flex flex-wrap gap-2">
                    {c.tags.map((tag) => (
                      <span key={tag} className="rounded-full bg-[#f1f5f9] px-2.5 py-0.5 text-[10px] font-medium text-[#64748b]">{tag}</span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center gap-4 text-[11px] text-[#64748b]">
                    <span className="flex items-center gap-1"><Clock size={12} /> {c.estimatedTime}</span>
                    <span className="flex items-center gap-1"><Stethoscope size={12} /> {c.totalSteps} decision points</span>
                  </div>

                  {c.status === 'in-progress' && (
                    <div className="mt-3">
                      <div className="mb-1 flex items-center justify-between text-[10px]">
                        <span className="text-[#64748b]">Progress</span>
                        <span className="font-bold text-[#0e7490]">{c.completedSteps}/{c.totalSteps} steps</span>
                      </div>
                      <div className="h-1.5 overflow-hidden rounded-full bg-[#e2eaee]">
                        <div className="h-full rounded-full bg-[#0e7490]" style={{ width: `${(c.completedSteps / c.totalSteps) * 100}%` }} />
                      </div>
                    </div>
                  )}
                </div>

                <Link
                  href={`/cases/${c.id}`}
                  className={cn(
                    'shrink-0 flex items-center gap-1.5 rounded-full px-4 py-2 text-[12px] font-bold transition-colors',
                    c.status === 'completed'
                      ? 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2eaee]'
                      : 'bg-[#0f172a] text-white hover:bg-[#0e7490]',
                  )}
                >
                  {c.status === 'completed' ? <><RotateCcw size={13} /> Review</> : c.status === 'in-progress' ? <><Play size={13} /> Continue</> : <><Play size={13} /> Start</>}
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppShell>
  );
}
