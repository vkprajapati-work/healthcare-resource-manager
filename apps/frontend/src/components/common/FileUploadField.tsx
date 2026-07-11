import { useRef } from 'react';

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
}

/**
 * File picker foundation for the backend's multipart upload APIs (profile
 * images, licenses, vehicle documents). Presentational: selection state and
 * the actual upload live in the consuming feature.
 */
export function FileUploadField({
  id,
  label,
  accept,
  multiple = false,
  files,
  onFilesChange,
  error,
}: FileUploadFieldProps) {
  const inputRef = useRef<HTMLInputElement>(null);

  return (
    <div className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <input
        ref={inputRef}
        id={id}
        type="file"
        accept={accept}
        multiple={multiple}
        aria-invalid={Boolean(error)}
        aria-describedby={error ? `${id}-error` : undefined}
        className="text-sm file:mr-3 file:rounded-lg file:border-0 file:bg-primary-600 file:px-3 file:py-2 file:text-sm file:font-medium file:text-white hover:file:bg-primary-500"
        onChange={(event) => onFilesChange(Array.from(event.target.files ?? []))}
      />
      {files.length > 0 ? (
        <ul className="mt-1 flex flex-col gap-1 text-sm text-slate-600">
          {files.map((file) => (
            <li key={file.name} className="truncate">
              {file.name} ({Math.ceil(file.size / 1024)} KB)
            </li>
          ))}
        </ul>
      ) : null}
      {files.length > 0 ? (
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
          Clear selection
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
