'use client';

import { useState, useEffect, useCallback } from 'react';
import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { ChevronRight, Clock, Flag, Lightbulb, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getQuizDeck } from '@/services/studyService';
import { cn } from '@/lib/utils/cn';

export default function QBankSessionPage() {
  const [index, setIndex] = useState(0);
  const [selected, setSelected] = useState<number | null>(null);
  const [answered, setAnswered] = useState(false);
  const [score, setScore] = useState(0);
  const [elapsed, setElapsed] = useState(0);
  const [finished, setFinished] = useState(false);

  const { data: questions = [], isLoading } = useQuery({
    queryKey: ['qbank-questions'],
    queryFn: getQuizDeck,
  });

  const question = questions[index];
  const isLast = index === questions.length - 1;

  // Timer
  useEffect(() => {
    if (answered || finished) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [answered, finished, index]);

  const handleSubmit = useCallback(() => {
    if (selected === null || !question) return;
    setAnswered(true);
    if (selected === question.correctAnswer) setScore((s) => s + 1);
  }, [selected, question]);

  const handleNext = () => {
    if (isLast) { setFinished(true); return; }
    setIndex((i) => i + 1);
    setSelected(null);
    setAnswered(false);
    setElapsed(0);
  };

  const restart = () => {
    setIndex(0); setSelected(null); setAnswered(false); setScore(0); setElapsed(0); setFinished(false);
  };

  const mins = String(Math.floor(elapsed / 60)).padStart(2, '0');
  const secs = String(elapsed % 60).padStart(2, '0');

  if (isLoading) {
    return (
      <AppShell title="QBank Session">
        <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8 space-y-5">
          <Skeleton className="h-16" />
          <Skeleton className="h-64" />
          <Skeleton className="h-32" />
        </div>
      </AppShell>
    );
  }

  if (finished) {
    const pct = Math.round((score / questions.length) * 100);
    return (
      <AppShell title="Session Complete">
        <div className="mx-auto max-w-2xl px-5 py-12 sm:px-8">
          <div className="rounded-2xl border border-[#dce7eb] bg-white p-10 text-center">
            <div className={cn('mx-auto flex h-20 w-20 items-center justify-center rounded-full text-2xl font-bold', pct >= 80 ? 'bg-emerald-50 text-emerald-600' : pct >= 60 ? 'bg-amber-50 text-amber-600' : 'bg-red-50 text-red-500')}>
              {pct}%
            </div>
            <h1 className="mt-5 text-2xl font-bold tracking-tight text-[#0f172a]">Session complete</h1>
            <p className="mt-2 text-[14px] text-[#64748b]">
              You scored <strong className="text-[#0f172a]">{score} out of {questions.length}</strong>
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              <Button onClick={restart}>Practice again</Button>
              <Link href="/qbank" className="flex items-center justify-center rounded-full border border-[#dce7eb] bg-white px-5 py-2.5 text-[13px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
                Back to QBank
              </Link>
            </div>
          </div>
        </div>
      </AppShell>
    );
  }

  if (!question) return null;

  return (
    <AppShell title="QBank Session">
      <div className="mx-auto max-w-3xl px-5 py-8 sm:px-8">
        {/* Progress bar */}
        <div className="mb-5 rounded-2xl border border-[#dce7eb] bg-white p-4">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <span className="text-[11px] font-bold uppercase tracking-[0.1em] text-[#64748b]">
                Question {index + 1} / {questions.length}
              </span>
              <div className="h-2 w-28 overflow-hidden rounded-full bg-[#e2eaee]">
                <div className="h-full rounded-full bg-[#0e7490] transition-all" style={{ width: `${((index + 1) / questions.length) * 100}%` }} />
              </div>
            </div>

            <div className="flex items-center gap-4">
              <span className={cn('flex items-center gap-1.5 text-[13px] font-bold tabular-nums', elapsed > 120 ? 'text-red-500' : 'text-[#0f172a]')}>
                <Clock size={14} /> {mins}:{secs}
              </span>
              <span className="text-[13px] font-bold text-[#0e7490]">
                {score}/{index + (answered ? 1 : 0)}
              </span>
            </div>
          </div>
        </div>

        {/* Question */}
        <div className="rounded-2xl border border-[#dce7eb] bg-white p-6 sm:p-8">
          <div className="mb-5 flex flex-wrap items-center gap-2">
            <Badge variant="teal">{question.subject}</Badge>
            <Badge variant={question.yieldRating === 'High' ? 'red' : question.yieldRating === 'Medium' ? 'amber' : 'slate'}>
              {question.yieldRating} yield
            </Badge>
            <button className="ml-auto flex items-center gap-1 text-[11px] font-semibold text-[#94a3b8] hover:text-[#0e7490]" aria-label="Flag question">
              <Flag size={13} /> Flag
            </button>
          </div>

          {/* Vignette */}
          <p className="text-[15px] leading-7 text-[#0f172a]">{question.vignette}</p>

          {/* Options */}
          <div className="mt-6 space-y-2.5" role="radiogroup" aria-label="Answer options">
            {question.options.map((opt, i) => {
              const isCorrect = i === question.correctAnswer;
              const isSelected = i === selected;
              return (
                <button
                  key={i}
                  role="radio"
                  aria-checked={isSelected}
                  disabled={answered}
                  onClick={() => !answered && setSelected(i)}
                  className={cn(
                    'flex w-full items-start gap-3 rounded-xl border-2 p-4 text-left text-[13px] transition-all',
                    answered
                      ? isCorrect
                        ? 'border-emerald-500 bg-emerald-50 text-emerald-900'
                        : isSelected
                        ? 'border-red-400 bg-red-50 text-red-900'
                        : 'border-[#e2eaee] bg-white text-[#64748b]'
                      : isSelected
                      ? 'border-[#0e7490] bg-[#f0fdfd] text-[#0f172a]'
                      : 'border-[#e2eaee] bg-white text-[#334155] hover:border-[#8ecfd3] hover:bg-[#f8fafc]',
                  )}
                >
                  <span className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 text-[11px] font-bold',
                    answered && isCorrect ? 'border-emerald-500 bg-emerald-500 text-white'
                      : answered && isSelected ? 'border-red-400 bg-red-400 text-white'
                      : isSelected ? 'border-[#0e7490] text-[#0e7490]'
                      : 'border-[#cbd5e1] text-[#94a3b8]',
                  )}>
                    {String.fromCharCode(65 + i)}
                  </span>
                  <span className="flex-1 leading-5">{opt}</span>
                  {answered && isCorrect && <Badge variant="green">Correct</Badge>}
                  {answered && isSelected && !isCorrect && <Badge variant="red">Your answer</Badge>}
                </button>
              );
            })}
          </div>

          {/* Explanation */}
          {answered && (
            <div className="mt-6 space-y-4">
              <div className="rounded-xl bg-[#f8fafc] p-5">
                <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0e7490]">Explanation</p>
                <p className="mt-2 text-[13px] leading-6 text-[#334155]">{question.explanation}</p>
              </div>

              <div className="rounded-xl border border-[#a9e2e2] bg-[#e0f7f7] p-5">
                <p className="flex items-center gap-1.5 text-[10px] font-bold uppercase tracking-[0.12em] text-[#0e7490]">
                  <Lightbulb size={13} /> Clinical pearl
                </p>
                <p className="mt-2 text-[13px] leading-6 text-[#164e63]">
                  {question.subject === 'Pulmonology'
                    ? 'In high pretest probability PE, skip the D-dimer — a negative result will not change management, and you lose valuable time.'
                    : question.subject.includes('Pediatrics')
                    ? 'Barky cough plus inspiratory stridor in a toddler is croup until proven otherwise. Drooling and a tripod position point to epiglottitis instead.'
                    : 'Septic arthritis destroys cartilage within days. If the synovial WBC is above 50,000/µL, treat empirically and drain — do not wait for cultures.'}
                </p>
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="mt-5 flex gap-3">
          <Link
            href="/qbank"
            className="flex items-center justify-center gap-1.5 rounded-full border border-[#dce7eb] bg-white px-5 py-3 text-[13px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]"
          >
            <X size={15} /> End session
          </Link>
          {!answered ? (
            <Button className="flex-1" size="lg" disabled={selected === null} onClick={handleSubmit}>
              Submit answer
            </Button>
          ) : (
            <button
              onClick={handleNext}
              className="flex flex-1 items-center justify-center gap-2 rounded-full bg-[#0f172a] py-3 text-[14px] font-bold text-white hover:bg-[#0e7490]"
            >
              {isLast ? 'Finish session' : 'Next question'} <ChevronRight size={16} />
            </button>
          )}
        </div>
      </div>
    </AppShell>
  );
}
