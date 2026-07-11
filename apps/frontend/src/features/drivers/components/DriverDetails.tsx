import { DetailList } from '@/components/common/DetailList';
import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { formatEnumLabel } from '@/lib/utils';

import { DRIVER_STATUS_VARIANTS } from '../types';

import type { Driver } from '../types';

interface DriverDetailsProps {
  driver: Driver;
}

export function DriverDetails({ driver }: DriverDetailsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div className="flex items-center gap-4">
        {driver.profileImage ? (
          <img
            src={toAbsoluteFileUrl(driver.profileImage.fileUrl)}
            alt={`${driver.firstName} ${driver.lastName}`}
            className="size-16 rounded-full object-cover ring-2 ring-primary-100"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-16 items-center justify-center rounded-full bg-primary-50 text-lg font-semibold text-primary-700"
          >
            {driver.firstName.charAt(0)}
            {driver.lastName.charAt(0)}
          </span>
        )}
        <div>
          <p className="text-lg font-semibold">
            {driver.firstName} {driver.lastName}
          </p>
          <p className="text-sm text-slate-500">Employee {driver.employeeId}</p>
          <Badge variant={DRIVER_STATUS_VARIANTS[driver.availabilityStatus]} className="mt-1">
            {formatEnumLabel(driver.availabilityStatus)}
          </Badge>
        </div>
      </div>

      <DetailList
        items={[
          { label: 'Email', value: driver.email },
          { label: 'Phone', value: driver.phoneNumber },
          { label: 'Gender', value: formatEnumLabel(driver.gender) },
          { label: 'Date of birth', value: driver.dateOfBirth.slice(0, 10) },
          { label: 'Joining date', value: driver.joiningDate.slice(0, 10) },
          { label: 'License number', value: driver.licenseNumber },
          { label: 'License expiry', value: driver.licenseExpiry.slice(0, 10) },
          { label: 'Experience', value: `${driver.yearsOfExperience} years` },
          {
            label: 'Assigned vehicle',
            value: driver.assignedVehicle
              ? `${driver.assignedVehicle.registrationNumber} — ${driver.assignedVehicle.brand} ${driver.assignedVehicle.model}`
              : '—',
          },
          {
            label: 'Address',
            value: `${driver.address}, ${driver.city}, ${driver.state} ${driver.postalCode}, ${driver.country}`,
          },
        ]}
      />
    </div>
  );
}
