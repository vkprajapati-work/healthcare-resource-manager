import { Label } from '@/components/ui/Label';

import type { ReactNode } from 'react';

interface FormFieldProps {
  id: string;
  label: string;
  error?: string | undefined;
  description?: string;
  children: ReactNode;
}

/**
 * Accessible field wrapper: associates the label, wires the error/description
 * to the input via `aria-describedby` ids (`<id>-error`, `<id>-description`),
 * and announces errors. The child input must use the same `id` and reference
 * those ids in its own `aria-describedby` when present.
 */
export function FormField({ id, label, error, description, children }: FormFieldProps) {
  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      {children}
      {description ? (
        <p id={`${id}-description`} className="text-sm text-slate-500">
          {description}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
