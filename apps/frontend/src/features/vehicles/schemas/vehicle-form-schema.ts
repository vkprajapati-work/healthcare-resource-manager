import { z } from 'zod';

import { createInitialVehiclePhotosValue } from '../types';

import type { Vehicle, VehiclePhotosValue } from '../types';

const currentYear = new Date().getFullYear();

/**
 * Mirrors the backend's vehicleBodySchema (required fields only), plus
 * `photos` — a VehiclePhotosValue kept in the same form state as every
 * other field (see doctor-form-schema for why it's a typed passthrough).
 * The "at least one photo" rule is enforced below via superRefine, since
 * it depends on the composed value's shape rather than a single field.
 */
export const vehicleFormSchema = z
  .object({
    registrationNumber: z.string().trim().min(1, 'Registration number is required').max(50),
    vehicleNumber: z.string().trim().min(1, 'Vehicle number is required').max(50),
    vehicleType: z.enum([
      'BASIC_AMBULANCE',
      'ADVANCED_AMBULANCE',
      'ICU_AMBULANCE',
      'NEONATAL_AMBULANCE',
    ]),
    brand: z.string().trim().min(1, 'Brand is required').max(100),
    model: z.string().trim().min(1, 'Model is required').max(100),
    manufactureYear: z.coerce
      .number({ invalid_type_error: 'Enter a year' })
      .int()
      .min(1990, 'Year must be 1990 or later')
      .max(currentYear + 1, `Year cannot exceed ${currentYear + 1}`),
    color: z.string().trim().min(1, 'Color is required').max(50),
    seatingCapacity: z.coerce.number({ invalid_type_error: 'Enter a number' }).int().min(1),
    patientCapacity: z.coerce.number({ invalid_type_error: 'Enter a number' }).int().min(1),
    insuranceExpiry: z.string().min(1, 'Insurance expiry is required'),
    fitnessExpiry: z.string().min(1, 'Fitness expiry is required'),
    pollutionExpiry: z.string().min(1, 'Pollution expiry is required'),
    photos: z.custom<VehiclePhotosValue>(),
  })
  .superRefine((value, ctx) => {
    const keptExisting = (value.photos?.existing ?? []).filter(
      (slot) => !(slot.value.removed && !slot.value.file),
    );
    if (keptExisting.length + (value.photos?.newFiles.length ?? 0) === 0) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        path: ['photos'],
        message: 'Add at least one photo — a vehicle needs at least one.',
      });
    }
  });

export type VehicleFormInput = z.infer<typeof vehicleFormSchema>;

/** Maps a vehicle DTO into form defaults (ISO datetimes → date-input strings). */
export function vehicleToFormDefaults(vehicle: Vehicle): VehicleFormInput {
  return {
    registrationNumber: vehicle.registrationNumber,
    vehicleNumber: vehicle.vehicleNumber,
    vehicleType: vehicle.vehicleType,
    brand: vehicle.brand,
    model: vehicle.model,
    manufactureYear: vehicle.manufactureYear,
    color: vehicle.color,
    seatingCapacity: vehicle.seatingCapacity,
    patientCapacity: vehicle.patientCapacity,
    insuranceExpiry: vehicle.insuranceExpiry.slice(0, 10),
    fitnessExpiry: vehicle.fitnessExpiry.slice(0, 10),
    pollutionExpiry: vehicle.pollutionExpiry.slice(0, 10),
    photos: createInitialVehiclePhotosValue(vehicle.photos),
  };
}
