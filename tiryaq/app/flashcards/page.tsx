'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { BookOpen, Clock, Flame, Play, Target } from 'lucide-react';
import Link from 'next/link';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getDashboardSummary, getDecks } from '@/services/studyService';
import { cn } from '@/lib/utils/cn';

export default function FlashcardsDashboardPage() {
  const [selected, setSelected] = useState<string | null>(null);

  const { data: decks = [], isLoading } = useQuery({
    queryKey: ['decks'],
    queryFn: getDecks,
  });

  const { data: summary } = useQuery({
    queryKey: ['dashboard-summary'],
    queryFn: getDashboardSummary,
  });

  const totalDue = decks.reduce((acc, deck) => acc + deck.dueCount, 0);
  const totalNew = decks.reduce((acc, deck) => acc + deck.newCount, 0);
  const totalMastered = decks.reduce((acc, deck) => acc + deck.masteredCount, 0);

  return (
    <AppShell title="Flashcards">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075985]">Spaced repetition</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">Flashcards</h1>
          <p className="mt-1 text-[14px] text-[#5B7184]">Your personalised review queue, optimised by the FSRS algorithm.</p>
        </div>

        {/* Stats */}
        <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <StatCard label="Due today" value={totalDue} detail="cards" icon={Clock} color="teal" />
          <StatCard label="New cards" value={totalNew} detail="to learn" icon={BookOpen} color="blue" />
          <StatCard label="Mastered" value={totalMastered} detail="cards" icon={Target} color="green" />
          <StatCard label="Streak" value={summary?.streakDays ?? 0} detail="days" icon={Flame} color="amber" />
        </div>

        {/* Quick-start */}
        <div className="mb-8 flex flex-col items-start gap-3 sm:flex-row sm:items-center">
          <Link
            href="/flashcards/review"
            className="flex items-center gap-2 rounded-full bg-[#0369A1] px-5 py-3 text-[14px] font-bold text-white shadow-[0_4px_14px_rgba(14,116,144,0.2)] hover:bg-[#075985]"
          >
            <Play size={16} /> Start review ({totalDue} due)
          </Link>
          <span className="text-[12px] text-[#5B7184]">
            {summary ? `${summary.dailyCompleted}/${summary.dailyGoal} cards reviewed today` : 'Loading today’s progress…'}
          </span>
        </div>

        {/* Decks */}
        <h2 className="mb-4 text-[15px] font-bold text-[#0F2A3D]">Your decks</h2>

        {isLoading ? (
          <div className="space-y-3">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-32 w-full" />)}
          </div>
        ) : decks.length === 0 ? (
          <p className="rounded-2xl border border-dashed border-[#0369A1]/15 bg-white/75 p-8 text-center text-[13px] text-[#5B7184] backdrop-blur-xl">
            No decks yet. Run the backend seeder to load the starter decks.
          </p>
        ) : (
          <div className="space-y-3">
            {decks.map((deck) => {
              const total = deck.cardCount || 1;
              const masteredPct = Math.round((deck.masteredCount / total) * 100);
              return (
                <button
                  key={deck.id}
                  type="button"
                  onClick={() => setSelected(deck.subject)}
                  className={cn(
                    'w-full rounded-2xl border bg-white/75 p-5 text-left shadow-[0_10px_30px_rgba(6,45,70,0.07)] transition-all backdrop-blur-xl',
                    selected === deck.subject ? 'border-[#38BDF8]' : 'border-[#0369A1]/15',
                  )}
                >
                  <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <h3 className="text-[14px] font-bold text-[#0F2A3D]">{deck.subject}</h3>
                        {deck.dueCount > 0 && <Badge variant="teal">{deck.dueCount} due</Badge>}
                      </div>
                      <div className="mt-2 flex flex-wrap gap-4 text-[11px] text-[#5B7184]">
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-[#0369A1]" />Due: {deck.dueCount}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full" style={{ background: '#0369A1' }} />New: {deck.newCount}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-amber-400" />Learning: {deck.learningCount}</span>
                        <span className="flex items-center gap-1"><span className="h-2 w-2 rounded-full bg-emerald-500" />Mastered: {deck.masteredCount}</span>
                      </div>
                      <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0369A1]/15">
                        <div className="h-full rounded-full bg-emerald-500" style={{ width: `${masteredPct}%` }} />
                      </div>
                      <p className="mt-1 text-[10px] text-[#5B7184]">{masteredPct}% mastered · {deck.cardCount} cards</p>
                    </div>
                    <Link
                      href={`/flashcards/review?deck=${deck.id}`}
                      className="shrink-0 rounded-full bg-[#0369A1] px-4 py-2 text-[12px] font-bold text-white hover:bg-[#075985]"
                    >
                      Review
                    </Link>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
