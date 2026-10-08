'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import { BookOpen, ChevronRight, FileText, Plus, Star, Users, Video } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getInstructorCourses } from '@/lib/api/instructor';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default function InstructorCoursesPage() {
  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
  });

  return (
    <AppShell title="Course Management">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <nav className="mb-5 flex items-center gap-1.5 text-[12px] text-[#64748b]" aria-label="Breadcrumb">
          <Link href="/instructor" className="hover:text-[#0e7490]">Instructor portal</Link><ChevronRight size={13} /><span className="text-[#0f172a]">Courses</span>
        </nav>
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div><p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Content studio</p><h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Your courses</h1><p className="mt-1 text-[14px] text-[#64748b]">Manage curriculum, lessons, resources, and learner access.</p></div>
          <button type="button" className="inline-flex items-center gap-2 rounded-full bg-[#0e7490] px-4 py-2.5 text-[13px] font-bold text-white shadow-[0_8px_18px_rgba(14,116,144,0.16)] hover:bg-[#155e75]"><Plus size={16} /> Create course</button>
        </div>
        <div className="mt-8 grid gap-4 sm:grid-cols-3"><Summary label="Published" value={courses?.length ?? 0} /><Summary label="Total learners" value={formatNumber(courses?.reduce((total, course) => total + course.studentCount, 0) ?? 0)} /><Summary label="Lessons" value={courses?.reduce((total, course) => total + course.lessonCount, 0) ?? 0} /></div>
        <div className="mt-8 overflow-hidden rounded-2xl border border-[#dce7eb] bg-white">
          <div className="border-b border-[#e8eff1] px-5 py-4"><h2 className="text-[15px] font-bold text-[#0f172a]">Course library</h2></div>
          {isLoading ? <div className="space-y-3 p-5">{Array.from({ length: 2 }).map((_, index) => <Skeleton key={index} className="h-24" />)}</div> : <div className="divide-y divide-[#e8eff1]">{courses?.map((course) => <article key={course.id} className="flex flex-wrap items-center gap-4 p-5"><span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-[#e0f7f7] text-[#0e7490]"><BookOpen size={22} /></span><div className="min-w-[220px] flex-1"><div className="flex flex-wrap items-center gap-2"><h3 className="text-[14px] font-bold text-[#0f172a]">{course.title}</h3><Badge variant="green">Published</Badge></div><div className="mt-1.5 flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-[#64748b]"><span className="flex items-center gap-1"><Users size={12} />{formatNumber(course.studentCount)} learners</span><span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{course.rating}</span><span>{course.lessonCount} lessons</span><span className="font-semibold text-[#0f172a]">{formatCurrency(course.price)}</span></div></div><div className="flex gap-2"><button type="button" aria-label={`Manage lessons for ${course.title}`} className="rounded-full border border-[#dce7eb] p-2 text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]"><Video size={16} /></button><button type="button" aria-label={`Manage resources for ${course.title}`} className="rounded-full border border-[#dce7eb] p-2 text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]"><FileText size={16} /></button><Link href={`/courses/${course.slug}`} className="rounded-full border border-[#dce7eb] px-3 py-2 text-[12px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">Preview</Link></div></article>)}</div>}
        </div>
      </div>
    </AppShell>
  );
}

function Summary({ label, value }: { label: string; value: string | number }) {
  return <div className="rounded-2xl border border-[#dce7eb] bg-white p-5"><p className="text-[11px] font-bold uppercase tracking-[0.12em] text-[#64748b]">{label}</p><p className="mt-2 text-2xl font-bold tracking-[-0.05em] text-[#0f172a]">{value}</p></div>;
}
