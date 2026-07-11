import { Input } from '@/components/ui/Input';
import { Label } from '@/components/ui/Label';

interface SearchInputProps {
  id: string;
  label: string;
  value: string;
  onValueChange: (value: string) => void;
  placeholder?: string;
}

/** Labelled search box; debounce in the consumer via useDebouncedValue. */
export function SearchInput({ id, label, value, onValueChange, placeholder }: SearchInputProps) {
  return (
    <div role="search" className="flex flex-col gap-1">
      <Label htmlFor={id}>{label}</Label>
      <Input
        id={id}
        type="search"
        value={value}
        placeholder={placeholder}
        onChange={(event) => onValueChange(event.target.value)}
      />
    </div>
  );
}
