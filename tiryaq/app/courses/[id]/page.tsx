'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import {
  BookOpen, Check, ChevronDown, ChevronRight, Clock,
  Download, FileText, Lock, Play, Star, Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { Skeleton } from '@/components/ui/Skeleton';
import { enrollCourse, getCourse, getCourseReviews } from '@/lib/api/courses';
import { formatCurrency, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { CourseModule } from '@/types/medical';

export default function CourseDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const queryClient = useQueryClient();
  const [expandedModules, setExpandedModules] = useState<Set<string>>(new Set(['m-1']));

  const { data: course, isLoading } = useQuery({
    queryKey: ['course', id],
    queryFn: () => getCourse(id),
  });

  const enrollMutation = useMutation({
    mutationFn: () => enrollCourse(course!.id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['course', id] }),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['course-reviews', id],
    queryFn: () => getCourseReviews(id),
    enabled: Boolean(course),
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
          <p className="text-[16px] font-bold text-[#0F2A3D]">Course not found</p>
          <Link href="/courses" className="mt-3 text-[#075985] hover:underline text-[13px]">Back to marketplace</Link>
        </div>
      </AppShell>
    );
  }

  const totalLessons = course.modules.reduce((acc, m) => acc + m.lessons.length, 0);

  return (
    <AppShell title={course.title}>
      <div className="mx-auto max-w-7xl px-5 py-8 sm:px-8">
        {/* Breadcrumb */}
        <nav className="mb-5 flex items-center gap-1.5 text-[12px] text-[#5B7184]" aria-label="Breadcrumb">
          <Link href="/courses" className="hover:text-[#075985]">Courses</Link>
          <ChevronRight size={13} />
          <span className="text-[#0F2A3D]">{course.title}</span>
        </nav>

        <div className="grid gap-8 lg:grid-cols-[1fr_340px]">
          {/* Main content */}
          <div>
            {/* Hero */}
            <div className="mb-6 flex h-52 items-center justify-center rounded-2xl bg-gradient-to-br from-[#0369A1]/20 to-[#38BDF8]/35">
              <BookOpen size={56} className="text-[#075985]" aria-hidden />
            </div>

            {/* Title block */}
            <div className="flex flex-wrap items-start gap-3">
              {course.badges.map((b) => <Badge key={b} variant={b === 'Best Seller' ? 'amber' : b === 'New' ? 'teal' : 'blue'}>{b}</Badge>)}
            </div>
            <h1 className="mt-3 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">{course.title}</h1>
            <p className="mt-3 text-[15px] leading-7 text-[#5B7184]">{course.description}</p>

            {/* Stats */}
            <div className="mt-4 flex flex-wrap items-center gap-4 text-[12px] text-[#5B7184]">
              <span className="flex items-center gap-1">
                <Star size={14} className="fill-amber-400 text-amber-400" />
                <strong className="font-bold text-[#0F2A3D]">{course.rating}</strong>
                ({formatNumber(course.reviewCount)} reviews)
              </span>
              <span className="flex items-center gap-1"><Users size={14} />{formatNumber(course.studentCount)} students</span>
              <span className="flex items-center gap-1"><Clock size={14} />{course.duration}</span>
              <span>{totalLessons} lessons</span>
            </div>

            {/* Instructor */}
            <div className="mt-6 flex items-center gap-3 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-4 backdrop-blur-xl">
              <Avatar initials={course.instructor.initials} size="lg" />
              <div>
                <p className="text-[13px] font-bold text-[#0F2A3D]">{course.instructor.name}</p>
                <p className="text-[12px] text-[#5B7184]">{course.instructor.specialty} · {course.instructor.rating} rating · {formatNumber(course.instructor.studentCount)} students</p>
                <p className="mt-1 text-[12px] leading-5 text-[#5B7184]">{course.instructor.bio}</p>
              </div>
            </div>

            {/* Curriculum */}
            <div className="mt-8">
              <h2 className="mb-4 text-xl font-bold tracking-[-0.04em] text-[#0F2A3D]">Course curriculum</h2>
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
              <h2 className="mb-4 text-xl font-bold tracking-[-0.04em] text-[#0F2A3D]">Student reviews</h2>
              <div className="space-y-4">
                {reviews.length === 0 && (
                  <p className="rounded-2xl border border-dashed border-[#0369A1]/15 bg-white/75 p-6 text-center text-[13px] text-[#5B7184] backdrop-blur-xl">
                    No reviews yet. Be the first to review this course.
                  </p>
                )}
                {reviews.map((r) => (
                  <div key={r.id} className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 backdrop-blur-xl">
                    <div className="flex items-center gap-3">
                      <Avatar initials={r.initials} size="sm" />
                      <div>
                        <p className="text-[13px] font-bold text-[#0F2A3D]">{r.author}</p>
                        <div className="flex items-center gap-1">
                          {Array.from({ length: 5 }).map((_, i) => (
                            <Star key={i} size={11} className={i < r.rating ? 'fill-amber-400 text-amber-400' : 'text-[#EAF1F7]'} aria-hidden />
                          ))}
                          <span className="ml-1 text-[10px] text-[#5B7184]">{r.date}</span>
                        </div>
                      </div>
                    </div>
                    <p className="mt-3 text-[13px] leading-6 text-[#5B7184]">{r.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Purchase panel */}
          <aside className="lg:sticky lg:top-[84px] lg:h-fit">
            <div className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-6 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
              <div className="flex items-baseline gap-3">
                <span className="text-3xl font-bold tracking-tight text-[#0F2A3D]">{formatCurrency(course.price)}</span>
                {course.originalPrice && (
                  <span className="text-[15px] text-[#5B7184] line-through">{formatCurrency(course.originalPrice)}</span>
                )}
              </div>

              {course.enrolled ? (
                <Link
                  href={`/learn/${course.modules[0]?.lessons[0]?.id ?? 'lesson-1-1'}`}
                  className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-[#0369A1] py-3 text-[14px] font-bold text-white hover:bg-[#075985]"
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

              <div className="mt-5 space-y-2.5 text-[12px] text-[#5B7184]">
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
    <div className="overflow-hidden rounded-2xl border border-[#0369A1]/15 bg-white/75 backdrop-blur-xl">
      <button
        onClick={onToggle}
        className="flex w-full items-center justify-between px-5 py-4 text-left"
        aria-expanded={expanded}
      >
        <div>
          <p className="text-[14px] font-bold text-[#0F2A3D]">{module.title}</p>
          <p className="mt-0.5 text-[11px] text-[#5B7184]">{module.lessons.length} lessons{free > 0 && ` · ${free} free`}</p>
        </div>
        <ChevronDown size={18} className={cn('text-[#5B7184] transition-transform', expanded && 'rotate-180')} />
      </button>

      {expanded && (
        <ul className="border-t border-[#0369A1]/10">
          {module.lessons.map((lesson) => {
            const unlocked = enrolled || lesson.free;
            return (
              <li key={lesson.id} className="flex items-center gap-3 border-b border-[#0369A1]/10 px-5 py-3 last:border-0">
                <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-lg', lesson.type === 'resource' ? 'bg-[#0369A1]/10 text-[#5B7184]' : unlocked ? 'bg-[#E0F2FE] text-[#0369A1]' : 'bg-[#0369A1]/10 text-[#5B7184]')}>
                  {lesson.type === 'resource' ? <FileText size={14} /> : unlocked ? <Play size={14} /> : <Lock size={14} />}
                </span>
                <div className="flex-1 min-w-0">
                  <p className={cn('truncate text-[13px]', unlocked ? 'font-medium text-[#0F2A3D]' : 'text-[#5B7184]')}>
                    {lesson.title}
                  </p>
                  {lesson.duration && <p className="text-[10px] text-[#5B7184]">{lesson.duration}</p>}
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
