import { useEffect, useId, useRef } from 'react';

import { cn } from '@/lib/utils';

import type { ReactNode } from 'react';

interface DialogProps {
  open: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  className?: string;
}

/**
 * Modal dialog on the native <dialog> element — focus trapping, Escape
 * handling, and inerting the page come from the platform (modern browsers
 * only, per the project requirements).
 */
export function Dialog({ open, onClose, title, children, className }: DialogProps) {
  const ref = useRef<HTMLDialogElement>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = ref.current;
    if (!dialog || typeof dialog.showModal !== 'function') {
      return;
    }
    if (open && !dialog.open) {
      dialog.showModal();
    } else if (!open && dialog.open) {
      dialog.close();
    }
  }, [open]);

  return (
    <dialog
      ref={ref}
      aria-labelledby={titleId}
      onClose={onClose}
      onClick={(event) => {
        // A click on the backdrop targets the <dialog> element itself.
        if (event.target === ref.current) {
          onClose();
        }
      }}
      className={cn(
        'w-full max-w-md rounded-lg border border-slate-200 p-0 shadow-lg backdrop:bg-slate-900/40',
        className,
      )}
    >
      <div className="p-6">
        <h2 id={titleId} className="mb-4 text-lg font-semibold">
          {title}
        </h2>
        {/*
         * Only mounted while open: keeps closed-but-rendered dialogs (e.g. a
         * permanently-mounted "Add" dialog beside a conditionally-mounted
         * "Edit" dialog) from holding duplicate field ids in the DOM at the
         * same time, and gives every open a fresh, non-stale form instance.
         */}
        {open ? children : null}
      </div>
    </dialog>
  );
}
