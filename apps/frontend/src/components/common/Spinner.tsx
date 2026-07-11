import { cn } from '@/lib/utils';

interface SpinnerProps {
  label?: string;
  className?: string;
}

export function Spinner({ label = 'Loading', className }: SpinnerProps) {
  return (
    <div role="status" aria-live="polite" className={cn('flex items-center gap-3 py-8', className)}>
      <span
        aria-hidden="true"
        className="size-5 animate-spin rounded-full border-2 border-slate-300 border-t-slate-900"
      />
      <span className="text-sm text-slate-600">{label}…</span>
    </div>
  );
}
