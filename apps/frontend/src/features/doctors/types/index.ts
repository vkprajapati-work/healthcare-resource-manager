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
  specialization: string;
  qualification: string;
  department: string;
  yearsOfExperience: number;
  city: string;
  state: string;
  profileImage?: FileRef;
  availabilityStatus: DoctorAvailabilityStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

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
