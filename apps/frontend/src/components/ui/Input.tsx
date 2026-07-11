import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-lg border border-slate-200 bg-white px-3 py-2 text-sm shadow-sm placeholder:text-slate-400',
      'transition-colors focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/20',
      'disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-400',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
