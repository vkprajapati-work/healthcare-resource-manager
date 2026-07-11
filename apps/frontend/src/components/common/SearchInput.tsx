import { Label } from '@/components/ui/Label';
import { cn } from '@/lib/utils';

interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
  /** Visually hide the label (still announced to screen readers). */
  labelHidden?: boolean;
}

/** Rounded search box with a magnifier icon; debounce in the consumer. */
export function SearchInput({
  id,
  label,
  value,
  onValueChange,
  placeholder,
  labelHidden = false,
}: SearchInputProps) {
  return (
    <div role="search" className="flex flex-col gap-1">
      <Label htmlFor={id} className={cn(labelHidden && 'sr-only')}>
        {label}
      </Label>
      <div className="relative">
        <input
          id={id}
          type="search"
          value={value}
          placeholder={placeholder}
          onChange={(event) => onValueChange(event.target.value)}
          className="w-full rounded-full border border-slate-200 bg-white py-2 pl-4 pr-10 text-sm shadow-sm placeholder:text-slate-400 focus-visible:border-primary-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600/20"
        />
        <svg
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          aria-hidden="true"
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-slate-400"
        >
          <circle cx="11" cy="11" r="7" />
          <path d="m20 20-3.5-3.5" strokeLinecap="round" />
        </svg>
      </div>
    </div>
  );
}
