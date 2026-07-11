import type { PaginationMeta } from '@/types/api';

export type Gender = 'MALE' | 'FEMALE' | 'OTHER';

export type DoctorAvailabilityStatus = 'AVAILABLE' | 'UNAVAILABLE' | 'ON_LEAVE';

export interface FileRef {
  id: string;
  fileUrl: string;
  originalName: string;
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: Gender;
  dateOfBirth: string;
  specialization: string;
  qualification: string;
  licenseNumber: string;
  department: string;
  yearsOfExperience: number;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: FileRef;
  availabilityStatus: DoctorAvailabilityStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DOCTOR_STATUS_VARIANTS: Record<
  DoctorAvailabilityStatus,
  'success' | 'warning' | 'danger'
> = {
  AVAILABLE: 'success',
  UNAVAILABLE: 'danger',
  ON_LEAVE: 'warning',
};

/** One-time login credentials returned when a doctor/driver account is provisioned. */
export interface ProvisionedLogin {
  email: string;
  defaultPassword: string;
  mustChangePassword: true;
}

export interface DoctorCreateResult {
  doctor: Doctor;
  /** Present when a new user account was provisioned for this doctor. */
  login?: ProvisionedLogin;
}

export type DoctorListMeta = PaginationMeta;
