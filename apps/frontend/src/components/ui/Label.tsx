import { cn } from '@/lib/utils';

import type { LabelHTMLAttributes } from 'react';

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, ...props }: LabelProps) {
  return <label className={cn('text-sm font-medium text-slate-900', className)} {...props} />;
}
