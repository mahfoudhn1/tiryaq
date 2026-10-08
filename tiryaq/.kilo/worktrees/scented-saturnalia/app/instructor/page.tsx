'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  BookOpen, DollarSign, Eye, GraduationCap, Star,
  TrendingUp, Users, Video,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getInstructorStats, getInstructorCourses } from '@/lib/api/instructor';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default function InstructorDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['instructor-stats'],
    queryFn: getInstructorStats,
  });

  const { data: courses = [] } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: getInstructorCourses,
  });

  return (
    <AppShell title="Instructor Dashboard">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        {/* Header */}
        <div className="mb-8 flex flex-wrap items-start justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Instructor portal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Welcome back, Dr. Haddad</h1>
            <p className="mt-1 text-[14px] text-[#64748b]">Here&apos;s how your courses are performing this month.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/instructor/courses" className="rounded-full border border-[#dce7eb] bg-white px-4 py-2.5 text-[13px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
              Manage courses
            </Link>
            <Link href="/instructor/revenue" className="rounded-full bg-[#0e7490] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#155e75]">
              View revenue
            </Link>
          </div>
        </div>

        {isLoading || !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="green" trend="12% vs last month" trendUp />
              <StatCard label="Monthly revenue" value={formatCurrency(stats.monthlyRevenue)} icon={TrendingUp} color="teal" />
              <StatCard label="Total students" value={formatNumber(stats.totalStudents)} icon={Users} color="blue" />
              <StatCard label="Enrollments" value={formatNumber(stats.totalEnrollments)} icon={GraduationCap} color="teal" />
              <StatCard label="Completion rate" value={`${stats.completionRate}%`} icon={Eye} color="amber" progress={stats.completionRate} />
              <StatCard label="Average rating" value={stats.avgRating} detail="out of 5" icon={Star} color="amber" />
            </div>

            {/* Courses */}
            <div className="mb-6 flex items-center justify-between">
              <h2 className="text-[16px] font-bold text-[#0f172a]">Your courses</h2>
              <Link href="/instructor/courses" className="text-[12px] font-bold text-[#0e7490] hover:underline">View all</Link>
            </div>

            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-[#dce7eb] bg-white p-5">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#e0f7f7] to-[#dbeafe] text-[#0e7490]">
                    <BookOpen size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14px] font-bold text-[#0f172a]">{c.title}</h3>
                      <Badge variant="green">Published</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-[#64748b]">
                      <span className="flex items-center gap-1"><Users size={12} />{formatNumber(c.studentCount)} students</span>
                      <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{c.rating}</span>
                      <span>{c.lessonCount} lessons</span>
                      <span className="font-semibold text-[#0f172a]">{formatCurrency(c.price)}</span>
                    </div>
                  </div>
                  <button className="shrink-0 rounded-full border border-[#dce7eb] px-4 py-2 text-[12px] font-bold text-[#64748b] hover:border-[#0e7490] hover:text-[#0e7490]">
                    Edit
                  </button>
                </div>
              ))}
            </div>

            {/* Quick actions */}
            <div className="mt-8 grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Create a course', desc: 'Add modules, lessons and resources', icon: BookOpen, href: '/instructor/courses' },
                { label: 'Schedule live session', desc: 'Host a Q&A or workshop', icon: Video, href: '/live' },
                { label: 'Complete onboarding', desc: 'Verify your credentials', icon: GraduationCap, href: '/instructor/onboarding' },
              ].map((a) => (
                <Link key={a.label} href={a.href} className="rounded-2xl border border-[#dce7eb] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#8ecfd3]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f7f7] text-[#0e7490]">
                    <a.icon size={19} />
                  </span>
                  <h3 className="mt-3 text-[14px] font-bold text-[#0f172a]">{a.label}</h3>
                  <p className="mt-1 text-[12px] text-[#64748b]">{a.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
