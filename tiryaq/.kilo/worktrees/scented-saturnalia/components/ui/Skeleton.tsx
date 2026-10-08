import { cn } from '@/lib/utils/cn';

interface SkeletonProps { className?: string }

export function Skeleton({ className }: SkeletonProps) {
  return <div className={cn('animate-pulse rounded-xl bg-[#e8eef2]', className)} />;
}

export function SkeletonCard() {
  return (
    <div className="rounded-2xl border border-[#dce7eb] bg-white p-5 shadow-[0_4px_16px_rgba(15,23,42,0.04)]">
      <Skeleton className="mb-4 h-4 w-1/3" />
      <Skeleton className="h-8 w-1/2" />
      <Skeleton className="mt-3 h-2 w-full" />
    </div>
  );
}

export function SkeletonText({ lines = 3 }: { lines?: number }) {
  return (
    <div className="space-y-2">
      {Array.from({ length: lines }).map((_, i) => (
        <Skeleton key={i} className={cn('h-4', i === lines - 1 ? 'w-3/4' : 'w-full')} />
      ))}
    </div>
  );
}
