import { z } from 'zod';

import type { Vehicle } from '../types';

const currentYear = new Date().getFullYear();

/** Mirrors the backend's vehicleBodySchema (required fields only). */
export const vehicleFormSchema = z.object({
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
  };
}
