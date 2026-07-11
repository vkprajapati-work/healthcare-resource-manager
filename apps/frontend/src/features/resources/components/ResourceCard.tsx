import { useState } from 'react';

import { toAbsoluteFileUrl } from '@/lib/file-url';
import { cn } from '@/lib/utils';

import type { Resource } from '../types';

const TYPE_BADGES: Record<Resource['type'], { label: string; className: string }> = {
  ambulance: { label: 'Ambulance', className: 'bg-red-50 text-red-700' },
  doctor: { label: 'Doctor', className: 'bg-sky-50 text-sky-700' },
};

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const badge = TYPE_BADGES[resource.type];
  const showImage = Boolean(resource.imageUrl) && !imageFailed;

  return (
    <article className="flex flex-col overflow-hidden rounded-lg border border-slate-200 bg-white shadow-sm">
      <div className="aspect-video w-full bg-slate-100">
        {showImage ? (
          <img
            src={toAbsoluteFileUrl(resource.imageUrl as string)}
            alt={resource.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-cover"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center text-3xl font-semibold text-slate-300"
          >
            {resource.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <span
          className={cn('self-start rounded-full px-2 py-0.5 text-xs font-medium', badge.className)}
        >
          {badge.label}
        </span>
        <h2 className="font-semibold leading-snug">{resource.title}</h2>
        <p className="line-clamp-2 text-sm text-slate-600">{resource.description}</p>
        <p className="mt-auto pt-2 text-sm text-slate-500">📍 {resource.location}</p>
      </div>
    </article>
  );
}
