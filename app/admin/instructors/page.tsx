'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, Eye, Search, X } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Avatar } from '@/components/ui/Avatar';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import {
  getInstructorApplications, approveInstructor, rejectInstructor,
} from '@/lib/api/admin';
import { formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

type StatusFilter = 'all' | 'pending' | 'approved' | 'rejected';

export default function AdminInstructorsPage() {
  const queryClient = useQueryClient();
  const [filter, setFilter] = useState<StatusFilter>('all');
  const [search, setSearch] = useState('');

  const { data: applications = [], isLoading } = useQuery({
    queryKey: ['instructor-applications'],
    queryFn: getInstructorApplications,
  });

  const approveMutation = useMutation({
    mutationFn: approveInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-applications'] }),
  });

  const rejectMutation = useMutation({
    mutationFn: rejectInstructor,
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['instructor-applications'] }),
  });

  const filtered = applications
    .filter((a) => filter === 'all' || a.status === filter)
    .filter((a) => !search || a.name.toLowerCase().includes(search.toLowerCase()) || a.specialty.toLowerCase().includes(search.toLowerCase()));

  const pendingCount = applications.filter((a) => a.status === 'pending').length;

  return (
    <AppShell title="Instructor Approvals">
      <div className="mx-auto max-w-6xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Moderation</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Instructor applications</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">
            {pendingCount} application{pendingCount !== 1 ? 's' : ''} awaiting review.
          </p>
        </div>

        {/* Controls */}
        <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-wrap gap-2" role="group" aria-label="Filter by status">
            {(['all', 'pending', 'approved', 'rejected'] as StatusFilter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={cn(
                  'rounded-full px-4 py-2 text-[12px] font-semibold capitalize transition-colors',
                  filter === f ? 'bg-[#0e7490] text-white' : 'border border-[#dce7eb] bg-white text-[#64748b] hover:border-[#8ecfd3]',
                )}
                aria-pressed={filter === f}
              >
                {f}
              </button>
            ))}
          </div>

          <div className="relative sm:w-64">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#94a3b8]" aria-hidden />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search by name or specialty…"
              className="w-full rounded-xl border border-[#dce7eb] bg-white py-2 pl-9 pr-3 text-[13px] focus:border-[#0e7490] focus:outline-none"
              aria-label="Search applications"
            />
          </div>
        </div>

        {/* Table */}
        {isLoading ? (
          <Skeleton className="h-72" />
        ) : (
          <div className="overflow-x-auto rounded-2xl border border-[#dce7eb] bg-white">
            <table className="w-full min-w-[720px]">
              <caption className="sr-only">Instructor applications</caption>
              <thead>
                <tr className="border-b border-[#dce7eb] bg-[#f8fafc]">
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Applicant</th>
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Specialty</th>
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Applied</th>
                  <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Status</th>
                  <th scope="col" className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((app) => (
                  <tr key={app.id} className="border-b border-[#f1f5f9] last:border-0 hover:bg-[#f8fafc]">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <Avatar initials={app.initials} size="sm" />
                        <div>
                          <p className="text-[13px] font-bold text-[#0f172a]">{app.name}</p>
                          <p className="text-[11px] text-[#94a3b8]">{app.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-[13px] text-[#334155]">{app.specialty}</td>
                    <td className="px-5 py-4 text-[12px] text-[#64748b]">{formatDate(app.appliedAt)}</td>
                    <td className="px-5 py-4">
                      <Badge variant={app.status === 'approved' ? 'green' : app.status === 'rejected' ? 'red' : 'amber'}>
                        {app.status}
                      </Badge>
                    </td>
                    <td className="px-5 py-4">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          className="rounded-lg p-2 text-[#64748b] hover:bg-[#f1f5f9] hover:text-[#0f172a]"
                          aria-label={`View ${app.name}'s application`}
                        >
                          <Eye size={15} />
                        </button>
                        {app.status === 'pending' && (
                          <>
                            <button
                              onClick={() => approveMutation.mutate(app.id)}
                              disabled={approveMutation.isPending}
                              className="flex items-center gap-1 rounded-lg bg-emerald-50 px-2.5 py-1.5 text-[11px] font-bold text-emerald-700 hover:bg-emerald-100 disabled:opacity-50"
                              aria-label={`Approve ${app.name}`}
                            >
                              <Check size={13} /> Approve
                            </button>
                            <button
                              onClick={() => rejectMutation.mutate(app.id)}
                              disabled={rejectMutation.isPending}
                              className="flex items-center gap-1 rounded-lg bg-red-50 px-2.5 py-1.5 text-[11px] font-bold text-red-600 hover:bg-red-100 disabled:opacity-50"
                              aria-label={`Reject ${app.name}`}
                            >
                              <X size={13} /> Reject
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {filtered.length === 0 && (
              <div className="py-16 text-center">
                <p className="text-[14px] font-bold text-[#0f172a]">No applications found</p>
                <p className="mt-1 text-[12px] text-[#64748b]">Try a different filter or search term.</p>
              </div>
            )}
          </div>
        )}
      </div>
    </AppShell>
  );
}
