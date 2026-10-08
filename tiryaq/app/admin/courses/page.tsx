'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Archive, BookOpen, Check, Eye, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getCourseModeration, approveCourse, rejectCourse } from '@/lib/api/admin';
import { formatDate, formatNumber } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';
import { AdminCourse } from '@/types/medical';

type Tab = 'pending' | 'published' | 'rejected' | 'archived';

export default function AdminCoursesPage() {
  const queryClient = useQueryClient();
  const [tab, setTab] = useState<Tab>('pending');

  const { data: courses = [], isLoading } = useQuery({
    queryKey: ['admin-courses'],
    queryFn: () => getCourseModeration(),
  });

  const approveMutation = useMutation({
    mutationFn: approveCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectCourse,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['admin-courses'] }),
  });

  const counts: Record<Tab, number> = {
    pending: courses.filter((c) => c.status === 'pending').length,
    published: courses.filter((c) => c.status === 'published').length,
    rejected: courses.filter((c) => c.status === 'rejected').length,
    archived: courses.filter((c) => c.status === 'archived').length,
  };

  const filtered = courses.filter((c) => c.status === tab);

  return (
    <AppShell title="Course Moderation">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075985]">Moderation</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">Course moderation</h1>
          <p className="mt-1 text-[14px] text-[#5B7184]">Review submissions and manage published content.</p>
        </div>

        {/* Tabs */}
        <div className="mb-5 flex flex-wrap gap-2" role="tablist" aria-label="Course status">
          {(['pending', 'published', 'rejected', 'archived'] as Tab[]).map((t) => (
            <button
              key={t}
              role="tab"
              aria-selected={tab === t}
              onClick={() => setTab(t)}
              className={cn(
                'flex items-center gap-2 rounded-full px-4 py-2 text-[12px] font-semibold capitalize transition-colors',
                tab === t ? 'bg-[#0369A1] text-white' : 'border border-[#0369A1]/15 bg-white text-[#5B7184] hover:border-[#38BDF8]',
              )}
            >
              {t}
              <span className={cn('rounded-full px-1.5 text-[10px] font-bold', tab === t ? 'bg-white/20' : 'bg-[#0369A1]/10')}>
                {counts[t]}
              </span>
            </button>
          ))}
        </div>

        {isLoading ? (
          <Skeleton className="h-72" />
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0369A1]/15 bg-white/75 py-16 text-center backdrop-blur-xl">
            <BookOpen size={28} className="text-[#5B7184]" />
            <p className="mt-3 text-[14px] font-bold text-[#0F2A3D]">No {tab} courses</p>
            <p className="mt-1 text-[12px] text-[#5B7184]">Nothing to review in this category right now.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((course) => (
              <CourseModerationRow
                key={course.id}
                course={course}
                onApprove={() => approveMutation.mutate(course.id)}
                onReject={() => rejectMutation.mutate(course.id)}
                busy={approveMutation.isPending || rejectMutation.isPending}
              />
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}

function CourseModerationRow({ course, onApprove, onReject, busy }: {
  course: AdminCourse; onApprove: () => void; onReject: () => void; busy: boolean;
}) {
  return (
    <div className="flex flex-wrap items-center gap-4 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
      <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0369A1]/20 to-[#38BDF8]/35 text-[#075985]">
        <BookOpen size={21} />
      </span>

      <div className="min-w-0 flex-1">
        <div className="flex flex-wrap items-center gap-2">
          <h3 className="text-[14px] font-bold text-[#0F2A3D]">{course.title}</h3>
          <Badge variant={
            course.status === 'published' ? 'green'
              : course.status === 'rejected' ? 'red'
              : course.status === 'archived' ? 'slate'
              : 'amber'
          }>
            {course.status}
          </Badge>
        </div>
        <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-[#5B7184]">
          <span>{course.instructor}</span>
          <span>{course.specialty}</span>
          <span>Submitted {formatDate(course.submittedAt)}</span>
          {course.studentCount > 0 && <span>{formatNumber(course.studentCount)} students</span>}
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <button className="rounded-lg p-2 text-[#5B7184] hover:bg-[#0369A1]/10 hover:text-[#0F2A3D]" aria-label={`Preview ${course.title}`}>
          <Eye size={16} />
        </button>

        {course.status === 'pending' && (
          <>
            <button
              onClick={onApprove}
              disabled={busy}
              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-3 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
            >
              <Check size={13} /> Publish
            </button>
            <button
              onClick={onReject}
              disabled={busy}
              className="flex items-center gap-1 rounded-lg bg-red-50 px-3 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
            >
              <X size={13} /> Reject
            </button>
          </>
        )}

        {course.status === 'published' && (
          <button className="flex items-center gap-1 rounded-lg bg-[#0369A1]/10 px-3 py-1.5 text-[11px] font-bold text-[#5B7184] hover:bg-[#0369A1]/15">
            <Archive size={13} /> Archive
          </button>
        )}
      </div>
    </div>
  );
}
