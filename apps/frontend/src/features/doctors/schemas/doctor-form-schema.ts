import { z } from 'zod';

import { EMPTY_IMAGE_VALUE } from '@/types/image-field';

import type { ImageFieldValue } from '@/types/image-field';
import type { Doctor } from '../types';

const phoneRegex = /^\+?[1-9]\d{7,14}$/;

/**
 * Mirrors the backend's doctorBodySchema (required fields only), plus
 * `profileImage` — an ImageUploadField value. It isn't meaningfully
 * Zod-validatable (the component validates type/size itself before ever
 * calling onChange), so it's a typed passthrough kept in the same form
 * state as everything else rather than tracked separately.
 */
export const doctorFormSchema = z.object({
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
  specialization: z.string().trim().min(1, 'Specialization is required').max(150),
  qualification: z.string().trim().min(1, 'Qualification is required').max(200),
  licenseNumber: z.string().trim().min(1, 'License number is required').max(100),
  yearsOfExperience: z.coerce.number({ invalid_type_error: 'Enter a number' }).int().min(0),
  department: z.string().trim().min(1, 'Department is required').max(150),
  address: z.string().trim().min(1, 'Address is required').max(300),
  city: z.string().trim().min(1, 'City is required').max(100),
  state: z.string().trim().min(1, 'State is required').max(100),
  country: z.string().trim().min(1, 'Country is required').max(100),
  postalCode: z.string().trim().min(1, 'Postal code is required').max(20),
  profileImage: z.custom<ImageFieldValue>(),
});

export type DoctorFormInput = z.infer<typeof doctorFormSchema>;

/** Maps a doctor DTO into form defaults (ISO datetimes → date-input strings). */
export function doctorToFormDefaults(doctor: Doctor): DoctorFormInput {
  return {
    firstName: doctor.firstName,
    lastName: doctor.lastName,
    email: doctor.email,
    phoneNumber: doctor.phoneNumber,
    gender: doctor.gender,
    dateOfBirth: doctor.dateOfBirth.slice(0, 10),
    specialization: doctor.specialization,
    qualification: doctor.qualification,
    licenseNumber: doctor.licenseNumber,
    yearsOfExperience: doctor.yearsOfExperience,
    department: doctor.department,
    address: doctor.address,
    city: doctor.city,
    state: doctor.state,
    country: doctor.country,
    postalCode: doctor.postalCode,
    profileImage: EMPTY_IMAGE_VALUE,
  };
}
