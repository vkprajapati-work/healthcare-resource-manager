import { DetailList } from '@/components/common/DetailList';
import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { formatEnumLabel } from '@/lib/utils';

import { VEHICLE_STATUS_VARIANTS, VEHICLE_TYPE_LABELS } from '../types';

import type { Vehicle } from '../types';

interface VehicleDetailsProps {
  vehicle: Vehicle;
}

export function VehicleDetails({ vehicle }: VehicleDetailsProps) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <p className="text-lg font-semibold">{vehicle.registrationNumber}</p>
        <p className="text-sm text-slate-500">
          {vehicle.brand} {vehicle.model} · {VEHICLE_TYPE_LABELS[vehicle.vehicleType]}
        </p>
        <Badge variant={VEHICLE_STATUS_VARIANTS[vehicle.status]} className="mt-1">
          {formatEnumLabel(vehicle.status)}
        </Badge>
      </div>

      {vehicle.photos.length > 0 ? (
        <ul className="flex flex-wrap gap-2">
          {vehicle.photos.map((photo) => (
            <li key={photo.id}>
              <img
                src={toAbsoluteFileUrl(photo.fileUrl)}
                alt={`${vehicle.brand} ${vehicle.model}`}
                loading="lazy"
                className="size-20 rounded-lg object-cover ring-1 ring-slate-200"
              />
            </li>
          ))}
        </ul>
      ) : null}

      <DetailList
        items={[
          { label: 'Vehicle number', value: vehicle.vehicleNumber },
          { label: 'Manufacture year', value: vehicle.manufactureYear },
          { label: 'Color', value: vehicle.color },
          { label: 'Seating capacity', value: `${vehicle.seatingCapacity} seats` },
          { label: 'Patient capacity', value: `${vehicle.patientCapacity} patients` },
          { label: 'Insurance expiry', value: vehicle.insuranceExpiry.slice(0, 10) },
          { label: 'Fitness expiry', value: vehicle.fitnessExpiry.slice(0, 10) },
          { label: 'Pollution expiry', value: vehicle.pollutionExpiry.slice(0, 10) },
          { label: 'Added', value: new Date(vehicle.createdAt).toLocaleDateString() },
        ]}
      />
    </div>
  );
}
