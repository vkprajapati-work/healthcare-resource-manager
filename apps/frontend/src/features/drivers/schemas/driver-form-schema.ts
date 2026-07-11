import { z } from 'zod';

import type { Driver } from '../types';

const phoneRegex = /^\+?[1-9]\d{7,14}$/;

/** Mirrors the backend's driverBodySchema (required fields only). */
export const driverFormSchema = z.object({
  firstName: z.string().trim().min(1, 'First name is required').max(100),
  lastName: z.string().trim().min(1, 'Last name is required').max(100),
  email: z.string().trim().min(1, 'Email is required').email('Enter a valid email address'),
  phoneNumber: z
    .string()
    .trim()
    .regex(phoneRegex, 'Enter a valid phone number (e.g. +919876543210)'),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER']),
  dateOfBirth: z
    .string()
    .min(1, 'Date of birth is required')
    .refine((value) => new Date(value) <= new Date(), 'Date of birth cannot be in the future'),
  employeeId: z.string().trim().min(1, 'Employee ID is required').max(100),
  joiningDate: z.string().min(1, 'Joining date is required'),
  licenseNumber: z.string().trim().min(1, 'License number is required').max(100),
  licenseExpiry: z.string().min(1, 'License expiry is required'),
  yearsOfExperience: z.coerce.number({ invalid_type_error: 'Enter a number' }).int().min(0),
  assignedVehicle: z.string().optional(),
  address: z.string().trim().min(1, 'Address is required').max(300),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  country: z.string().trim().min(1, 'Country is required').max(100),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(20),
});

export type DriverFormInput = z.infer<typeof driverFormSchema>;

/** Maps a driver DTO into form defaults (ISO datetimes → date-input strings). */
export function driverToFormDefaults(driver: Driver): DriverFormInput {
  return {
    firstName: driver.firstName,
    lastName: driver.lastName,
    email: driver.email,
    phoneNumber: driver.phoneNumber,
    gender: driver.gender,
    dateOfBirth: driver.dateOfBirth.slice(0, 10),
    employeeId: driver.employeeId,
    joiningDate: driver.joiningDate.slice(0, 10),
    licenseNumber: driver.licenseNumber,
    licenseExpiry: driver.licenseExpiry.slice(0, 10),
    yearsOfExperience: driver.yearsOfExperience,
    assignedVehicle: driver.assignedVehicle?.id ?? '',
    address: driver.address,
    city: driver.city,
    state: driver.state,
    country: driver.country,
    postalCode: driver.postalCode,
  };
}
