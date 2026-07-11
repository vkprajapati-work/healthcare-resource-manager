import type { ReactNode } from 'react';

interface DetailListProps {
  items: { label: string; value: ReactNode }[];
}

/** Two-column definition list for read-only detail views. */
export function DetailList({ items }: DetailListProps) {
  return (
    <dl className="grid grid-cols-1 gap-x-6 gap-y-3 text-sm sm:grid-cols-2">
      {items.map((item) => (
        <div key={item.label} className="flex flex-col gap-0.5">
          <dt className="text-xs font-medium uppercase tracking-wide text-slate-400">
            {item.label}
          </dt>
          <dd className="text-slate-800">{item.value ?? '—'}</dd>
        </div>
      ))}
    </dl>
  );
}
