import { EMPTY_IMAGE_VALUE } from '@/types/image-field';

import type { PaginationMeta } from '@/types/api';
import type { ImageFieldValue } from '@/types/image-field';

export type VehicleType =
  'BASIC_AMBULANCE' | 'ADVANCED_AMBULANCE' | 'ICU_AMBULANCE' | 'NEONATAL_AMBULANCE';

export type VehicleStatus = 'AVAILABLE' | 'ASSIGNED' | 'ON_TRIP' | 'MAINTENANCE' | 'INACTIVE';

export const VEHICLE_TYPE_LABELS: Record<VehicleType, string> = {
  BASIC_AMBULANCE: 'Basic Ambulance',
  ADVANCED_AMBULANCE: 'Advanced Ambulance',
  ICU_AMBULANCE: 'ICU Ambulance',
  NEONATAL_AMBULANCE: 'Neonatal Ambulance',
};

export interface FileRef {
  id: string;
  fileUrl: string;
  originalName: string;
}

export interface Vehicle {
  id: string;
  registrationNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  manufactureYear: number;
  color: string;
  seatingCapacity: number;
  patientCapacity: number;
  photos: FileRef[];
  insuranceExpiry: string;
  fitnessExpiry: string;
  pollutionExpiry: string;
  status: VehicleStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const VEHICLE_STATUS_VARIANTS: Record<
  VehicleStatus,
  'success' | 'warning' | 'info' | 'neutral' | 'primary'
> = {
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  ON_TRIP: 'primary',
  MAINTENANCE: 'warning',
  INACTIVE: 'neutral',
};

export type VehicleListMeta = PaginationMeta;

/** One already-saved photo's edit state — composed N times by VehiclePhotosField. */
export interface VehiclePhotoExistingSlot {
  photoId: string;
  value: ImageFieldValue;
}

/**
 * Multi-photo form value: each already-saved photo gets its own slot (kept,
 * replaced, or removed), plus a flat list of brand-new files. Kept as one
 * RHF-registered field (see vehicle-form-schema) rather than parallel
 * useState, so photos are genuinely part of the form like every other field.
 */
export interface VehiclePhotosValue {
  existing: VehiclePhotoExistingSlot[];
  newFiles: File[];
}

export function createInitialVehiclePhotosValue(existingPhotos?: FileRef[]): VehiclePhotosValue {
  return {
    existing: (existingPhotos ?? []).map((photo) => ({
      photoId: photo.id,
      value: EMPTY_IMAGE_VALUE,
    })),
    newFiles: [],
  };
}
