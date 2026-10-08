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
            <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#075985]">Instructor portal</p>
            <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0F2A3D]">Welcome back, Dr. Haddad</h1>
            <p className="mt-1 text-[14px] text-[#5B7184]">Here&apos;s how your courses are performing this month.</p>
          </div>
          <div className="flex gap-2">
            <Link href="/instructor/courses" className="rounded-full border border-[#0369A1]/15 bg-white px-4 py-2.5 text-[13px] font-bold text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]">
              Manage courses
            </Link>
            <Link href="/instructor/revenue" className="rounded-full bg-[#0369A1] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#075985]">
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
              <h2 className="text-[16px] font-bold text-[#0F2A3D]">Your courses</h2>
              <Link href="/instructor/courses" className="text-[12px] font-bold text-[#075985] hover:underline">View all</Link>
            </div>

            <div className="space-y-3">
              {courses.map((c) => (
                <div key={c.id} className="flex items-center gap-4 rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-[#0369A1]/20 to-[#38BDF8]/35 text-[#075985]">
                    <BookOpen size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="text-[14px] font-bold text-[#0F2A3D]">{c.title}</h3>
                      <Badge variant="green">Published</Badge>
                    </div>
                    <div className="mt-1 flex flex-wrap gap-4 text-[11px] text-[#5B7184]">
                      <span className="flex items-center gap-1"><Users size={12} />{formatNumber(c.studentCount)} students</span>
                      <span className="flex items-center gap-1"><Star size={12} className="fill-amber-400 text-amber-400" />{c.rating}</span>
                      <span>{c.lessonCount} lessons</span>
                      <span className="font-semibold text-[#0F2A3D]">{formatCurrency(c.price)}</span>
                    </div>
                  </div>
                  <button className="shrink-0 rounded-full border border-[#0369A1]/15 px-4 py-2 text-[12px] font-bold text-[#5B7184] hover:border-[#38BDF8] hover:text-[#075985]">
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
                <Link key={a.label} href={a.href} className="rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl transition-all hover:-translate-y-0.5 hover:border-[#38BDF8]">
                  <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#E0F2FE] text-[#0369A1]">
                    <a.icon size={19} />
                  </span>
                  <h3 className="mt-3 text-[14px] font-bold text-[#0F2A3D]">{a.label}</h3>
                  <p className="mt-1 text-[12px] text-[#5B7184]">{a.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
