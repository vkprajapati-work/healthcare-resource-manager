import { useState } from 'react';

import { CardActions } from '@/components/common/CardActions';
import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { isDegenerateImage } from '@/lib/image';
import { formatEnumLabel } from '@/lib/utils';

import { DOCTOR_STATUS_VARIANTS } from '../types';

import type { Doctor } from '../types';

interface DoctorCardProps {
  doctor: Doctor;
  onView: () => void;
  onEdit: () => void;
}

export function DoctorCard({ doctor, onView, onEdit }: DoctorCardProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <article className="relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-primary-100">
      <Badge
        variant={DOCTOR_STATUS_VARIANTS[doctor.availabilityStatus]}
        className="absolute left-3 top-3"
      >
        {formatEnumLabel(doctor.availabilityStatus)}
      </Badge>

      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-9 text-center">
        {doctor.profileImage && !imageFailed ? (
          <img
            src={toAbsoluteFileUrl(doctor.profileImage.fileUrl)}
            alt=""
            loading="lazy"
            onError={() => setImageFailed(true)}
            onLoad={(event) => {
              if (isDegenerateImage(event.currentTarget)) {
                setImageFailed(true);
              }
            }}
            className="size-24 rounded-full object-cover shadow-sm ring-4 ring-primary-50"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-24 items-center justify-center rounded-full bg-gradient-to-br from-primary-100 to-primary-50 text-2xl font-semibold text-primary-500 shadow-sm ring-4 ring-primary-50"
          >
            {doctor.firstName.charAt(0)}
            {doctor.lastName.charAt(0)}
          </span>
        )}
        <h2 className="mt-3 font-semibold text-slate-900">
          Dr. {doctor.firstName} {doctor.lastName}
        </h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {doctor.city}, {doctor.state}
        </p>
        <span className="mt-3 rounded-lg bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-600">
          {doctor.specialization}
        </span>
      </div>

      <CardActions onView={onView} onEdit={onEdit} />
    </article>
  );
}
