import { cn } from '@/lib/utils/cn';

type BadgeVariant = 'teal' | 'blue' | 'amber' | 'red' | 'green' | 'slate' | 'purple';

interface BadgeProps {
  children: React.ReactNode;
  variant?: BadgeVariant;
  className?: string;
}

const styles: Record<BadgeVariant, string> = {
  teal: 'bg-[#e0f7f7] text-[#0e7490] border-[#a9e2e2]',
  blue: 'bg-[#dbeafe] text-[#1e40af] border-[#bfdbfe]',
  amber: 'bg-amber-50 text-amber-700 border-amber-200',
  red: 'bg-red-50 text-red-700 border-red-200',
  green: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  slate: 'bg-[#f1f5f9] text-[#64748b] border-[#e2e8f0]',
  purple: 'bg-purple-50 text-purple-700 border-purple-200',
};

export function Badge({ children, variant = 'slate', className }: BadgeProps) {
  return (
    <span className={cn('inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-[0.08em]', styles[variant], className)}>
      {children}
    </span>
  );
}
