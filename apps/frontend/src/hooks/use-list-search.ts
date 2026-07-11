import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';

import { useDebouncedValue } from './use-debounced-value';

/**
 * Debounced search state for paginated lists, persisted in the URL
 * (?search=…). `search` is the settled value queries should use; changing it
 * resets the page param.
 */
export function useListSearch(): {
  searchInput: string;
  setSearchInput: (value: string) => void;
  search: string;
} {
  const [searchParams, setSearchParams] = useSearchParams();
  const search = searchParams.get('search') ?? '';
  const [searchInput, setSearchInput] = useState(search);
  const debounced = useDebouncedValue(searchInput, 400);

  useEffect(() => {
    const trimmed = debounced.trim();
    if (trimmed === search) {
      return;
    }
    setSearchParams(
      (previous) => {
        const next = new URLSearchParams(previous);
        if (trimmed) {
          next.set('search', trimmed);
        } else {
          next.delete('search');
        }
        next.delete('page');
        return next;
      },
      { replace: true }, // Keystroke-driven — don't spam browser history.
    );
  }, [debounced, search, setSearchParams]);

  return { searchInput, setSearchInput, search };
}
