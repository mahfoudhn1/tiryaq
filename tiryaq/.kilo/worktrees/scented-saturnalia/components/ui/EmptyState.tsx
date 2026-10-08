import { LucideIcon } from 'lucide-react';
import { Button } from './Button';

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  description: string;
  action?: { label: string; onClick: () => void };
}

export function EmptyState({ icon: Icon, title, description, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#dce7eb] bg-white px-8 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#e0f7f7] text-[#0e7490]">
        <Icon size={26} />
      </span>
      <h3 className="mt-5 text-[17px] font-bold text-[#0f172a]">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-5 text-[#64748b]">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
