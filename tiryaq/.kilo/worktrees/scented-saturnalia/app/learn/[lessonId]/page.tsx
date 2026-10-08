'use client';

import { useState } from 'react';
import Link from 'next/link';
import {
  ChevronLeft, ChevronRight, Download, FileText,
  List, Maximize2, MessageSquare, PenLine, Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils/cn';
import { MOCK_COURSES } from '@/lib/mock/data';

// Find the first enrolled course for demo
const DEMO_COURSE = MOCK_COURSES[0];
const DEMO_MODULE = DEMO_COURSE.modules[1]; // ECG module
const DEMO_LESSON = DEMO_MODULE.lessons[1]; // Arrhythmia recognition

const TABS = ['Description', 'Resources', 'Notes', 'Discussion'] as const;
type Tab = typeof TABS[number];

export default function LessonPlayerPage() {
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState('');

  // In a real app these would be fetched by lessonId
  const lesson = DEMO_LESSON;
  const course = DEMO_COURSE;

  return (
    <div className="flex h-screen flex-col bg-[#0f172a]">
      {/* Top bar */}
      <header className="flex h-[56px] shrink-0 items-center justify-between border-b border-white/10 px-5">
        <div className="flex items-center gap-3">
          <Link
            href={`/courses/${course.slug}`}
            className="flex items-center gap-1.5 text-[12px] font-semibold text-slate-400 hover:text-white"
          >
            <ChevronLeft size={15} /> {course.title}
          </Link>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[12px] text-slate-400">Lesson 3 of {DEMO_MODULE.lessons.length}</span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Toggle curriculum"
          >
            <List size={18} />
          </button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Video + content */}
        <div className="flex flex-1 flex-col overflow-y-auto">
          {/* Video area */}
          <div className="relative flex aspect-video w-full items-center justify-center bg-black">
            {/* Placeholder — ready for HLS src prop */}
            <div className="flex flex-col items-center gap-4 text-white/40">
              <span className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-white/20">
                <Play size={28} className="ml-1" />
              </span>
              <p className="text-[13px]">Video player placeholder — connect HLS/DASH/R2 URL via <code className="rounded bg-white/10 px-1.5 py-0.5 text-[11px]">src</code> prop</p>
            </div>
            <button
              className="absolute bottom-4 right-4 rounded-lg bg-white/10 p-1.5 text-white hover:bg-white/20"
              aria-label="Fullscreen"
            >
              <Maximize2 size={16} />
            </button>
          </div>

          {/* Content tabs */}
          <div className="flex-1 bg-[#f5f9fa]">
            {/* Lesson title */}
            <div className="border-b border-[#dce7eb] bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#0f172a]">{lesson.title}</h1>
                  <p className="mt-1 text-[13px] text-[#64748b]">{DEMO_MODULE.title} · {lesson.duration}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-full border border-[#dce7eb] bg-white px-3 py-1.5 text-[12px] font-semibold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button className="flex items-center gap-1.5 rounded-full bg-[#0e7490] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#155e75]">
                    Next <ChevronRight size={14} />
                  </button>
                </div>
              </div>

              {/* Tabs */}
              <nav className="mt-4 flex gap-1" aria-label="Lesson tabs">
                {TABS.map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={cn(
                      'rounded-full px-4 py-2 text-[12px] font-semibold transition-colors',
                      activeTab === tab
                        ? 'bg-[#e0f7f7] text-[#0e7490]'
                        : 'text-[#64748b] hover:bg-[#f1f5f9]',
                    )}
                    aria-selected={activeTab === tab}
                    role="tab"
                  >
                    {tab}
                  </button>
                ))}
              </nav>
            </div>

            {/* Tab content */}
            <div className="mx-auto max-w-3xl px-6 py-6">
              {activeTab === 'Description' && (
                <div className="prose prose-slate max-w-none">
                  <p className="text-[14px] leading-7 text-[#334155]">
                    In this lesson, Dr. Haddad walks through the recognition and management of the most clinically important arrhythmias. You&apos;ll develop a systematic approach that can be applied at the bedside or in an exam vignette.
                  </p>
                  <h3 className="mt-5 text-[15px] font-bold text-[#0f172a]">What you&apos;ll learn</h3>
                  <ul className="mt-2 space-y-1.5 text-[13px] text-[#334155]">
                    <li>Differentiating SVT, atrial flutter, atrial fibrillation, and VT on a 12-lead ECG</li>
                    <li>Rate control vs rhythm control — when to choose each</li>
                    <li>Identifying pre-excitation (WPW) and why it matters for drug choices</li>
                    <li>High-yield pacemaker rhythms tested in USMLE/clinical exams</li>
                  </ul>
                  <div className="mt-6 rounded-2xl border border-[#dce7eb] bg-white p-5">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#0e7490]">Clinical pearl</p>
                    <p className="mt-2 text-[13px] leading-6 text-[#334155]">
                      In a wide-complex tachycardia, assume VT until proven otherwise. Hemodynamically stable patients with VT can still deteriorate rapidly — always get a 12-lead and call for help early.
                    </p>
                  </div>
                </div>
              )}

              {activeTab === 'Resources' && (
                <div className="space-y-3">
                  {[
                    { name: 'Arrhythmia Recognition Cheat Sheet.pdf', type: 'pdf', size: '1.2 MB' },
                    { name: 'ECG Practice Set — Arrhythmias.pdf', type: 'pdf', size: '3.8 MB' },
                    { name: 'Drug Choices in Arrhythmia Management.pdf', type: 'reference', size: '820 KB' },
                  ].map((r) => (
                    <div key={r.name} className="flex items-center gap-4 rounded-2xl border border-[#dce7eb] bg-white p-4">
                      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#dbeafe] text-[#1e3a8a]">
                        <FileText size={20} />
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="truncate text-[13px] font-semibold text-[#0f172a]">{r.name}</p>
                        <p className="text-[11px] text-[#94a3b8]">{r.size}</p>
                      </div>
                      <button className="flex items-center gap-1.5 rounded-full border border-[#dce7eb] px-3 py-1.5 text-[11px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
                        <Download size={13} /> Download
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {activeTab === 'Notes' && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <PenLine size={16} className="text-[#0e7490]" />
                    <span className="text-[13px] font-bold text-[#0f172a]">Your notes</span>
                    <Badge variant="teal">Auto-saved</Badge>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes while watching. Notes are private to you and saved automatically."
                    className="h-64 w-full resize-none rounded-2xl border border-[#dce7eb] bg-white p-4 text-[13px] leading-6 text-[#334155] placeholder:text-[#94a3b8] focus:border-[#0e7490] focus:outline-none focus:ring-2 focus:ring-[#0e7490]/20"
                    aria-label="Lesson notes"
                  />
                </div>
              )}

              {activeTab === 'Discussion' && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#0e7490]" />
                    <span className="text-[13px] font-bold text-[#0f172a]">Lesson discussion</span>
                  </div>
                  <div className="rounded-2xl border border-dashed border-[#dce7eb] bg-white p-8 text-center">
                    <p className="text-[14px] font-semibold text-[#0f172a]">No comments yet</p>
                    <p className="mt-1 text-[12px] text-[#64748b]">Be the first to ask a question or share a clinical insight.</p>
                    <button className="mt-4 rounded-full bg-[#0e7490] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#155e75]">
                      Add comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Curriculum sidebar */}
        {sidebarOpen && (
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-white/10 bg-[#1e293b] lg:block">
            <div className="border-b border-white/10 px-4 py-4">
              <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-slate-400">Course content</p>
              <p className="mt-1 text-[13px] font-bold text-white">{course.title}</p>
            </div>
            {course.modules.map((mod) => (
              <div key={mod.id} className="border-b border-white/10">
                <p className="px-4 py-3 text-[11px] font-bold uppercase tracking-[0.1em] text-slate-400">{mod.title}</p>
                {mod.lessons.map((l, i) => (
                  <Link
                    key={l.id}
                    href={`/learn/${l.id}`}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 text-[12px] transition-colors',
                      l.id === lesson.id
                        ? 'bg-[#0e7490]/20 text-white font-semibold'
                        : 'text-slate-400 hover:bg-white/5 hover:text-white',
                    )}
                    aria-current={l.id === lesson.id ? 'page' : undefined}
                  >
                    <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full border border-current text-[9px] font-bold">
                      {l.completed ? '✓' : i + 1}
                    </span>
                    <span className="flex-1 leading-4">{l.title}</span>
                    {l.duration && <span className="text-[10px] opacity-60">{l.duration}</span>}
                  </Link>
                ))}
              </div>
            ))}
          </aside>
        )}
      </div>
    </div>
  );
}
