import { CardActions } from '@/components/common/CardActions';
import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { formatEnumLabel } from '@/lib/utils';

import { VEHICLE_STATUS_VARIANTS, VEHICLE_TYPE_LABELS } from '../types';

import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onView: () => void;
  onEdit: () => void;
}

export function VehicleCard({ vehicle, onView, onEdit }: VehicleCardProps) {
  return (
    <article className="relative flex flex-col rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-primary-100">
      <Badge variant={VEHICLE_STATUS_VARIANTS[vehicle.status]} className="absolute left-3 top-3">
        {formatEnumLabel(vehicle.status)}
      </Badge>

      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-9 text-center">
        {vehicle.photos[0] ? (
          <img
            src={toAbsoluteFileUrl(vehicle.photos[0].fileUrl)}
            alt=""
            loading="lazy"
            className="size-24 rounded-2xl object-cover shadow-sm ring-4 ring-primary-50"
          />
        ) : (
          <span
            aria-hidden="true"
            className="flex size-24 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-100 to-primary-50 text-2xl font-semibold text-primary-500 shadow-sm ring-4 ring-primary-50"
          >
            {vehicle.brand.charAt(0)}
          </span>
        )}
        <h2 className="mt-3 font-semibold text-slate-900">{vehicle.registrationNumber}</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {vehicle.brand} {vehicle.model} · {vehicle.manufactureYear}
        </p>
        <span className="mt-3 rounded-lg bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-600">
          {VEHICLE_TYPE_LABELS[vehicle.vehicleType]}
        </span>
      </div>

      <CardActions onView={onView} onEdit={onEdit} />
    </article>
  );
}
