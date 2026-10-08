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
  teal: 'bg-[#E0F2FE] text-[#0369A1]',
  blue: 'bg-[#F0F9FF] text-[#0369A1]',
  amber: 'bg-amber-50 text-amber-600',
  green: 'bg-emerald-50 text-emerald-700',
  slate: 'bg-[#DCEEFC] text-[#0369A1]',
};

export function StatCard({ label, value, detail, icon: Icon, color = 'teal', trend, trendUp, progress, className }: StatCardProps) {
  return (
    <div className={cn('rounded-2xl border border-[#0369A1]/15 bg-white/75 p-5 shadow-[0_10px_30px_rgba(6,45,70,0.07)] backdrop-blur-xl', className)}>
      <div className="flex items-start justify-between">
        <span className="text-[10px] font-bold uppercase tracking-[0.13em] text-[#5B7184]">{label}</span>
        <span className={cn('flex h-8 w-8 items-center justify-center rounded-xl', iconColors[color])}>
          <Icon size={16} />
        </span>
      </div>
      <div className="mt-4 flex items-baseline gap-2">
        <span className="text-[28px] font-bold tracking-[-0.06em] text-[#0F2A3D]">{value}</span>
        {detail && <span className="text-[11px] text-[#5B7184]">{detail}</span>}
      </div>
      {progress !== undefined && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#0369A1]/15">
          <div className="h-full rounded-full bg-[#0284C7]" style={{ width: `${progress}%` }} />
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
