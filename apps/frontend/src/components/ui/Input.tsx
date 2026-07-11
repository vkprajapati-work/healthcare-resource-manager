import { forwardRef } from 'react';

import { cn } from '@/lib/utils';

import type { InputHTMLAttributes } from 'react';

type InputProps = InputHTMLAttributes<HTMLInputElement>;

export const Input = forwardRef<HTMLInputElement, InputProps>(({ className, ...props }, ref) => (
  <input
    ref={ref}
    className={cn(
      'w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm placeholder:text-slate-400',
      'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-900',
      'disabled:cursor-not-allowed disabled:opacity-50 aria-[invalid=true]:border-red-500',
      className,
    )}
    {...props}
  />
));
Input.displayName = 'Input';
