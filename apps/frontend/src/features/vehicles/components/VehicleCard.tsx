import { CardActions } from '@/components/common/CardActions';
import { ImageCarousel } from '@/components/common/ImageCarousel';
import { Badge } from '@/components/ui/Badge';
import { toAbsoluteFileUrl } from '@/lib/file-url';
import { formatEnumLabel } from '@/lib/utils';

import { VEHICLE_STATUS_VARIANTS, VEHICLE_TYPE_LABELS } from '../types';

import type { Vehicle } from '../types';

interface VehicleCardProps {
  vehicle: Vehicle;
  onView: () => void;
  onEdit: () => void;
  onDelete: () => void;
}

export function VehicleCard({ vehicle, onView, onEdit, onDelete }: VehicleCardProps) {
  return (
    <article className="flex flex-col overflow-hidden rounded-2xl border border-slate-100 bg-white shadow-sm ring-1 ring-transparent transition-all hover:-translate-y-1 hover:shadow-lg hover:ring-primary-100">
      <div className="relative">
        {vehicle.photos.length > 0 ? (
          <ImageCarousel
            rounded={false}
            images={vehicle.photos.map((photo) => ({
              id: photo.id,
              url: toAbsoluteFileUrl(photo.fileUrl),
              alt: `${vehicle.brand} ${vehicle.model}`,
            }))}
          />
        ) : (
          <div
            aria-hidden="true"
            className="flex aspect-video w-full items-center justify-center bg-gradient-to-br from-primary-100 via-white to-primary-50 text-3xl font-semibold text-primary-300"
          >
            {vehicle.brand.charAt(0)}
          </div>
        )}
        <Badge variant={VEHICLE_STATUS_VARIANTS[vehicle.status]} className="absolute left-2 top-2">
          {formatEnumLabel(vehicle.status)}
        </Badge>
      </div>

      <div className="flex flex-1 flex-col items-center px-4 pb-5 pt-4 text-center">
        <h2 className="font-semibold text-slate-900">{vehicle.registrationNumber}</h2>
        <p className="mt-0.5 text-xs text-slate-400">
          {vehicle.brand} {vehicle.model} · {vehicle.manufactureYear}
        </p>
        <span className="mt-3 rounded-lg bg-primary-50 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-primary-600">
          {VEHICLE_TYPE_LABELS[vehicle.vehicleType]}
        </span>
      </div>

      <CardActions onView={onView} onEdit={onEdit} onDelete={onDelete} />
    </article>
  );
}
