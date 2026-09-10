'use client';

import { useState } from 'react';
import { BookOpen, Clock, Flame, Play, Target } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';

interface DeckStat { subject: string; due: number; new: number; learning: number; mastered: number }

const MOCK_DECKS: DeckStat[] = [
  { subject: 'Cardiology', due: 12, new: 5, learning: 8, mastered: 95 },
  { subject: 'Pulmonology', due: 7, new: 3, learning: 4, mastered: 70 },
  { subject: 'Renal / Nephrology', due: 16, new: 8, learning: 11, mastered: 48 },
  { subject: 'Endocrinology', due: 4, new: 2, learning: 6, mastered: 65 },
];

const TOTAL_DUE = MOCK_DECKS.reduce((acc, d) => acc + d.due, 0);
const TOTAL_NEW = MOCK_DECKS.reduce((acc, d) => acc + d.new, 0);
const TOTAL_MASTERED = MOCK_DECKS.reduce((acc, d) => acc + d.mastered, 0);

export default function FlashcardsDashboardPage() {
  const [selected, setSelected] = useState<string | null>(null);

  return (
    <AppShell title="Flashcards">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Spaced repetition</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Flashcards</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">Your personalised review queue, optimised by the FSRS algorithm.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Due today" value={TOTAL_DUE} detail="cards" icon={Clock} color="teal" />
          <StatCard label="New cards" value={TOTAL_NEW} detail="to learn" icon={BookOpen} color="blue" />
          <StatCard label="Mastered" value={TOTAL_MASTERED} detail="cards" icon={Target} color="green" />
          <StatCard label="Streak" value={14} detail="days" icon={Flame} color="amber" />
        </div>

        {/* Quick-start */}
        <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/flashcards/review"
            className="flex items-center gap-2 rounded-full bg-[#0e7490] px-5 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(14,116,144,0.2)] hover:bg-[#155e75]"
          >
            <Play size={16} /> Start review ({TOTAL_DUE} due)
          </Link>
          <button className="flex items-center gap-2 rounded-full border border-[#dce7eb] bg-white px-5 py-3 text-[13px] font-semibold text-[#64748b] hover:border-[#8ecfd3] hover:text-[#0e7490]">
            Browse all cards
          </button>
        </div>

        {/* Decks */}
        <h2 className="mb-4 text-[15px] font-bold text-[#0f172a]">Your decks</h2>
        <div className="space-y-3">
          {MOCK_DECKS.map((deck) => {
            const total = deck.due + deck.new + deck.learning + deck.mastered;
            const masteredPct = Math.round((deck.mastered / total) * 100);
            return (
              <button
                key={deck.subject}
                type="button"
                onClick={() => setSelected(deck.subject)}
                className={cn(
                  'rounded-2xl border bg-white p-5 transition-all',
                  selected === deck.subject ? 'border-[#0e7490]' : 'border-[#dce7eb]',
                )}
              >
                <div className="flex items-center justify-between gap-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3">
                      <h3 className="text-[14px] font-bold text-[#0f172a]">{deck.subject}</h3>
                      {deck.due > 0 && <Badge variant="teal">{deck.due} due</Badge>}
                    </div>
                    <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-[#64748b]">
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#0e7490]" />Due: {deck.due}</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#dbeafe]" style={{ background: '#3b82f6' }} />New: {deck.new}</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Learning: {deck.learning}</span>
                      <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Mastered: {deck.mastered}</span>
                    </div>
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e2eaee]">
                      <div className="h-full rounded-full bg-emerald-500" style={{ width: `${masteredPct}%` }} />
                    </div>
                    <p className="mt-1 text-[10px] text-[#94a3b8]">{masteredPct}% mastered</p>
                  </div>
                  <Link
                    href="/flashcards/review"
                    className="shrink-0 rounded-full bg-[#0f172a] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#0e7490]"
                  >
                    Review
                  </Link>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </AppShell>
  );
}
