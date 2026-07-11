import { useState } from 'react';

import { DetailList } from '@/components/common/DetailList';
import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { isDegenerateImage } from '@/lib/image';
import { formatEnumLabel } from '@/lib/utils';

import { DOCTOR_STATUS_VARIANTS } from '../types';

import type { Doctor } from '../types';

interface DoctorDetailsProps {
  doctor: Doctor;
}

export function DoctorDetails({ doctor }: DoctorDetailsProps) {
  const [imageFailed, setImageFailed] = useState(false);

  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        {doctor.profileImage && !imageFailed ? (
          <img
            src={toAbsoluteFileUrl(doctor.profileImage.fileUrl)}
            alt={`Dr. ${doctor.firstName} ${doctor.lastName}`}
            onError={() => setImageFailed(true)}
            onLoad={(event) => {
              if (isDegenerateImage(event.currentTarget)) {
                setImageFailed(true);
              }
            }}
            className="size-16 rounded-full object-cover ring-2 ring-primary-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-700"
          >
            {doctor.firstName.charAt(0)}
            {doctor.lastName.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-lg font-semibold">
            Dr. {doctor.firstName} {doctor.lastName}
          </p>
          <p className="text-sm text-slate-500">{doctor.specialization}</p>
          <Badge variant={DOCTOR_STATUS_VARIANTS[doctor.availabilityStatus]} className="mt-1">
            {formatEnumLabel(doctor.availabilityStatus)}
          </Badge>
        </div>
      </div>

      <DetailList
        items={[
          { label: 'Email', value: doctor.email },
          { label: 'Phone', value: doctor.phoneNumber },
          { label: 'Gender', value: formatEnumLabel(doctor.gender) },
          { label: 'Date of birth', value: doctor.dateOfBirth.slice(0, 10) },
          { label: 'Qualification', value: doctor.qualification },
          { label: 'License number', value: doctor.licenseNumber },
          { label: 'Department', value: doctor.department },
          { label: 'Experience', value: `${doctor.yearsOfExperience} years` },
          {
            label: 'Address',
            value: `${doctor.address}, ${doctor.city}, ${doctor.state} ${doctor.postalCode}, ${doctor.country}`,
          },
          { label: 'Added', value: new Date(doctor.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
