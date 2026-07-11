import { useState } from 'react';

import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';

import type { Resource } from '../types';

const TYPE_BADGES: Record<Resource['type'], { label: string; variant: 'danger' | 'info' }> = {
  ambulance: { label: 'Ambulance', variant: 'danger' },
  doctor: { label: 'Doctor', variant: 'info' },
};

interface ResourceCardProps {
  resource: Resource;
}

export function ResourceCard({ resource }: ResourceCardProps) {
  const [imageFailed, setImageFailed] = useState(false);
  const badge = TYPE_BADGES[resource.type];
  const showImage = Boolean(resource.imageUrl) && !imageFailed;

  return (
    <article className="group flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-primary-100">
      <div className="aspect-video w-full overflow-hidden bg-slate-100">
        {showImage ? (
          <img
            src={toAbsoluteFileUrl(resource.imageUrl as string)}
            alt={resource.title}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="size-full object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex size-full items-center justify-center bg-gradient-to-br from-primary-50 via-white to-indigo-50 text-4xl font-semibold text-primary-300"
          >
            {resource.title.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col gap-2 p-4">
        <Badge variant={badge.variant} className="self-start">
          {badge.label}
        </Badge>
        <h2 className="font-semibold leading-snug text-slate-900 transition-colors group-hover:text-primary-700">
          {resource.title}
        </h2>
        <p className="line-clamp-2 text-sm text-slate-600">{resource.description}</p>
        <p className="mt-auto flex items-center gap-1.5 border-t border-slate-50 pt-3 text-sm text-slate-500">
          <svg
            viewBox="0 0 24 24"
            fill="currentColor"
            aria-hidden="true"
            className="size-4 shrink-0 text-primary-500"
          >
            <path
              fillRule="evenodd"
              d="M11.54 22.35a.75.75 0 0 0 .92 0c.06-.04 6.79-5.24 6.79-11.6A7.25 7.25 0 0 0 12 3.5a7.25 7.25 0 0 0-7.25 7.25c0 6.36 6.73 11.56 6.79 11.6ZM12 13.5a2.75 2.75 0 1 0 0-5.5 2.75 2.75 0 0 0 0 5.5Z"
              clipRule="evenodd"
            />
          </svg>
          <span className="truncate">{resource.location}</span>
        </p>
      </div>
    </article>
  );
}
