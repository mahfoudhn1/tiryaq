import { cn } from '@/lib/utils/cn';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  label: string;
  value: string | number;
  detail?: string;
  icon: LucideIcon;
  color?: 'teal' | 'blue' | 'amber' | 'green' | 'slate';
  trend?: string;
  trendUp?: boolean;
  progress?: number;
  className?: string;
}

const iconColors = {
  teal: 'bg-[#d9f3f1] text-[#0e7490]',
  blue: 'bg-[#dbeafe] text-[#1e3a8a]',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-[#e2e8f0] text-[#0f172a]',
};

export function StatCard({ label, value, detail, icon: Icon, color = 'teal', trend, trendUp, progress, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]', className)}>
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#64748b]">{label}</span>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', iconColors[color])}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[28px] font-bold tracking-[-0.06em] text-[#0f172a]">{value}</span>
        {detail && <span className="text-[11px] text-[#64748b]">{detail}</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e2eaee]">
          <div className="h-full rounded-full bg-[#0e7490]" style={{ width: `${progress}%` }} />
        </div>
      )}
      {trend && (
        <div className={cn('mt-2 text-[10px] font-semibold', trendUp ? 'text-emerald-600' : 'text-red-500')}>
          {trendUp ? '+' : ''}{trend}
        </div>
      )}
    </div>
  );
}
