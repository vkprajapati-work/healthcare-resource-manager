import { useState } from 'react';

import { isDegenerateImage } from '@/lib/image';
import { cn } from '@/lib/utils';

import type { KeyboardEvent } from 'react';

export interface CarouselImage {
  id: string;
  url: string;
  alt: string;
}

interface ImageCarouselProps {
  images: CarouselImage[];
  className?: string;
  /** Set false when embedding flush inside another rounded container (e.g. a card). */
  rounded?: boolean;
}

/** Single image, or a slider with prev/next + dots when there's more than one. */
export function ImageCarousel({ images, className, rounded = true }: ImageCarouselProps) {
  const [index, setIndex] = useState(0);
  const [brokenIds, setBrokenIds] = useState<ReadonlySet<string>>(new Set());

  if (images.length === 0) {
    return null;
  }

  const hasMultiple = images.length > 1;
  const current = images[Math.min(index, images.length - 1)];
  const currentIsBroken = current ? brokenIds.has(current.id) : false;

  const markBroken = (id: string): void => {
    setBrokenIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const goTo = (next: number): void => {
    setIndex(((next % images.length) + images.length) % images.length);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>): void => {
    if (event.key === 'ArrowLeft') {
      goTo(index - 1);
    } else if (event.key === 'ArrowRight') {
      goTo(index + 1);
    }
  };

  return (
    <div
      className={cn('relative', className)}
      role={hasMultiple ? 'region' : undefined}
      aria-roledescription={hasMultiple ? 'carousel' : undefined}
      aria-label={hasMultiple ? 'Photos' : undefined}
      onKeyDown={hasMultiple ? handleKeyDown : undefined}
    >
      <div
        className={cn('aspect-video w-full overflow-hidden bg-slate-100', rounded && 'rounded-xl')}
      >
        {current && !currentIsBroken ? (
          <img
            key={current.id}
            src={current.url}
            alt={current.alt}
            loading="lazy"
            onError={() => markBroken(current.id)}
            onLoad={(event) => {
              if (isDegenerateImage(event.currentTarget)) {
                markBroken(current.id);
              }
            }}
            className="size-full object-contain"
          />
        ) : current ? (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-slate-100 text-slate-300"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.5"
              className="size-10"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M2.25 15.75l5.159-5.159a2.25 2.25 0 0 1 3.182 0l5.159 5.159m-1.5-1.5 1.409-1.409a2.25 2.25 0 0 1 3.182 0l2.909 2.909M3 6h18a1.5 1.5 0 0 1 1.5 1.5v9A1.5 1.5 0 0 1 21 18H3a1.5 1.5 0 0 1-1.5-1.5v-9A1.5 1.5 0 0 1 3 6Z"
              />
              <circle cx="8.25" cy="9.75" r="1.25" fill="currentColor" stroke="none" />
            </svg>
          </div>
        ) : null}
      </div>

      {hasMultiple ? (
        <>
          <button
            type="button"
            onClick={() => goTo(index - 1)}
            aria-label="Previous photo"
            className="absolute left-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            type="button"
            onClick={() => goTo(index + 1)}
            aria-label="Next photo"
            className="absolute right-2 top-1/2 flex size-8 -translate-y-1/2 items-center justify-center rounded-full bg-white/90 text-slate-700 shadow ring-1 ring-slate-200 transition-colors hover:bg-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-600"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              className="size-4"
              aria-hidden="true"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <span className="absolute right-2 top-2 rounded-full bg-black/55 px-2 py-0.5 text-xs font-medium text-white">
            {index + 1} / {images.length}
          </span>

          <div className="absolute bottom-2 left-1/2 flex -translate-x-1/2 gap-1.5">
            {images.map((image, i) => (
              <button
                key={image.id}
                type="button"
                aria-label={`Go to photo ${i + 1}`}
                aria-current={i === index}
                onClick={() => goTo(i)}
                className={cn(
                  'h-1.5 rounded-full bg-white/60 transition-all',
                  i === index ? 'w-5 bg-white' : 'w-1.5 hover:bg-white/80',
                )}
              />
            ))}
          </div>
        </>
      ) : null}
    </div>
  );
}
