import { useEffect, useRef, useState } from 'react';

import { Label } from '@/components/ui/Label';
import { validateImageFile } from '@/lib/file-validation';
import { isDegenerateImage } from '@/lib/image';
import { cn } from '@/lib/utils';

import type { DragEvent } from 'react';
import type { ImageFieldValue } from '@/types/image-field';

export { EMPTY_IMAGE_VALUE } from '@/types/image-field';
export type { ImageFieldValue } from '@/types/image-field';

interface ImageUploadFieldProps {
  id: string;
  label: string;
  hint?: string;
  /** The already-saved image, resolved to an absolute URL by the caller. */
  existingImageUrl?: string | null;
  value: ImageFieldValue;
  onChange: (value: ImageFieldValue) => void;
  accept?: string;
  maxSizeBytes?: number;
  disabled?: boolean;
  readOnly?: boolean;
  /** Form-level error (e.g. "photo is required") — distinct from validation errors. */
  error?: string;
  shape?: 'circle' | 'tile';
  aspectRatio?: 'square' | 'video';
  className?: string;
}

const DEFAULT_ACCEPT = 'image/jpeg,image/png,image/webp';
const DEFAULT_MAX_SIZE_BYTES = 5 * 1024 * 1024;

type DisplayMode = 'placeholder' | 'preview' | 'confirm-remove';

/**
 * Single-image upload control: shows a placeholder when empty, or the
 * current image (new selection or already-saved) with a hover/focus "change"
 * overlay and a remove action when filled. One component handles create and
 * edit — it just reacts to whether `existingImageUrl`/`value.file` are set.
 * Generic and domain-agnostic; compose multiple instances for multi-image
 * use cases (see VehicleForm) rather than teaching this component "multiple".
 */
export function ImageUploadField({
  id,
  label,
  hint,
  existingImageUrl,
  value,
  onChange,
  accept = DEFAULT_ACCEPT,
  maxSizeBytes = DEFAULT_MAX_SIZE_BYTES,
  disabled = false,
  readOnly = false,
  error,
  shape = 'tile',
  aspectRatio = 'square',
  className,
}: ImageUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const triggerRef = useRef<HTMLButtonElement>(null);
  const [localError, setLocalError] = useState<string | null>(null);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isBroken, setIsBroken] = useState(false);
  const [mode, setMode] = useState<Exclude<DisplayMode, 'placeholder' | 'preview'> | null>(null);

  // Deliberately a single effect that both creates and revokes the URL,
  // rather than creating it in useMemo (at render time) with cleanup in a
  // separate effect. StrictMode double-invokes effects on a component's
  // first mount to catch exactly this class of bug: with the URL created
  // in useMemo, the simulated mount -> cleanup -> remount cycle revoked
  // the *only* blob URL that would ever exist for this file, racing the
  // browser's async image load and making a perfectly good freshly-picked
  // file's preview intermittently fail. Pairing creation with cleanup in
  // one effect means the double-invoke instead produces two URLs — the
  // first is safely revoked, and a fresh, valid second one is what's
  // actually rendered.
  const [objectUrl, setObjectUrl] = useState<string | null>(null);
  useEffect(() => {
    if (!value.file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(value.file);
    setObjectUrl(url);
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [value.file]);

  const displaySrc = value.file ? objectUrl : !value.removed ? (existingImageUrl ?? null) : null;
  const hasImage = Boolean(displaySrc) && !isBroken;
  // An image was expected here but failed to load/decode — distinct from a
  // slot that was never filled, so it doesn't read as an identical, extra
  // "add a photo" tile alongside the real one.
  const isBrokenImage = Boolean(displaySrc) && isBroken;
  const wasFilledRef = useRef(hasImage);

  useEffect(() => {
    // Moved from filled -> empty (e.g. after a confirmed removal) — return
    // focus to the now-visible placeholder trigger for keyboard users.
    if (wasFilledRef.current && !hasImage) {
      triggerRef.current?.focus();
    }
    wasFilledRef.current = hasImage;
  }, [hasImage]);

  useEffect(() => {
    setIsBroken(false);
  }, [displaySrc]);

  const openPicker = (): void => {
    if (disabled || readOnly) {
      return;
    }
    inputRef.current?.click();
  };

  const selectFile = (file: File): void => {
    const validationError = validateImageFile(file, { accept, maxSizeBytes });
    if (validationError) {
      setLocalError(validationError);
      return;
    }
    setLocalError(null);
    setMode(null);
    // Reset immediately rather than waiting on the displaySrc-keyed effect:
    // a freshly picked file deserves a clean slate, not a stale "broken"
    // flag left over from whatever image (if any) was showing before it.
    setIsBroken(false);
    onChange({ file, removed: false });
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>): void => {
    event.preventDefault();
    setIsDraggingOver(false);
    if (disabled || readOnly) {
      return;
    }
    const dropped = event.dataTransfer.files?.[0];
    if (dropped) {
      selectFile(dropped);
    }
  };

  const confirmRemove = (): void => {
    setLocalError(null);
    setMode(null);
    onChange({ file: null, removed: true });
  };

  // Sizing/aspect lives on the outer (unclipped) box; the inner box applies
  // the rounded/circular mask. Keeping them separate lets the remove badge
  // sit outside the inner box so the mask doesn't clip it — only a sliver
  // would otherwise show through a circular avatar's corner.
  const outerSizeClass =
    shape === 'circle'
      ? 'size-24'
      : cn('w-full', aspectRatio === 'video' ? 'aspect-video' : 'aspect-square');
  const innerShapeClass = shape === 'circle' ? 'rounded-full' : 'rounded-xl';

  const displayError = error ?? localError;

  return (
    <div className={cn('flex flex-col gap-2', shape === 'circle' && 'items-start', className)}>
      {label ? (
        <div>
          <Label htmlFor={id}>{label}</Label>
          {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
        </div>
      ) : null}

      <div className={cn('relative', outerSizeClass)}>
        <div
          className={cn(
            'absolute inset-0 overflow-hidden border border-slate-200 bg-slate-50 transition-colors',
            innerShapeClass,
            isDraggingOver && 'border-primary-400 bg-primary-50',
            disabled && 'opacity-50',
          )}
          onDragOver={(event) => {
            if (disabled || readOnly) return;
            event.preventDefault();
            setIsDraggingOver(true);
          }}
          onDragLeave={() => setIsDraggingOver(false)}
          onDrop={handleDrop}
        >
          <input
            ref={inputRef}
            id={id}
            type="file"
            accept={accept}
            disabled={disabled || readOnly}
            aria-invalid={Boolean(displayError)}
            aria-describedby={displayError ? `${id}-error` : undefined}
            aria-label={label ? undefined : 'Image'}
            className="sr-only"
            onChange={(event) => {
              const picked = event.target.files?.[0];
              if (picked) {
                selectFile(picked);
              }
              if (inputRef.current) {
                inputRef.current.value = '';
              }
            }}
          />

          {!hasImage ? (
            <button
              ref={triggerRef}
              type="button"
              onClick={openPicker}
              disabled={disabled || readOnly}
              aria-label={
                shape === 'circle'
                  ? label || (isBrokenImage ? 'Replace image' : 'Add image')
                  : undefined
              }
              className={cn(
                'flex size-full flex-col items-center justify-center gap-1.5 border-2 transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 disabled:pointer-events-none',
                isBrokenImage
                  ? 'border-dashed border-amber-300 bg-amber-50 text-amber-600 hover:border-amber-400'
                  : 'border-dashed border-slate-300 text-slate-400 hover:border-primary-400 hover:text-primary-500',
              )}
            >
              {isBrokenImage ? (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  aria-hidden="true"
                  className="size-6"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126ZM12 15.75h.007v.008H12v-.008Z"
                  />
                </svg>
              ) : (
                <svg
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  aria-hidden="true"
                  className="size-6"
                >
                  <path strokeLinecap="round" d="M12 4v16m8-8H4" />
                </svg>
              )}
              {shape === 'circle' ? null : (
                <span className="px-2 text-center text-xs font-medium">
                  {isBrokenImage
                    ? 'Photo unavailable — click to replace'
                    : readOnly
                      ? 'No image'
                      : 'Click or drag an image here'}
                </span>
              )}
            </button>
          ) : (
            <>
              <img
                src={displaySrc as string}
                alt=""
                className="size-full object-cover"
                onError={() => setIsBroken(true)}
                onLoad={(event) => {
                  // Only second-guess dimensions for a server-provided
                  // existing image — that's the path where a corrupt
                  // stub/placeholder file can slip through as "real". A file
                  // the user just picked from their own device doesn't need
                  // this heuristic: if the browser decoded it at all, trust it.
                  if (!value.file && isDegenerateImage(event.currentTarget)) {
                    setIsBroken(true);
                  }
                }}
              />

              {!readOnly && !disabled ? (
                mode === 'confirm-remove' ? (
                  <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-slate-900/80 p-2 text-center">
                    <p className="text-xs font-medium text-white">Remove this image?</p>
                    {/*
                     * Icon-only, not text buttons — a 96px circular avatar
                     * has no room for two side-by-side "Remove"/"Cancel"
                     * labels without the corner mask clipping them.
                     */}
                    <div className="flex gap-2.5">
                      <button
                        type="button"
                        onClick={confirmRemove}
                        aria-label="Remove"
                        className="flex size-7 items-center justify-center rounded-full bg-red-600 text-white hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                          className="size-3.5"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M4.5 12.75l6 6 9-13.5"
                          />
                        </svg>
                      </button>
                      <button
                        type="button"
                        onClick={() => setMode(null)}
                        aria-label="Cancel"
                        className="flex size-7 items-center justify-center rounded-full bg-white/90 text-slate-700 hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                      >
                        <svg
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                          aria-hidden="true"
                          className="size-3.5"
                        >
                          <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={openPicker}
                    className="group absolute inset-0 flex items-center justify-center focus-visible:outline-none"
                    aria-label={`Change ${label || 'image'}`}
                  >
                    <span className="flex flex-col items-center gap-1 rounded-lg bg-slate-900/70 px-3 py-2 text-white opacity-0 transition-opacity group-hover:opacity-100 group-focus-visible:opacity-100">
                      <svg
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        aria-hidden="true"
                        className="size-5"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L10.582 16.07a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Z"
                        />
                      </svg>
                      <span className="text-xs font-medium">Change image</span>
                    </span>
                  </button>
                )
              ) : null}
            </>
          )}
        </div>

        {/*
         * Sibling of the clipped box above, not a child of it — a circular
         * avatar's overflow-hidden mask would otherwise slice this badge
         * down to a barely-visible sliver instead of letting it overlap the
         * corner like a notification-count badge.
         */}
        {hasImage && !readOnly && !disabled && mode !== 'confirm-remove' ? (
          <button
            type="button"
            onClick={() => setMode('confirm-remove')}
            aria-label={`Remove ${label || 'image'}`}
            className="absolute -right-1.5 -top-1.5 flex size-6 items-center justify-center rounded-full bg-red-600 text-white shadow-md ring-2 ring-white transition-colors hover:bg-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600 focus-visible:ring-offset-1"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.5"
              aria-hidden="true"
              className="size-3.5"
            >
              <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
            </svg>
          </button>
        ) : null}
      </div>

      {displayError ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
          {displayError}
        </p>
      ) : null}
    </div>
  );
}
