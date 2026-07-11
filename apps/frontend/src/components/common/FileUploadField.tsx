import { useEffect, useMemo, useRef } from 'react';

import { Button } from '@/components/ui/Button';
import { Label } from '@/components/ui/Label';

interface FileUploadFieldProps {
  id: string;
  label: string;
  accept?: string;
  multiple?: boolean;
  files: File[];
  onFilesChange: (files: File[]) => void;
  error?: string | undefined;
  /** Guidance shown under the label, e.g. recommended dimensions/aspect ratio. */
  hint?: string;
}

function fileKey(file: File): string {
  return `${file.name}-${file.size}-${file.lastModified}`;
}

/**
 * File picker foundation for the backend's multipart upload APIs (profile
 * images, licenses, vehicle photos). Presentational: selection state and the
 * actual upload live in the consuming feature. Every caller currently passes
 * image mime types, so previews always render as thumbnails.
 */
export function FileUploadField({
  id,
  label,
  accept,
  multiple = false,
  files,
  onFilesChange,
  error,
  hint,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  // Recreated whenever the file list changes; revoked on the next change/unmount.
  const previewUrls = useMemo(() => files.map((file) => URL.createObjectURL(file)), [files]);

  useEffect(() => {
    return () => {
      previewUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [previewUrls]);

  const openPicker = (): void => {
    inputRef.current?.click();
  };

  const removeAt = (index: number): void => {
    onFilesChange(files.filter((_, i) => i !== index));
  };

  return (
    <div className="flex flex-col gap-2">
      <div>
        <Label htmlFor={id}>{label}</Label>
        {hint ? <p className="mt-0.5 text-xs text-slate-400">{hint}</p> : null}
      </div>

      <div className="flex items-center gap-3 overflow-x-auto rounded-xl border border-slate-200 bg-white p-3">
        <button
          type="button"
          onClick={openPicker}
          className="flex size-20 shrink-0 flex-col items-center justify-center gap-1 rounded-lg border-2 border-dashed border-slate-300 text-slate-400 transition-colors hover:border-primary-400 hover:text-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
        >
          <svg
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="1.75"
            aria-hidden="true"
            className="size-5"
          >
            <path strokeLinecap="round" d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-[11px] font-medium">{multiple ? 'Add Images' : 'Add Image'}</span>
        </button>

        {files.map((file, index) => (
          <div key={fileKey(file)} className="relative size-20 shrink-0">
            <img
              src={previewUrls[index]}
              alt={file.name}
              className="size-full rounded-lg border border-slate-200 object-cover shadow-sm"
            />
            <button
              type="button"
              onClick={() => removeAt(index)}
              aria-label={`Remove ${file.name}`}
              className="absolute -right-1.5 -top-1.5 flex size-5 items-center justify-center rounded-full bg-white text-slate-500 shadow ring-1 ring-slate-200 transition-colors hover:text-red-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
            >
              <svg
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.5"
                aria-hidden="true"
                className="size-3"
              >
                <path strokeLinecap="round" d="M6 18 18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ))}

        <Button
          type="button"
          variant="secondary"
          size="sm"
          onClick={openPicker}
          className="ml-auto shrink-0"
        >
          Browse
        </Button>
      </div>

      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="sr-only"
        onChange={(event) => {
          const picked = Array.from(event.target.files ?? []);
          // Each picker interaction returns its own FileList — in multi-file
          // mode, add to what's already selected instead of replacing it, so
          // choosing photos one at a time (a very natural flow) accumulates
          // them rather than silently discarding everything picked before.
          onFilesChange(multiple ? [...files, ...picked] : picked);
          // Reset so picking the same file again (e.g. after removing it)
          // still fires onChange.
          if (inputRef.current) {
            inputRef.current.value = '';
          }
        }}
      />

      {multiple && files.length > 0 ? (
        <p className="text-xs text-slate-500">
          {files.length} {files.length === 1 ? 'photo' : 'photos'} selected — choose again to add
          more.
        </p>
      ) : null}
      {files.length > 1 ? (
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="self-start"
          onClick={() => {
            onFilesChange([]);
            if (inputRef.current) {
              inputRef.current.value = '';
            }
          }}
        >
          Clear all
        </Button>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-sm text-red-700">
          {error}
        </p>
      ) : null}
    </div>
  );
}
