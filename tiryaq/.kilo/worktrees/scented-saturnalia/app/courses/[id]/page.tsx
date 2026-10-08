'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useQuery, useMutation } from '@tanstack/react-query';
import {
  BookOpen, Check, ChevronDown, ChevronRight, Clock,
  Download, FileText, Lock, Play, Star, Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCourse, enrollCourse } from '@/lib/api/courses';
import { MOCK_COURSE_REVIEWS } from '@/lib/mock/data';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { CourseModule } from '@/types/medical';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['m-1']));

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollCourse(course!.id),
  });

  const toggleModule = (id: string) => {
    setExpandedModules((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  if (isLoading) {
    return (
      <AppShell>
        <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8 space-y-6">
          <Skeleton className="h-10 w-1/2" />
          <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
            <div className="space-y-4">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-6 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
            </div>
            <Skeleton className="h-80 w-full" />
          </div>
        </div>
      </AppShell>
    );
  }

  if (!course) {
    return (
      <AppShell>
        <div className="flex h-64 flex-col items-center justify-center text-center">
          <p className="text-[16px] font-bold text-[#0f172a]">Course not found</p>
          <Link href="/courses" className="mt-3 text-[#0e7490] hover:underline text-[13px]">Back to marketplace</Link>
        </div>
      </AppShell>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <AppShell title={course.title}>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-[12px] text-[#64748b]" aria-label="Breadcrumb">
          <Link href="/courses" className="hover:text-[#0e7490]">Courses</Link>
          <ChevronRight size={13} />
          <span className="text-[#0f172a]">{course.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div>
            {/* Hero */}
            <div className="mb-6 flex h-52 items-center justify-center rounded-2xl bg-gradient-to-br from-[#e0f7f7] to-[#dbeafe]">
              <BookOpen size={56} className="text-[#0e7490]/30" aria-hidden />
            </div>

            {/* Title block */}
            <div className="flex flex-wrap items-start gap-3">
              {course.badges.map((b) => <Badge key={b} variant={b === 'Best Seller' ? 'amber' : b === 'New' ? 'teal' : 'blue'}>{b}</Badge>)}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">{course.title}</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#64748b]">{course.description}</p>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-[#64748b]">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <strong className="font-bold text-[#0f172a]">{course.rating}</strong>
                ({formatNumber(course.reviewCount)} reviews)
              </span>
              <span className="flex items-center gap-1"><Users size={14} />{formatNumber(course.studentCount)} students</span>
              <span className="flex items-center gap-1"><Clock size={14} />{course.duration}</span>
              <span>{totalLessons} lessons</span>
            </div>

            {/* Instructor */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#dce7eb] bg-white p-4">
              <Avatar initials={course.instructor.initials} size="lg" />
              <div>
                <p className="text-[13px] font-bold text-[#0f172a]">{course.instructor.name}</p>
                <p className="text-[12px] text-[#64748b]">{course.instructor.specialty} · {course.instructor.rating} rating · {formatNumber(course.instructor.studentCount)} students</p>
                <p className="mt-1 text-[12px] leading-5 text-[#64748b]">{course.instructor.bio}</p>
              </div>
            </div>

            {/* Curriculum */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold tracking-[-0.04em] text-[#0f172a]">Course curriculum</h2>
              <div className="space-y-2">
                {course.modules.map((mod) => (
                  <ModuleAccordion
                    key={mod.id}
                    module={mod}
                    expanded={expandedModules.has(mod.id)}
                    enrolled={!!course.enrolled}
                    onToggle={() => toggleModule(mod.id)}
                  />
                ))}
              </div>
            </div>

            {/* Reviews */}
            <div className="mt-10">
              <h2 className="mb-4 text-xl font-bold tracking-[-0.04em] text-[#0f172a]">Student reviews</h2>
              <div className="space-y-4">
                {MOCK_COURSE_REVIEWS.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-[#dce7eb] bg-white p-5">
                    <div className="flex items-center gap-3">
                      <Avatar initials={r.initials} size="sm" />
                      <div>
                        <p className="text-[13px] font-bold text-[#0f172a]">{r.author}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-[#e2e8f0]'} aria-hidden />
                          ))}
                          <span className="ml-1 text-[10px] text-[#94a3b8]">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[#64748b]">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase panel */}
          <aside className="lg:sticky lg:top-[84px] lg:h-fit">
            <div className="rounded-2xl border border-[#dce7eb] bg-white p-6 shadow-[0_8px_30px_rgba(15,23,42,0.08)]">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-[#0f172a]">{formatCurrency(course.price)}</span>
                {course.originalPrice && (
                  <span className="text-[15px] text-[#94a3b8] line-through">{formatCurrency(course.originalPrice)}</span>
                )}
              </div>

              {course.enrolled ? (
                <Link
                  href={`/learn/${course.modules[0]?.lessons[0]?.id ?? 'lesson-1-1'}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0e7490] py-3 text-[14px] font-bold text-white hover:bg-[#155e75]"
                >
                  <Play size={16} /> Continue learning
                </Link>
              ) : (
                <Button
                  className="mt-4 w-full"
                  size="lg"
                  loading={enrollMutation.isPending}
                  onClick={() => enrollMutation.mutate()}
                >
                  Enrol now
                </Button>
              )}

              {enrollMutation.isSuccess && (
                <p className="mt-2 flex items-center gap-1.5 text-[12px] font-semibold text-emerald-600">
                  <Check size={14} /> Enrolled successfully
                </p>
              )}

              <div className="mt-5 space-y-2.5 text-[12px] text-[#64748b]">
                <p className="flex items-center gap-2"><Clock size={14} />{course.duration} of content</p>
                <p className="flex items-center gap-2"><BookOpen size={14} />{totalLessons} lessons</p>
                <p className="flex items-center gap-2"><Download size={14} />Downloadable resources</p>
                <p className="flex items-center gap-2"><Check size={14} />Certificate of completion</p>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </AppShell>
  );
}

function ModuleAccordion({ module, expanded, enrolled, onToggle }: { module: CourseModule; expanded: boolean; enrolled: boolean; onToggle: () => void }) {
  const free = module.lessons.filter((l) => l.free).length;
  return (
    <div className="overflow-hidden rounded-2xl border border-[#dce7eb] bg-white">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-[14px] font-bold text-[#0f172a]">{module.title}</p>
          <p className="mt-0.5 text-[11px] text-[#64748b]">{module.lessons.length} lessons{free > 0 && ` · ${free} free`}</p>
        </div>
        <ChevronDown size={18} className={cn('text-[#94a3b8] transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <ul className="border-t border-[#f1f5f9]">
          {module.lessons.map((lesson) => {
            const unlocked = enrolled || lesson.free;
            return (
              <li key={lesson.id} className="flex items-center gap-3 border-b border-[#f1f5f9] px-5 py-3 last:border-0">
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', lesson.type === 'resource' ? 'bg-[#f1f5f9] text-[#64748b]' : unlocked ? 'bg-[#e0f7f7] text-[#0e7490]' : 'bg-[#f1f5f9] text-[#94a3b8]')}>
                  {lesson.type === 'resource' ? <FileText size={14} /> : unlocked ? <Play size={14} /> : <Lock size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('truncate text-[13px]', unlocked ? 'font-medium text-[#0f172a]' : 'text-[#94a3b8]')}>
                    {lesson.title}
                  </p>
                  {lesson.duration && <p className="text-[10px] text-[#94a3b8]">{lesson.duration}</p>}
                </div>
                {lesson.completed && <Check size={14} className="shrink-0 text-emerald-500" />}
                {lesson.free && !lesson.completed && <Badge variant="teal">Free</Badge>}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
