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
    <div className="flex flex-col items-center justify-center rounded-2xl border border-dashed border-[#0369A1]/25 bg-white/75 px-8 py-16 backdrop-blur-xl text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[#E0F2FE] text-[#0369A1]">
        <Icon size={26} />
      </span>
      <h3 className="mt-5 text-[17px] font-bold text-[#0F2A3D]">{title}</h3>
      <p className="mt-2 max-w-sm text-[13px] leading-5 text-[#5B7184]">{description}</p>
      {action && (
        <div className="mt-6">
          <Button onClick={action.onClick}>{action.label}</Button>
        </div>
      )}
    </div>
  );
}
