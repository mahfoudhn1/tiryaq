import { cn } from '@/lib/utils/cn';

interface AvatarProps {
  initials: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
  alt?: string;
}

const sizes = { sm: 'h-8 w-8 text-[11px]', md: 'h-10 w-10 text-[13px]', lg: 'h-12 w-12 text-[15px]' };

export function Avatar({ initials, src, size = 'md', className, alt }: AvatarProps) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={src}
        alt={alt ?? initials}
        className={cn('rounded-full object-cover ring-2 ring-[#e0f2fe]', sizes[size], className)}
      />
    );
  }
  return (
    <span
      aria-label={alt ?? initials}
      className={cn('inline-flex items-center justify-center rounded-full bg-[#dbeafe] font-bold text-[#1e3a8a] ring-2 ring-[#e0f2fe]', sizes[size], className)}
    >
      {initials}
    </span>
  );
}
