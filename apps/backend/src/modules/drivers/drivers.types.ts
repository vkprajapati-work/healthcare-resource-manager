import type { Document, Types } from 'mongoose';
import type { DocumentFileCategory, FileDto } from '../files/files.types.js';
import type { VehicleStatus, VehicleType } from '../vehicles/vehicles.types.js';

export const DriverGender = {
  MALE: 'MALE',
  FEMALE: 'FEMALE',
  OTHER: 'OTHER',
} as const;

export type DriverGender = (typeof DriverGender)[keyof typeof DriverGender];

export const DriverAvailabilityStatus = {
  AVAILABLE: 'AVAILABLE',
  ASSIGNED: 'ASSIGNED',
  OFF_DUTY: 'OFF_DUTY',
  ON_LEAVE: 'ON_LEAVE',
} as const;

export type DriverAvailabilityStatus =
  (typeof DriverAvailabilityStatus)[keyof typeof DriverAvailabilityStatus];

export type DriverSortOrder = 'asc' | 'desc';

export type DriverSortBy =
  | 'createdAt'
  | 'updatedAt'
  | 'firstName'
  | 'lastName'
  | 'employeeId'
  | 'joiningDate'
  | 'licenseExpiry'
  | 'yearsOfExperience';

export interface IDriverDocument extends Document {
  _id: Types.ObjectId;
  userId?: Types.ObjectId;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: DriverGender;
  dateOfBirth: Date;
  employeeId: string;
  joiningDate: Date;
  licenseNumber: string;
  licenseExpiry: Date;
  yearsOfExperience: number;
  assignedVehicle?: Types.ObjectId;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: Types.ObjectId;
  documents: Types.ObjectId[];
  availabilityStatus: DriverAvailabilityStatus;
  isActive: boolean;
  deletedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
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
  photos: FileDto[];
}

export interface DriverDto {
  id: string;
  userId?: string;
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
  profileImage?: FileDto;
  documents: FileDto[];
  availabilityStatus: DriverAvailabilityStatus;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ProvisionedLoginDetails {
  email: string;
  defaultPassword: string;
  mustChangePassword: true;
}

export interface DriverCreateResult {
  driver: DriverDto;
  login?: ProvisionedLoginDetails;
}

export interface DriverListQuery {
  page: number;
  limit: number;
  search?: string;
  sortBy: DriverSortBy;
  sortOrder: DriverSortOrder;
  city?: string;
  state?: string;
  availabilityStatus?: DriverAvailabilityStatus;
  isActive?: boolean;
}

export interface DriverListMeta {
  totalItems: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface CreateDriverInput {
  userId?: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  gender: DriverGender;
  dateOfBirth: Date;
  employeeId: string;
  joiningDate: Date;
  licenseNumber: string;
  licenseExpiry: Date;
  yearsOfExperience: number;
  assignedVehicle?: string;
  address: string;
  city: string;
  state: string;
  country: string;
  postalCode: string;
  profileImage?: string;
  documents: string[];
  availabilityStatus: DriverAvailabilityStatus;
  isActive: boolean;
}

export type UpdateDriverInput = Partial<CreateDriverInput>;

export interface DriverFormInput extends CreateDriverInput {
  documentCategories?: DocumentFileCategory[];
}

export interface DriverUpdateFormInput extends UpdateDriverInput {
  documentCategories?: DocumentFileCategory[];
}

export interface DriverUploadedFiles {
  profileImage?: Express.Multer.File[];
  documents?: Express.Multer.File[];
}

export interface DriverAccessContext {
  userId: string;
  role: string;
}
