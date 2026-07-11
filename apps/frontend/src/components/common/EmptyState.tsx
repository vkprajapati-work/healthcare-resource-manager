import type { ReactNode } from 'react';

interface EmptyStateProps {
  message: string;
  action?: ReactNode;
}

export function EmptyState({ message, action }: EmptyStateProps) {
  return (
    <div className="flex flex-col items-center gap-4 rounded-2xl border border-dashed border-slate-200 bg-white/60 py-16 text-center">
      <span
        aria-hidden="true"
        className="flex size-14 items-center justify-center rounded-full bg-primary-50 text-primary-400"
      >
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="1.5"
          className="size-7"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M3.75 9.776c0-1.1.71-2.045 1.708-2.577a23.94 23.94 0 0 1 13.084 0c.998.532 1.708 1.477 1.708 2.577v10.474c0 1.365-1.505 2.192-2.664 1.465l-2.996-1.883a1.75 1.75 0 0 0-1.849 0l-1.483.932a1.75 1.75 0 0 1-1.849 0l-1.483-.932a1.75 1.75 0 0 0-1.849 0l-2.996 1.883c-1.159.727-2.664-.1-2.664-1.465V9.776Z"
          />
          <path strokeLinecap="round" strokeLinejoin="round" d="M9 12h6M9 15.5h3" />
        </svg>
      </span>
      <p className="max-w-xs text-sm text-slate-500">{message}</p>
      {action}
    </div>
  );
}
