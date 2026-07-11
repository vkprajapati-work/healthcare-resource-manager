import { useEffect, useRef } from 'react';

import type { RefObject } from 'react';

/**
 * Calls `onLoadMore` when the returned sentinel element scrolls near the
 * viewport (400px lookahead). Pair it with a visible "Load more" button —
 * the observer just presses it early; keyboard/AT users keep the button.
 */
export function useInfiniteScroll(
  onLoadMore: () => void,
  disabled = false,
): RefObject<HTMLDivElement> {
  const sentinelRef = useRef<HTMLDivElement>(null);
  const callbackRef = useRef(onLoadMore);

  useEffect(() => {
    callbackRef.current = onLoadMore;
  });

  useEffect(() => {
    const node = sentinelRef.current;
    if (!node || disabled || typeof IntersectionObserver === 'undefined') {
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          callbackRef.current();
        }
      },
      { rootMargin: '400px 0px' },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [disabled]);

  return sentinelRef;
}
