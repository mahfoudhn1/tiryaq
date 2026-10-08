'use client';

import { useQuery } from '@tanstack/react-query';
import Link from 'next/link';
import {
  AlertCircle, BookOpen, DollarSign, GraduationCap,
  UserCheck, Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Skeleton } from '@/components/ui/Skeleton';
import { getAdminStats } from '@/lib/api/admin';
import { formatCurrency, formatNumber } from '@/lib/utils/format';

export default function AdminDashboardPage() {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-stats'],
    queryFn: getAdminStats,
  });

  return (
    <AppShell title="Admin Console">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Platform overview</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Admin Console</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">Manage users, instructors, courses and platform health.</p>
        </div>

        {isLoading || !stats ? (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
          </div>
        ) : (
          <>
            {/* Pending approvals alert */}
            {stats.pendingApprovals > 0 && (
              <Link
                href="/admin/instructors"
                className="mb-6 flex items-center gap-3 rounded-2xl border border-amber-200 bg-amber-50 p-4 transition-colors hover:bg-amber-100"
              >
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-amber-100 text-amber-600">
                  <AlertCircle size={19} />
                </span>
                <div className="flex-1">
                  <p className="text-[13px] font-bold text-amber-900">
                    {stats.pendingApprovals} items awaiting review
                  </p>
                  <p className="text-[12px] text-amber-700">Instructor applications and course submissions need your attention.</p>
                </div>
                <span className="text-[12px] font-bold text-amber-700">Review →</span>
              </Link>
            )}

            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              <StatCard label="Total users" value={formatNumber(stats.totalUsers)} icon={Users} color="blue" trend="8% this month" trendUp />
              <StatCard label="Active students" value={formatNumber(stats.activeStudents)} icon={UserCheck} color="teal" />
              <StatCard label="Instructors" value={stats.totalInstructors} icon={GraduationCap} color="green" />
              <StatCard label="Courses" value={stats.totalCourses} icon={BookOpen} color="amber" />
              <StatCard label="Platform revenue" value={formatCurrency(stats.totalRevenue)} icon={DollarSign} color="green" />
              <StatCard label="Pending approvals" value={stats.pendingApprovals} icon={AlertCircle} color="slate" />
            </div>

            {/* Management links */}
            <h2 className="mb-4 text-[16px] font-bold text-[#0f172a]">Management</h2>
            <div className="grid gap-4 sm:grid-cols-3">
              {[
                { label: 'Instructor approvals', desc: 'Review and approve applications', icon: GraduationCap, href: '/admin/instructors', count: stats.pendingApprovals },
                { label: 'Course moderation', desc: 'Publish, reject or archive courses', icon: BookOpen, href: '/admin/courses' },
                { label: 'User management', desc: 'View and manage all platform users', icon: Users, href: '/admin/users' },
              ].map((m) => (
                <Link key={m.label} href={m.href} className="rounded-2xl border border-[#dce7eb] bg-white p-5 transition-all hover:-translate-y-0.5 hover:border-[#8ecfd3]">
                  <div className="flex items-start justify-between">
                    <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#e0f7f7] text-[#0e7490]">
                      <m.icon size={19} />
                    </span>
                    {m.count ? (
                      <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold text-amber-700">{m.count}</span>
                    ) : null}
                  </div>
                  <h3 className="mt-3 text-[14px] font-bold text-[#0f172a]">{m.label}</h3>
                  <p className="mt-1 text-[12px] text-[#64748b]">{m.desc}</p>
                </Link>
              ))}
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
