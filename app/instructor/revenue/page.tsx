'use client';

import { useQuery } from '@tanstack/react-query';
import { ArrowDownRight, ArrowUpRight, DollarSign, Landmark, TrendingUp, Wallet } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { StatCard } from '@/components/ui/StatCard';
import { Badge } from '@/components/ui/Badge';
import { Skeleton } from '@/components/ui/Skeleton';
import { getRevenue } from '@/lib/api/instructor';
import { formatCurrency, formatDate } from '@/lib/utils/format';
import { cn } from '@/lib/utils/cn';

export default function InstructorRevenuePage() {
  const { data, isLoading } = useQuery({
    queryKey: ['instructor-revenue'],
    queryFn: getRevenue,
  });

  const maxRevenue = data ? Math.max(...data.monthly.map((m) => m.amount)) : 1;

  return (
    <AppShell title="Revenue">
      <div className="mx-auto max-w-5xl px-5 py-8 sm:px-8">
        <div className="mb-8">
          <p className="text-[11px] font-bold uppercase tracking-[0.15em] text-[#0e7490]">Earnings</p>
          <h1 className="mt-2 text-3xl font-bold tracking-[-0.06em] text-[#0f172a]">Revenue</h1>
          <p className="mt-1 text-[14px] text-[#64748b]">Track your earnings, payouts and transaction history.</p>
        </div>

        {isLoading || !data ? (
          <div className="space-y-4">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-28" />)}
            </div>
            <Skeleton className="h-64" />
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              <StatCard label="Total revenue" value={formatCurrency(data.stats.totalRevenue)} icon={DollarSign} color="green" />
              <StatCard label="This month" value={formatCurrency(data.stats.monthlyRevenue)} icon={TrendingUp} color="teal" trend="11% vs Aug" trendUp />
              <StatCard label="Pending payout" value={formatCurrency(data.stats.pendingPayout)} icon={Landmark} color="amber" />
              <StatCard label="Available balance" value={formatCurrency(data.stats.balance)} icon={Wallet} color="blue" />
            </div>

            {/* Monthly chart */}
            <div className="mb-8 rounded-2xl border border-[#dce7eb] bg-white p-6">
              <h2 className="mb-6 text-[16px] font-bold text-[#0f172a]">Monthly revenue</h2>
              <div className="flex h-48 items-end gap-3">
                {data.monthly.map((m) => (
                  <div key={m.month} className="flex flex-1 flex-col items-center gap-2">
                    <span className="text-[10px] font-bold text-[#0f172a]">{formatCurrency(m.amount)}</span>
                    <div
                      className="w-full rounded-t-lg bg-[#0e7490] transition-all"
                      style={{ height: `${(m.amount / maxRevenue) * 140}px` }}
                    />
                    <span className="text-[10px] text-[#94a3b8]">{m.month}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Transactions */}
            <h2 className="mb-4 text-[16px] font-bold text-[#0f172a]">Recent transactions</h2>
            <div className="overflow-hidden rounded-2xl border border-[#dce7eb] bg-white">
              <table className="w-full">
                <caption className="sr-only">Recent transactions</caption>
                <thead>
                  <tr className="border-b border-[#dce7eb] bg-[#f8fafc]">
                    <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Description</th>
                    <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Date</th>
                    <th scope="col" className="px-5 py-3 text-left text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Status</th>
                    <th scope="col" className="px-5 py-3 text-right text-[10px] font-bold uppercase tracking-[0.1em] text-[#64748b]">Amount</th>
                  </tr>
                </thead>
                <tbody>
                  {data.transactions.map((tx) => (
                    <tr key={tx.id} className="border-b border-[#f1f5f9] last:border-0">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <span className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-lg', tx.amount > 0 ? 'bg-emerald-50 text-emerald-600' : 'bg-[#f1f5f9] text-[#64748b]')}>
                            {tx.amount > 0 ? <ArrowDownRight size={15} /> : <ArrowUpRight size={15} />}
                          </span>
                          <span className="text-[13px] font-medium text-[#0f172a]">{tx.description}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-[12px] text-[#64748b]">{formatDate(tx.date)}</td>
                      <td className="px-5 py-4">
                        <Badge variant={tx.status === 'completed' ? 'green' : tx.status === 'pending' ? 'amber' : 'red'}>
                          {tx.status}
                        </Badge>
                      </td>
                      <td className={cn('px-5 py-4 text-right text-[13px] font-bold tabular-nums', tx.amount > 0 ? 'text-emerald-600' : 'text-[#0f172a]')}>
                        {tx.amount > 0 ? '+' : ''}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
      </div>
    </AppShell>
  );
}
