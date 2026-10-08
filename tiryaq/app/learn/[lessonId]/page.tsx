'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2, ChevronLeft, ChevronRight, Download, FileText,
  List, Maximize2, MessageSquare, PenLine, Play,
} from 'lucide-react';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { completeLesson, getLesson } from '@/lib/api/courses';
import { cn } from '@/lib/utils/cn';

const TABS = ['Description', 'Resources', 'Notes', 'Discussion'] as const;
type Tab = typeof TABS[number];

export default function LessonPlayerPage({ params }: { params: Promise<{ lessonId: string }> }) {
  const { lessonId } = use(params);
  const [activeTab, setActiveTab] = useState<Tab>('Description');
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [notes, setNotes] = useState('');

  const queryClient = useQueryClient();

  const { data: lesson, isLoading } = useQuery({
    queryKey: ['lesson', lessonId],
    queryFn: () => getLesson(lessonId),
  });

  const completeMutation = useMutation({
    mutationFn: () => completeLesson(lessonId),
    onSuccess: () => {
      // Refresh the lesson and the course outline so the tick appears.
      queryClient.invalidateQueries({ queryKey: ['lesson', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['course'] });
      queryClient.invalidateQueries({ queryKey: ['enrollments'] });
    },
  });

  if (isLoading || !lesson) {
    return (
      <div className="flex h-screen flex-col gap-4 bg-gradient-to-br from-[#0369A1] to-[#075985] p-6">
        <Skeleton className="h-10 w-72" />
        <Skeleton className="h-full w-full" />
      </div>
    );
  }

  const course = lesson.course;
  const currentModule = course.modules.find((m) => m.id === lesson.moduleId);
  const moduleLessons = currentModule?.lessons ?? [];
  const lessonPosition = moduleLessons.findIndex((l) => l.id === lesson.id) + 1;

  return (
    <div className="flex h-screen flex-col bg-gradient-to-br from-[#0369A1] to-[#075985]">
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
          <button
            onClick={() => completeMutation.mutate()}
            disabled={completeMutation.isPending || lesson.completed}
            className={cn(
              'flex items-center gap-1.5 rounded-full px-3 py-1.5 text-[11px] font-bold transition-colors disabled:opacity-60',
              lesson.completed
                ? 'bg-emerald-500/20 text-emerald-300'
                : 'bg-white/10 text-white hover:bg-white/20',
            )}
          >
            <CheckCircle2 size={13} />
            {lesson.completed ? 'Completed' : completeMutation.isPending ? 'Saving…' : 'Mark complete'}
          </button>
          <span className="text-[12px] text-slate-400">
            Lesson {lessonPosition} of {moduleLessons.length}
          </span>
          <button
            onClick={() => setSidebarOpen((v) => !v)}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-white/10 hover:text-white"
            aria-label="Toggle curriculum"
          >
            <List size={18} />
          </button>
        </div>
      </header>

      {completeMutation.isError && (
        <p className="bg-amber-500/15 px-5 py-2 text-[12px] font-semibold text-amber-200">
          {(completeMutation.error as Error).message}
        </p>
      )}

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
          <div className="flex-1 bg-[#FFFFFF]">
            {/* Lesson title */}
            <div className="border-b border-[#0369A1]/15 bg-white px-6 py-5">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h1 className="text-xl font-bold tracking-tight text-[#0F2A3D]">{lesson.title}</h1>
                  <p className="mt-1 text-[13px] text-[#5B7184]">
                    {lesson.moduleTitle}
                    {lesson.duration ? ` · ${lesson.duration}` : ''}
                    {lesson.free ? ' · Free preview' : ''}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button className="flex items-center gap-1.5 rounded-full border border-[#0369A1]/15 bg-white px-3 py-1.5 text-[12px] font-semibold text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]">
                    <ChevronLeft size={14} /> Prev
                  </button>
                  <button className="flex items-center gap-1.5 rounded-full bg-[#0369A1] px-3 py-1.5 text-[12px] font-semibold text-white hover:bg-[#075985]">
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
                        ? 'bg-[#E0F2FE] text-[#0369A1]'
                        : 'text-[#5B7184] hover:bg-[#0369A1]/10',
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
                  <p className="text-[14px] leading-7 text-[#5B7184]">
                    {lesson.description || `This lesson is part of ${lesson.moduleTitle} in ${course.title}.`}
                  </p>
                  <h3 className="mt-5 text-[15px] font-bold text-[#0F2A3D]">Lesson details</h3>
                  <ul className="mt-2 space-y-1.5 text-[13px] text-[#5B7184]">
                    <li>Format: {lesson.type === 'video' ? 'Video lesson' : lesson.type === 'quiz' ? 'Quiz' : 'Downloadable resource'}</li>
                    {lesson.duration && <li>Runtime: {lesson.duration}</li>}
                    <li>Module: {lesson.moduleTitle}</li>
                    <li>Course: {course.title} — {course.specialty}, {course.level}</li>
                  </ul>
                  <div className="mt-6 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                    <p className="text-[10px] font-bold uppercase tracking-[0.12em] text-[#075985]">Course outcome</p>
                    <p className="mt-2 text-[13px] leading-6 text-[#5B7184]">{course.description}</p>
                  </div>
                </div>
              )}

              {activeTab === 'Resources' && (
                <div className="space-y-3">
                  {(lesson.resources ?? []).length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-[#0369A1]/15 bg-white/75 p-8 text-center backdrop-blur-xl">
                      <p className="text-[14px] font-semibold text-[#0F2A3D]">No resources for this lesson</p>
                      <p className="mt-1 text-[12px] text-[#5B7184]">Downloadable slides and references will appear here.</p>
                    </div>
                  ) : (
                    (lesson.resources ?? []).map((resource) => (
                      <div key={resource.id} className="flex items-center gap-4 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-4 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#F0F9FF] text-[#0369A1]">
                          <FileText size={20} />
                        </span>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-[13px] font-semibold text-[#0F2A3D]">{resource.name}</p>
                          <p className="text-[11px] text-[#5B7184]">{resource.size || resource.type}</p>
                        </div>
                        <button className="flex items-center gap-1.5 rounded-full border border-[#0369A1]/15 px-3 py-1.5 text-[11px] font-bold text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]">
                          <Download size={13} /> Download
                        </button>
                      </div>
                    ))
                  )}
                </div>
              )}

              {activeTab === 'Notes' && (
                <div>
                  <div className="mb-3 flex items-center gap-2">
                    <PenLine size={16} className="text-[#075985]" />
                    <span className="text-[13px] font-bold text-[#0F2A3D]">Your notes</span>
                    <Badge variant="teal">Local draft</Badge>
                  </div>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Take notes while watching. Notes stay in this browser until a notes API is added."
                    className="h-64 w-full resize-none rounded-2xl border border-[#0369A1]/15 bg-white p-4 text-[13px] leading-6 text-[#5B7184] placeholder:text-[#5B7184] focus:border-[#0369A1] focus:outline-none focus:ring-2 focus:ring-[#0369A1]/20"
                    aria-label="Lesson notes"
                  />
                </div>
              )}

              {activeTab === 'Discussion' && (
                <div>
                  <div className="mb-4 flex items-center gap-2">
                    <MessageSquare size={16} className="text-[#075985]" />
                    <span className="text-[13px] font-bold text-[#0F2A3D]">Lesson discussion</span>
                  </div>
                  <div className="rounded-2xl border border-dashed border-[#0369A1]/15 bg-white/75 p-8 text-center backdrop-blur-xl">
                    <p className="text-[14px] font-semibold text-[#0F2A3D]">No comments yet</p>
                    <p className="mt-1 text-[12px] text-[#5B7184]">Be the first to ask a question or share a clinical insight.</p>
                    <button className="mt-4 rounded-full bg-[#0369A1] px-4 py-2 text-[13px] font-bold text-white hover:bg-[#075985]">
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
          <aside className="hidden w-72 shrink-0 overflow-y-auto border-l border-white/10 bg-[#16232F] lg:block">
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
                        ? 'bg-[#0369A1]/20 text-white font-semibold'
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
