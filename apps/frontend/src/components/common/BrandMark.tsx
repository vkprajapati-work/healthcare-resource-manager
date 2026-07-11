import { cn } from '@/lib/utils';

interface BrandMarkProps {
  className?: string;
}

/** The app's logo mark — a medical cross on the primary accent. */
export function BrandMark({ className }: BrandMarkProps) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        'flex size-8 items-center justify-center rounded-lg bg-primary-600 text-white shadow-sm',
        className,
      )}
    >
      <svg viewBox="0 0 24 24" fill="currentColor" className="size-4">
        <path d="M9 3a1 1 0 0 0-1 1v4H4a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h4v4a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-4h4a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1h-4V4a1 1 0 0 0-1-1H9Z" />
      </svg>
    </span>
  );
}
