'use client';

import { cn } from '@/lib/utils/cn';
import { ButtonHTMLAttributes, forwardRef } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  loading?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ variant = 'primary', size = 'md', loading, disabled, className, children, ...props }, ref) => {
    const base = 'inline-flex items-center justify-center font-bold rounded-full transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-[#0e7490] disabled:opacity-50 disabled:cursor-not-allowed';

    const variants = {
      primary: 'bg-[#0e7490] text-white hover:bg-[#155e75] active:bg-[#164e63] shadow-[0_4px_14px_rgba(14,116,144,0.18)]',
      secondary: 'bg-white text-[#0f172a] border border-[#dce7eb] hover:border-[#8ecfd3] hover:bg-[#f0fdfd]',
      ghost: 'bg-transparent text-[#64748b] hover:text-[#0e7490] hover:bg-[#f0fdfd]',
      danger: 'bg-red-600 text-white hover:bg-red-700 active:bg-red-800',
    };

    const sizes = {
      sm: 'px-3 py-1.5 text-[12px] gap-1.5',
      md: 'px-4 py-2.5 text-[13px] gap-2',
      lg: 'px-6 py-3 text-[14px] gap-2',
    };

    return (
      <button
        ref={ref}
        disabled={disabled || loading}
        className={cn(base, variants[variant], sizes[size], className)}
        {...props}
      >
        {loading ? (
          <span className="h-4 w-4 rounded-full border-2 border-current border-t-transparent animate-spin" aria-hidden />
        ) : null}
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
