import type { PaginationMeta } from '@/types/api';
import type { VehicleStatus, VehicleType } from '@/features/vehicles';

export type DriverGender = 'MALE' | 'FEMALE' | 'OTHER';

export type DriverAvailabilityStatus = 'AVAILABLE' | 'ASSIGNED' | 'OFF_DUTY' | 'ON_LEAVE';

export interface FileRef {
  id: string;
  fileUrl: string;
  originalName: string;
}

export interface AssignedVehicleSummary {
  id: string;
  registrationNumber: string;
  vehicleNumber: string;
  vehicleType: VehicleType;
  brand: string;
  model: string;
  status: VehicleStatus;
  isActive: boolean;
}

export interface Driver {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: DriverGender;
  dateOfBirth: string;
  employeeId: string;
  joiningDate: string;
  licenseNumber: string;
  licenseExpiry: string;
  yearsOfExperience: number;
  assignedVehicle?: AssignedVehicleSummary;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: FileRef;
  availabilityStatus: DriverAvailabilityStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export const DRIVER_STATUS_VARIANTS: Record<
  DriverAvailabilityStatus,
  'success' | 'warning' | 'info' | 'neutral'
> = {
  AVAILABLE: 'success',
  ASSIGNED: 'info',
  OFF_DUTY: 'neutral',
  ON_LEAVE: 'warning',
};

/** One-time login credentials returned when a driver account is provisioned. */
export interface ProvisionedLogin {
  email: string;
  defaultPassword: string;
  mustChangePassword: true;
}

export interface DriverCreateResult {
  driver: Driver;
  /** Present when a new user account was provisioned for this driver. */
  login?: ProvisionedLogin;
}

export type DriverListMeta = PaginationMeta;
